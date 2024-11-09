import { STATE } from "./utils.js";

export class View {

	constructor(controller) {
		this.controller = controller;
	}

	renders = () => {
		const view = this;
		return {
			card_template: function (onCardClick) {
				const onclick = onCardClick ? `${onCardClick}, '${this.val}${this.suit}')` : '';
				return `<div onclick="${onclick}" class='card ${this.suit}' id="${this.val}${this.suit}">`
							+ this.displayVal + this.suit +
						"</div>";
			},
			ok_button_template: function () {
				return "<input id='warning' class='btn btn-info' type='button' value='Okee Dokee' />";
			},
			hand_template: function (onCardClick) {
				var html_string = "";
				_.each(this.cards, function (card) {
					html_string += view.renders()["card_template"].call(card, onCardClick);
				})
				return (this.cards.length == 0) ? "<h3>empty, no cards</h3>" : html_string;
			},
			player_template: function () {
				return "<div id='" + this.id + "_score'>" + this.name + "'s Score: <span>" + this.score + "</span></div>" +
						"<p>" + this.name + "'s Cards:" + "</p>";
			},
			new_player_template: function ({duration}) {
				const startGame = `controller.submit_player_names()`;
				const getUpdateDuration = (d) => `controller.set_duration('${d}')`;
				const durationButtons = ['short', 'medium', 'long'].map(d => {
					const onclick = getUpdateDuration(d);
					let className = 'btn duration_btn';
					className += duration === d ? ' btn-success' : '';

					return `<button onclick="${onclick}" class='${className}' value='${d}'>${d}</button>`;
				})
				return (
					"<div class='col-md-4'></div>" +
						"<div class='col-md-4'>" +
							"<div>" +
									"<h4>Please Enter Two Player Names</h4>" +
									"<div class='form-group'>" +
											"<div class='col-md-12'>" +
												"<input type='text' class='form-control' id='player1_name' maxlength='20' placeholder='Player One' value='Ralph'>" +
											"</div>" +
									"</div>" +
									"<div class='form-group'>" +
											"<div class='col-md-12'>" +
												"<input type='text' class='form-control' id='player2_name' maxlength='20' placeholder='Player Two' value='Stevie'>" +
											"</div>" +
									"</div>" +
									"<h4>Please Select a Game Length</h4>" +
									`<div>${duration}</div>` +
									"<div class='form-group'>" +
										durationButtons.join(' ') +
									"</div>" +
									"<div class='form-group'>" +
										"<div class='col-md-12'>" +
											`<button id='start_btn' onclick="${startGame}" class='btn btn-info'>Start Game</button>` +
											"</div>" +
									"</div>" +
							"</div>" +
						"</div>" +
						"<div class='col-md-4'></div>"
				);
			},
			game_template: function ({game}) {
				const isDiscarding = game.state === STATE.discarding;
				const onCardClick = isDiscarding ? 'controller.discard_card' : 'controller.play_card';
				const playerOneCardClick = `${onCardClick}('${game.players[0].id}'`;
				const playerTwoCardClick = `${onCardClick}('${game.players[1].id}'`;
				const messages = isDiscarding ? [view.controller.discard_msg()] : [view.controller.play_msg()]
				return 	"<div id='prompt'>" +
							"<h3>" +
								messages.join(" ") +
							"</h3>" +
						"</div>" +
						"<div id='game'>" +
							"<div class='col-md-4' id='" + game.players[0].id + "'>" +
									view.renders()["player_template"].call(game.players[0]) +
									view.renders()["hand_template"].call(game.players[0].hand, playerOneCardClick) +
							"</div>" +
							"<div class='col-md-4' id='pile'>" +
									"<p>Pile Score: " + game.pile.score + "</p>" +
									"<p>Pile Cards:</p>" +
									view.renders()["hand_template"].call(game.pile) +
									"<canvas id='board' width='' height=''>Your browser cannot display the game board!</canvas>" +
							"</div>" +
							"<div class='col-md-4' id='" + game.players[1].id +"'>" +
									view.renders()["player_template"].call(game.players[1]) +
									view.renders()["hand_template"].call(game.players[1].hand, playerTwoCardClick) +
							"</div>" +
						"</div>";
			},
			crib_template: function ({ game }) {
				const onCardClick = 'controller.noop';
				return "<div id='crib'><p>" + game.dealer.name + "'s Crib: </p>" +
					view.renders()["hand_template"].call(game.dealer.crib, onCardClick ) +
				"</div>";
			},
			score_table_template: function (scores, el_id){
				var $table = $("<table id='" + el_id + "_score_table' class='table table-striped table-condensed'></table>");
				if (scores.length == 0) {
					$table.append("<tr><td>bummer. nothing scored.</td></tr>");
				} else {
					_.each(scores, function (score) {
						$table.append(view.renders()["score_row_template"].call(this, score));
					})
				}
				return $table;
			},
			score_row_template: function (score) {
				return "<tr><td>" + score[0].val + score[0].suit + "</td><td>+</td><td>" + score[1].val + score[1].suit +
					"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
			},
			bummer_template: function () {
				return "<tr><td>bummer. nothing scored.</td></tr>";
			}
		}
	};
};
