(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var View = CRIBBAGE.View = function () {
		var view = this;
		view.renders = {
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
	 			$("#cribbage").empty();
				return 	"<div class='col-md-4'></div>" +
						"<div class='col-md-4'>" +
							"<form id='create_players' class='form-horizontal' role='form'>" + 
								  "<h4>Please Enter Two Player Names</h4>" +
								  "<div class='form-group'>" + 
									    "<div class='col-md-12'>" +
									      "<input type='text' class='form-control' id='player1_name' maxlength='20' placeholder='Player One'>" +
									    "</div>" +
								  "</div>" +
								  "<div class='form-group'>" + 
									    "<div class='col-md-12'>" +
									      "<input type='text' class='form-control' id='player2_name' maxlength='20' placeholder='Player Two'>" +
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
								messages.join(" ") + 
							"</h3>" + 
						"</div>" + 
						"<div id='game'>" +
							"<div class='col-md-4' id='" + game.players[0].id + "'>" +
									view.renders["player_template"].call(game.players[0]) +
									view.renders["hand_template"].call(game.players[0].hand) +
							"</div>" +
							"<div class='col-md-4' id='pile'>" + 
									"<p>Pile Score: " + game.pile.score + "</p>" +
									"<p>Pile Cards:</p>" +
									view.renders["hand_template"].call(game.pile) +
							"</div>" +
							"<div class='col-md-4' id='" + game.players[1].id +"'>" +
									view.renders["player_template"].call(game.players[1]) +
									view.renders["hand_template"].call(game.players[1].hand) +
							"</div>" +
						"</div>";
			},
			crib_template: function () {
				return "<div id='crib'><p>" + this.dealer.name + "'s Crib: </p>" +
					view.renders["hand_template"].call(this.dealer.crib) +
				"</div>";
			},
			score_table_template: function (scores, el_id){
				var $table = $("<table id='" + el_id + "_score_table' class='table table-striped table-condensed'></table>");
				if (scores.length == 0) {
					$table.append("<tr><td>bummer. nothing scored.</td></tr>");
				} else {
					_.each(scores, function (score) {
						$table.append(view.renders["score_row_template"].call(this, score));
					})
				}
				return $table;
			},
			score_row_template: function (score) {
				return "<tr><td>" + score[0] + "</td><td>+</td><td>" + score[1] + 
					"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
			}
		};
	};
})(this);
