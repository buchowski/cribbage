(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function (player1, player2) {
		this.game = new CRIBBAGE.Game(player1, player2, this);
	}
	View.empty_view = function () {
		$('.view').empty();
	}
	View.card_template = function (card) {
		return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>" + card.val + card.suit + "</div>";
	}
	View.player_template = function (player) {
		return "<div class='view name' id='" + player.name + "'><h1>" + player.name + "'s Cards:" + "</h1></div>";
	}
	View.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	}
	View.prototype.render = function () {
		var game = this.game;
		$("#game").empty();
		$('#game').append("<h1>" + game.round.dealer.name + " is the dealer</h1>");
		$("#game").append("<h1>Cut Card:</h1>" + View.card_template(game.deck.cut_card));

		_.each(game.players, function (player) {
			$('#game').append(View.player_template(player));
			_.each(player.hand.cards, function (card) {
				$('#' + player.name).append(View.card_template(card));
			})
		})
		this.bind_clicks();
	}
	View.prototype.start = function () {
		var game = this.game;

		game.deck.cut();
		game.deck.shuffle();
		game.deal();

		this.render();
	}
	View.prototype.bind_clicks = function () {
		var game = this.game;
		var view = this;
		var discard = function () {
			var card = View.get_val_suit($(this));
			game.round.current_player.discard(card[0], card[1], function () { 
				view.render(); 
			});
		};
		$("#" + game.round.current_player.name).on('click', '.card', discard);
	}
})(this);
