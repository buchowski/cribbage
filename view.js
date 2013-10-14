// The function's in this file should only return html strings
(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	// var View = CRIBBAGE.View = function (player1, player2) {
	// 	this.game = new CRIBBAGE.Game(player1, player2, this);
	// };

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
		return html_string;
	};
	View.player_template = function (player) {

		return "<p class='name'>" + 
					player.name + "'s Score: " + player.score + 
				"</p>" +
				"<p>" + 
					player.name + "'s Cards:" + 
				"</p>";
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
		return "<form id='create_players'>" + 
					"<label for='player1'>Player 1</label>" +
						"<input type='text' id='player1'></input>" +
					"<label for='player2'>Player 2</label>" +
						"<input type='text' id='player2'></input>" +
					"<input type='submit' value='Create Players'></input>" +
				"</form>" +
				"<div id='game'></div>"
	};
	View.discard_template = function (game) {
		html_string = "<div class='name' id='crib'><p>" + game.dealer.name + "'s Crib: " +
							View.hand_template(game.dealer.crib) +
						"</div>" + 
						"<p class='name'>" + 
							game.current_player.name + ", rid thyself of a card!" + 
						"<p>";
		_.each(game.players, function (player) {
			html_string += View.player_template(player) +
							"<div class='name' id='" + player.id + "'>" + 
								View.hand_template(player.hand) +
							"</div>";
		})
		return html_string;
	};
	View.play_template = function (game) {
		html_string = "<div class='name' id='crib'><p>" + game.dealer.name + "'s Crib:</p>" +
							View.hand_template(game.dealer.crib) +
						"</div>" + 
						"<p class='name'>" + 
							game.current_player.name + ", slap a card down on thy battlefield!" + 
						"<p>" +
						"<div class='name' id='pile'><p>Cards of the Pile:</p>" +
							View.hand_template(game.pile) +
						"</div>" ;
		_.each(game.players, function (player) {
			html_string += View.player_template(player) +
							"<div class='name' id='" + player.id + "'>" + 
								View.hand_template(player.hand) +
							"</div>";
		})
		return html_string;
	};

	// 		4 messages for the msg_template:
	// 		msg += round.other_player.name + " can't play a card so it's still " + round.current_player.name + "'s turn.";
	// 		msg += (pile.score == 31) ? " gets 2 points for 31!" : " gets point for last card.";
	// 		msg += " The round is over.";
	// 		msg += round.other_player.name + " has no cards so it's still " + round.current_player.name + "'s turn.";


	// View.empty_view = function () {
	// 	$('.view').empty();
	// };
	// View.get_val_suit = function($el) {
	// 	var val = $el.attr('id')[0];
	// 	var val = ( val == '1') ? '10' : val;
	// 	var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
	// 	return [val, suit];
	// };
	// View.prototype.render = function (msg = null, callback = null) {
	// 	var view = this;
	// 	var game = view.game;
		
	// 	$("#game").empty();

	// 	_.each([game.pile, game.players[0], game.players[1]], function (player) {
	// 		$('#game').append(View.player_template(player));
	// 		_.each(player.hand.cards, function (card) {
	// 			$("#" + player.name).append(View.card_template(card));
	// 		})
	// 	})

	// 	$("#game").append(View.prompt_template(game.round.current_player.name, ", please discard a card."));
	// 	if (msg !== null) {
	// 		$("#game").prepend(View.msg_template(msg));
	// 		$("#ok_error").on('click', function () {
	// 			$('#error_msg').hide(400, function () {
	// 				if (callback !== null) { callback(); } //pile.reset_score.bind(pile), pile.return_cards_to_players.bind(pile);
	// 				view.render();
	// 			});
	// 		})
	// 	} else {
	// 		view.bind_clicks();
	// 	}
	// };
	// View.prototype.start = function () {
	// 	var game = this.game;
	// 	game.deck.cut();
	// 	game.deck.shuffle();
	// 	game.deal();
	// 	this.render();
	// };
	// View.prototype.bind_clicks = function () {
	// 	var view = this;
	// 	var game = view.game;
	// 	var count = game.round.discard_count;

	// 	$("#" + game.round.current_player.name).on('click', '.card', function () {
	// 		var card = View.get_val_suit($(this));
	// 		var render = view.render.bind(view);
	// 		(count < 4) ? game.deck.push(card, render) : game.pile.push(card, render) ;
	// 	})
	// };
})(this);
