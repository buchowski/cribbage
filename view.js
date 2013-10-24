(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function () {
		var view = this;
		view.renders = {
			// msg's do not contain html, just messages. in a msg, 'this' is always the game
			play_msg: function () {
				return this.current_player.name + ", slap a card down on thy battlefield!";
			},
			discard_msg: function () {
				return this.current_player.name + ", rid thyself of a card!";
			},
			fifteen_msg: function () {
				return this.current_player.name + " gets 2 points for 15!";
			},
			still_your_turn_msg: function () {
				return this.current_player.name + " it's still your turn. " + this.other_player().name + "can't play a card.";
			},
			point_for_last_card_msg: function () {
				return this.current_player.name + " gets a point or two for last card.";
			},
			both_hands_empty_msg: function () {
				return  "both players' hands are empty. Let's score our hands and the crib now.";
			},
			invalid_card_msg: function () {
				return this.current_player.name + ", you cannot play that card!";
			},
			// templates contain html
			card_template: function () {
				return "<div class='card " + this.suit + "' id='" + this.val + this.suit + "'>" 
							+ this.val + this.suit + 
						"</div>";
			},
			ok_button_template: function () {
				return "<input id='warning' class='btn btn-info' type='button' value='Okee Dokee' />";
			},
			hand_template: function () {
				var html_string = "";
				_.each(this.cards, function (card) {
					html_string += view.renders["card_template"].call(card);
				})
				return (this.cards.length == 0) ? "<h3>empty, no cards</h3>" : html_string;
			},
			player_template: function () {
				return "<p>" + this.name + "'s Score: " + this.score + "</p>" +
						"<p>" + this.name + "'s Cards:" + "</p>";
			},
			new_player_template: function () {
				return 	"<div class='col-md-4'></div>" +
						"<div class='col-md-4'>" +
							"<form id='create_players' class='form-horizontal' role='form'>" + 
								  "<h4>Please Enter Two Player Names</h4>" +
								  "<div class='form-group'>" + 
									    "<div class='col-md-12'>" +
									      "<input type='text' class='form-control' id='player1_name' placeholder='Player One'>" +
									    "</div>" +
								  "</div>" +
								  "<div class='form-group'>" + 
									    "<div class='col-md-12'>" +
									      "<input type='text' class='form-control' id='player2_name' placeholder='Player Two'>" +
									    "</div>" +
								  "</div>" +
								  "<div class='form-group'>" +
								    "<div class='col-md-10'>" +
								      "<button type='submit' class='btn btn-info'>Start Game</button>" +
								    "</div>" +
								  "</div>" +
							"</form>" +
						"</div>" +
						"<div class='col-md-4'></div>";
			},
			 game_template: function (messages) {
			 	var game = this;
				return 	"<div id='prompt'>" + 
							"<h3>" + 
								_.map(messages, function (msg) {
									return view.renders[msg].call(game);
								}).join(" ") + 
							"</h3>" + 
						"</div>" + 
						"<div id='game'>" +
							"<div class='col-md-4'>" +
								"<div id='" + this.players[0].id + "'>" + 
									view.renders["player_template"].call(this.players[0]) +
									view.renders["hand_template"].call(this.players[0].hand) +
								"</div>" + 
								"<div id='crib'><p>" + this.dealer.name + "'s Crib: </p>" +
									view.renders["hand_template"].call(this.dealer.crib) +
								"</div>" + 
							"</div>" +
							"<div class='col-md-4'>" + 
									"<div id='pile'>" + 
									"<p>Pile Score: " + this.pile.score + "</p>" +
									"<p>Pile Cards:</p>" +
									view.renders["hand_template"].call(this.pile) +
								"</div>" +
							"</div>" +
							"<div class='col-md-4' id='" + this.players[1].id + "'>" + 
								view.renders["player_template"].call(this.players[1]) +
								view.renders["hand_template"].call(this.players[1].hand) +
							"</div>" +
						"</div>";
			}
		};
	};
})(this);
