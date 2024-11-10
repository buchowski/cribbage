import { STATE } from "./utils.js";

export class View {

	constructor(controller) {
		this.controller = controller;
	}

	renders = () => {
		const view = this;
		return {
			card_template: function (onCardClick) {
				const isNoop = !onCardClick || onCardClick.includes('noop');
				const onclick = isNoop ? 'controller.noop()' : `${onCardClick}, '${this.val}${this.suit}')`;
				return `<div onclick="${onclick}" class='card ${this.suit}' id="${this.val}${this.suit}">`
							+ this.displayVal + this.suit +
						"</div>";
			},
			ok_button_template: function (game) {
				if (game.state !== STATE.scoring) return '';

				const onclick = 'controller.new_round()';
				const text = 'Begin Next Round';
				return `<input onclick="${onclick}" id='warning' class='btn btn-info' type='button' value='${text}' />`;
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
				const playerOne = game.players[0];
				const playerTwo = game.players[1];
				const playerOneCardClick = `${onCardClick}('${playerOne.id}'`;
				const playerTwoCardClick = `${onCardClick}('${playerTwo.id}'`;
				const messages = game.messages ? `<h4>${game.messages.join(' ')}</h4>` : '';

				return 	"<div id='prompt'>" +
							"<h3>" +
								game.pagePrompt +
							"</h3>" +
							messages +
							view.renders()["ok_button_template"](game) +
						"</div>" +
						"<div id='game'>" +
							"<div class='' id='" + playerOne.id + "'>" +
									view.renders()["score_table_template"](game, playerOne, 'hand') +
									view.renders()["score_table_template"](game, playerOne, 'crib') +
									view.renders()["player_template"].call(playerOne) +
									view.renders()["hand_template"].call(playerOne.hand, playerOneCardClick) +
									view.renders()["crib_template"]({ game, player: playerOne }) +
							"</div>" +
							"<div class='' id='pile'>" +
									"<p>Pile Score: " + game.pile.score + "</p>" +
									"<p>Pile Cards:</p>" +
									view.renders()["hand_template"].call(game.pile) +
									"<canvas id='board' width='' height=''>Your browser cannot display the game board!</canvas>" +
							"</div>" +
							"<div class='' id='" + playerTwo.id +"'>" +
									view.renders()["score_table_template"](game, playerTwo, 'hand') +
									view.renders()["score_table_template"](game, playerTwo, 'crib') +
									view.renders()["player_template"].call(playerTwo) +
									view.renders()["hand_template"].call(playerTwo.hand, playerTwoCardClick) +
									view.renders()["crib_template"]({ game, player: playerTwo }) +
							"</div>" +
						"</div>";
			},
			crib_template: function ({ game, player }) {
				const isPlayerDealer = player.id === game.dealer.id;
				const onCardClick = 'controller.noop';

				if (!isPlayerDealer) return '';

				return "<div id='crib'><p>" + game.dealer.name + "'s Crib: </p>" +
					view.renders()["hand_template"].call(game.dealer.crib, onCardClick ) +
				"</div>";
			},
			score_table_template: function (game, player, handType) {
				const isCrib = handType === 'crib';

				if (game.state !== STATE.scoring) return '';
				if (isCrib && player !== game.dealer) return '';

				const scores = isCrib ? player.crib.scores : player.handCopy.scores;
				let content = `<h3>${player.name}'s ${handType}</h3>`;

				if (scores.length) {
					scores.forEach(score => {
						content += view.renders()["score_row_template"].call(this, score);
					})
				} else {
					content += '<tr><td>bummer. nothing scored.</td></tr>';
				}

				return `<table class='table table-striped table-condensed'>${content}</table>`
			},
			score_row_template: function (score) {
				return "<tr><td>" + score[0].displayVal + score[0].suit + "</td><td>+</td><td>" + score[1].displayVal + score[1].suit +
					"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
			},
			// bummer_template: function () {
			// 	return "<tr><td>bummer. nothing scored.</td></tr>";
			// },
			draw_board: function ({game}) {
				var canvas = document.getElementById("board");
				if (!canvas) return null;
				var ctx = canvas.getContext("2d");

				canvas.height = canvas.width * 1.5;

				ctx.fillStyle = "rgb(125,80,20)";
				ctx.beginPath();
				ctx.moveTo(10, canvas.height - 10);
				ctx.lineTo(10, 10);
				ctx.lineTo(canvas.width - 10, 10);
				ctx.lineTo(canvas.width - 10, canvas.height - 10);
				ctx.lineTo((canvas.width / 2) - 20, canvas.height - 10);
				ctx.lineTo((canvas.width / 2) - 20, canvas.height / 2);
				ctx.lineTo((canvas.width /2), canvas.height / 2);
				ctx.lineTo((canvas.width /2), canvas.height - 30);
				ctx.lineTo(canvas.width - 30, canvas.height - 30);
				ctx.lineTo(canvas.width - 30, 30);
				ctx.lineTo(30, 30);
				ctx.lineTo(30, canvas.height - 10);
				ctx.fill();

				ctx.fillStyle = "rgb(175,130,70)";
				ctx.beginPath();
				ctx.moveTo(30, canvas.height - 10);
				ctx.lineTo(30, 30);
				ctx.lineTo(canvas.width - 30, 30);
				ctx.lineTo(canvas.width - 30, canvas.height - 30);
				ctx.lineTo((canvas.width / 2), canvas.height - 30);
				ctx.lineTo((canvas.width / 2), canvas.height / 2);
				ctx.lineTo((canvas.width /2) + 20, canvas.height / 2);
				ctx.lineTo((canvas.width /2) + 20, canvas.height - 50);
				ctx.lineTo(canvas.width - 50, canvas.height - 50);
				ctx.lineTo(canvas.width - 50, 50);
				ctx.lineTo(50, 50);
				ctx.lineTo(50, canvas.height - 10);
				ctx.fill();

				ctx.fillText("Cut Card: " + game.cut_card?.val + game.cut_card?.suit, 70, 70);
				ctx.fillText("Start", 60, canvas.height - 20);
				ctx.fillText("Finish", canvas.width / 2 - 30, canvas.height / 2 - 20);
			}
		}
	};
};
