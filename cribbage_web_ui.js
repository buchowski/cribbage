(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function (player1, player2) {
		this.game = new CRIBBAGE.Game(player1, player2, this);
	};
	View.empty_view = function () {
		$('.view').empty();
	};
	View.card_template = function (card) {
		return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>" + card.val + card.suit + "</div>";
	};
	View.player_template = function (player) {
		return "<p class='name'>" + player.name + "'s Score: " + player.score + "</p>" +
				"<div class='name' id='" + player.name + "'><p>" + player.name + "'s Cards:" + "</p></div>";
	};
	View.prompt_template = function (name, msg) {
		return "<p class='name'>" + name + msg + "</p>";
	};
	View.msg_template = function (msg) {
		return "<div id='error_msg'><p id='error'>" + msg + 
			"</p><input type='button' id='ok_error' value='Okee Dokee'></input></div>";
	};
	View.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
	View.prototype.render = function (msg = null, callback = null) {
		var view = this;
		var game = view.game;
		var non_dealer = (game.round.dealer == game.players[0]) ? game.players[1] : game.players[0];
		
		$("#game").empty();
		// $('#game').append("<p>" + game.round.dealer.name + " is the dealer</p>");
		// $("#game").append("<p>Cut Card:</p>" + View.card_template(game.deck.cut_card));

		_.each([game.pile, game.players[0], game.players[1]], function (player) {
			$('#game').append(View.player_template(player));
			_.each(player.hand.cards, function (card) {
				$('#' + player.name).append(View.card_template(card));
			})
		})

		$("#game").append(View.prompt_template(game.round.current_player.name, ", please discard a card."));
		if (msg !== null) {
			$("#game").prepend(View.msg_template(msg));
			$("#ok_error").on('click', function () {
				$('#error_msg').hide(400, function () {
					if (callback !== null) { callback(); }
					view.render();
				});
			})
		} else {
			view.bind_clicks();
		}
	}
	View.prototype.start = function () {
		var game = this.game;
		game.deck.cut();
		game.deck.shuffle();
		game.deal();
		this.render();
	};
	View.prototype.bind_clicks = function () {
		var view = this;
		var game = view.game;
		var count = game.round.discard_count;
		var name = game.round.current_player.name;

		$("#" + name).on('click', '.card', function () {
			var card = View.get_val_suit($(this));
			var render = view.render.bind(view);
			(count < 4) ? game.deck.push(card, render) : game.pile.push(card, render) ;
		})
	};
})(this);
