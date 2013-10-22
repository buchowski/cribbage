(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function () {};

	View.card_template = function (card) {
		return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>" 
					+ card.val + card.suit + 
				"</div>";
	};
	View.hand_template = function (hand) {
		var html_string = "";
		_.each(hand.cards, function (card) {
			html_string += View.card_template(card);
		})
		return (hand.cards.length == 0) ? "<h1>empty, no cards</h1>" : html_string;
	};
	View.player_template = function (player) {
		return "<p>" + player.name + "'s Score: " + player.score + "</p>" +
				"<p>" + player.name + "'s Cards:" + "</p>";
	};
	View.prompt_template = function (name, msg) {
		return "<p class='name'>" + 
					name + msg + 
				"</p>";
	};
	View.msg_template = function (msg) {
		return "<div id='error_msg'>" + 
					"<p id='error'>" + 
						msg + 
					"</p>" + 
					"<input type='button' id='ok_error' value='Okee Dokee'></input>" + 
				"</div>";
	};
	View.new_player_template = function () {
		return "<div class='col-md-4'></div>" +
					"<div class='col-md-4'>" +
						"<form id='create_players'>" + 
							"<div id='player1'>" +
								"<label for='player1_name'>Player 1</label>" +
									"<input type='text' id='player1_name'></input>" +
							"</div>" +
							"<div id='player2'>" +
								"<label for='player2_name'>Player 2</label>" +
									"<input type='text' id='player2_name'></input>" +
							"</div>" +
							"<input type='submit' value='Create Players'></input>" +
						"</form>" +
					"</div>" +
					"<div class='col-md-4'></div>";
	};
	View.main_template = function (game, msg) {
		return 	"<div id='prompt'><h1>" + game.current_player.name + ", " + msg + "</h1></div>" + 
				"<div class='col-md-4'>" +
					"<div id='" + game.players[0].id + "'>" + 
						View.player_template(game.players[0]) +
						View.hand_template(game.players[0].hand) +
					"</div>" + 
					"<div id='crib'><p>" + game.dealer.name + "'s Crib: </p>" +
						View.hand_template(game.dealer.crib) +
					"</div>" + 
				"</div>" +
				"<div class='col-md-4'>" + 
						"<div id='pile'>" + 
						"<p>Pile Score: " + game.pile.score + "</p>" +
						"<p>Pile Cards:</p>" +
						View.hand_template(game.pile) +
					"</div>" +
				"</div>" +
				"<div class='col-md-4' id='" + game.players[1].id + "'>" + 
					View.player_template(game.players[1]) +
					View.hand_template(game.players[1].hand) +
				"</div>";
	};
})(this);
