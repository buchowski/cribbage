import { Card, Card_Collection, Player, Game } from './model';

export class View {
	constructor() {}
	card_template(card : Card) : string {
		return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>" 
					+ card.val + card.suit + 
				"</div>";
	}
	ok_button_template() : string {
		return "<input id='warning' class='btn btn-info' type='button' value='Okee Dokee' />";
	}
	hand_template(cardCollection : Card_Collection) : string {
		let cards = cardCollection.cards;
		let html_string = "";

		for (let card of cards) {
			html_string += this.card_template(card);
		}
		return (cards.length == 0) ? "<h3>empty, no cards</h3>" : html_string;
	}
	player_template(player : Player) : string {
		return "<div id='" + player.id + "_score'>" + player.name + "'s Score: <span>" + player.score + "</span></div>" +
				"<p>" + player.name + "'s Cards:" + "</p>";
	}
	new_player_template() : string {
			// $("#cribbage").empty();
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
						  "<h4>Please Select a Game Length</h4>" +
						  "<div class='form-group'>" +
							  "<div class='col-md-4'><button class='btn duration_btn btn-success' value='short'>Short</button></div>" +
								  "<div class='col-md-4'><button class='btn duration_btn' value='medium'>Medium</button></div>" +
							  "<div class='col-md-4'><button class='btn duration_btn' value='long'>Long</button></div>" +
							"</div>" +	
						  "<div class='form-group'>" +
						  	"<div class='col-md-12'>" +
						      "<button id='start_btn' type='submit' class='btn btn-info'>Start Game</button>" +
						     "</div>" +
						  "</div>" +
					"</form>" +
				"</div>" +
				"<div class='col-md-4'></div>";
	}
	game_template(messages : string[], game : Game) : string {
		return 	"<div id='prompt'>" + 
					"<h3>" + 
						messages.join(" ") + 
					"</h3>" + 
				"</div>" + 
				"<div id='game'>" +
					"<div class='col-md-4' id='" + game.players[0].id + "'>" +
							this.player_template(game.players[0]) +
							this.hand_template(game.players[0].hand) +
					"</div>" +
					"<div class='col-md-4' id='pile'>" + 
							"<p>Pile Score: " + game.pile.score + "</p>" +
							"<p>Pile Cards:</p>" +
							this.hand_template(game.pile) +
							"<canvas id='board' width='' height=''>Your browser cannot display the game board!</canvas>" +
					"</div>" +
					"<div class='col-md-4' id='" + game.players[1].id +"'>" +
							this.player_template(game.players[1]) +
							this.hand_template(game.players[1].hand) +
					"</div>" +
				"</div>";
	}
	crib_template(dealer : Player) : string {
		return "<div id='crib'><p>" + dealer.name + "'s Crib: </p>" +
			this.hand_template(dealer.crib) +
		"</div>";
	}
	score_table_template(scores : any[], el_id : string) {
		let $table = $("<table id='" + el_id + "_score_table' class='table table-striped table-condensed'></table>");

		if (scores.length == 0) {
			$table.append("<tr><td>bummer. nothing scored.</td></tr>");
		} else {
			for (let score of scores) {
				$table.append(this.score_row_template(score));
			}
		}
		return $table;
	}
	score_row_template(score : any[]) : string {
		return "<tr><td>" + score[0].val + score[0].suit + "</td><td>+</td><td>" + score[1].val + score[1].suit +
			"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
	}
	bummer_template() : string {
		return "<tr><td>bummer. nothing scored.</td></tr>";
	}
}