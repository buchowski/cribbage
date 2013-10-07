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
		return "<h1 class='name'>" + player.name + "'s Score: " + player.score + "</h1>" +
				"<div class='name' id='" + player.name + "'><h1>" + player.name + "'s Cards:" + "</h1></div>";
	};
	View.prompt_template = function (name, msg) {
		return "<h1 class='name'>" + name + msg + "</h1>";
	};
	View.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
	View.prototype.render = function () {
		var game = this.game;
		$("#game").empty();
		$('#game').append("<h1>" + game.round.dealer.name + " is the dealer</h1>");
		$("#game").append("<h1>Cut Card:</h1>" + View.card_template(game.deck.cut_card));

		_.each([game.pile, game.players[0], game.players[1]], function (player) {
			$('#game').append(View.player_template(player));
			_.each(player.hand.cards, function (card) {
				$('#' + player.name).append(View.card_template(card));
			})
		})
		$("#game").append(View.prompt_template(game.round.current_player.name, ", please discard a card."));
		this.bind_clicks();
	}
	View.prototype.start = function () {
		var game = this.game;

		game.deck.cut();
		game.deck.shuffle();
		game.deal();

		this.render();
	};
	View.prototype.bind_clicks = function () {
		var game = this.game;
		var view = this;
		var count = game.round.discard_count;
		// var group = (game.round.discard_count < 4) ? game.round.dealer.crib : game.pile;
		var name = game.round.current_player.name;

		if (count < 4) {
			$("#" + name).on('click', '.card', function () {
				var card = View.get_val_suit($(this));
				game.deck.push(card);
				view.render();
			})
		} else if (count < 12) {
			$("#" + name).on('click', '.card', function () {
				var card = View.get_val_suit($(this));
				game.pile.push(card);
				view.render();
			})
		} else {
			alert("el fin del partido");
		}

		// $("#" + game.round.current_player.name).on('click', '.card', function () {
		// 	var card = View.get_val_suit($(this));
		// 	game.round.current_player.discard(card[0], card[1], group, view.render.bind(view));
		// });
	};
})(this);
