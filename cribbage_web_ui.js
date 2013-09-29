(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function (player1, player2) {
		this.game = new CRIBBAGE.Game(player1, player2);
	}
	View.prototype.render = function () {
		// var view = this;
		var game = this.game;
		var player1 = game.player1;
		var player2 = game.player2;

		$('#dealer_name').append("<h1>" + game.dealer.name + " is the dealer</h1>");
		$('#player1_name').append("<h1>" + player1.name + "'s Cards:</h1>");
		$('#player2_name').append("<h1>" + player2.name + "'s Cards:</h1>");
		_.each(player1.hand.cards, function (card) {
			$('#player1_cards').append(View.card_template(card));
		})
		_.each(player2.hand.cards, function (card) {
			$('#player2_cards').append(View.card_template(card));
		})
		$("#cut_card").append("<h1>Cut Card:</h1>" + View.card_template(game.deck.cut_card));
	}
	View.prototype.start = function () {
		var game = this.game;

		game.deck.cut();
		game.deck.shuffle();
		game.deal();

		this.render();
	}
	View.card_template = function (card) {
		return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>" + card.val + card.suit + "</div>";
	}
})(this);


// if (game.current_player == player1 ) {
// 			$("#player1_cards").on('click', '.card', discard(game));
// 		} else {
// 			$("#player2_cards").on('click', '.card', discard(game));
// 		}
	
// 		$("#game_prompt").append("<h1 class='name'>" + game.current_player.name + ", click two cards you'd like to discard.</h1>");
		
// function discard(e) {
// 	var val = $(e.target).attr('id')[0];
// 	if (val == '1') {
// 		val = 10;
// 		var suit = $(e.target).attr('id')[2];
// 	} else {
// 		var suit = $(e.target).attr('id')[1];
// 	}
// 	game.current_player.discard(val, suit, game, function () { 
// 		$('#' + this.val + this.suit).remove();
// 	});
// }