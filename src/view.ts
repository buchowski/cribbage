import { STATE } from "./utils.js";
import { Controller } from "./controller.js";
import {Player, Game, Hand, Pile} from "./model.js";
import { CardType, ScoreRecordType } from "./types.js";

export class View {
	controller
	constructor(controller: Controller) {
		this.controller = controller;
	}

	renders = () => {
		const view = this;
		return {
			card_template: function (card: CardType, onCardClick: string | null): string {
				const isNoop = !onCardClick || onCardClick.includes('noop');
				const onclick = isNoop ? 'controller.noop()' : `${onCardClick}, '${card.val}${card.suit}')`;
				return `<div onclick="${onclick}" class='card ${card.suit}' id="${card.val}${card.suit}">`
							+ card.displayVal + card.suit +
						"</div>";
			},
			ok_button_template: function (game: Game) {
				if (game.state !== STATE.scoring) return '';

				const onclick = 'controller.new_round()';
				const text = 'Begin Next Round';
				return `<input onclick="${onclick}" id='warning' class='btn btn-info' type='button' value='${text}' />`;
			},
			hand_template: function (hand: Hand | Pile | undefined, onCardClick: string | null) {
				const cards = hand?.cards ?? [];
				var html_string = "";
				cards.forEach(function (card: CardType) {
					html_string += view.renders()["card_template"](card, onCardClick);
				})
				return (cards.length == 0) ? "<h3>empty, no cards</h3>" : html_string;
			},
			player_template: function (player: Player) {
				return "<div id='" + player.id + "_score'>" + player.name + "'s Score: <span>" + player.score + "</span></div>" +
						"<p>" + player.name + "'s Cards:" + "</p>";
			},
			new_player_template: function ({ game }: { game: Game}) {
				const duration = game?.duration;
				const startGame = `controller.submit_player_names()`;
				const getUpdateDuration = (d: string) => `controller.set_duration('${d}')`;
				const durationButtons = ['short', 'medium', 'long'].map(d => {
					const onclick = getUpdateDuration(d);
					let className = 'btn duration_btn';
					className += duration === d ? ' btn-success' : '';

					return `<button onclick="${onclick}" class='${className}' value='${d}'>${d}</button>`;
				})
				const errorMessage = Boolean(game.messages?.length) ? `<h4 id="error">${game.messages.join(' ')}</h4>` : '';
				return (
					"<div class='col-md-4'></div>" +
						"<div class='col-md-4'>" +
							"<div>" +
									"<h4>Please Enter Two Player Names</h4>" +
									errorMessage +
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
			game_template: function ({ game }: { game: Game}) {
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
									view.renders()["player_template"](playerOne) +
									view.renders()["hand_template"](playerOne.hand, playerOneCardClick) +
									view.renders()["crib_template"]({ game, player: playerOne }) +
							"</div>" +
							"<div class='' id='pile'>" +
									"<p>Pile Score: " + game.pile.score + "</p>" +
									"<p>Pile Cards:</p>" +
									view.renders()["hand_template"](game.pile, null) +
									"<canvas id='board' width='' height=''>Your browser cannot display the game board!</canvas>" +
							"</div>" +
							"<div class='' id='" + playerTwo.id +"'>" +
									view.renders()["score_table_template"](game, playerTwo, 'hand') +
									view.renders()["score_table_template"](game, playerTwo, 'crib') +
									view.renders()["player_template"](playerTwo) +
									view.renders()["hand_template"](playerTwo.hand, playerTwoCardClick) +
									view.renders()["crib_template"]({ game, player: playerTwo }) +
							"</div>" +
						"</div>";
			},
			crib_template: function ({ game, player }: { game: Game, player: Player}) {
				const isPlayerDealer = player.id === game.dealer?.id;
				const onCardClick = 'controller.noop';

				if (!isPlayerDealer) return '';

				return "<div id='crib'><p>" + game.dealer?.name + "'s Crib: </p>" +
					view.renders()["hand_template"](game.dealer?.crib, onCardClick ) +
				"</div>";
			},
			score_table_template: function (game: Game, player: Player, handType: string) {
				const isCrib = handType === 'crib';

				if (game.state !== STATE.scoring) return '';
				if (isCrib && player !== game.dealer) return '';

				const scores = isCrib ? player.crib.scores : player.handCopy.scores;
				let content = `<h3>${player.name}'s ${handType}</h3>`;

				if (scores.length) {
					scores.forEach(score => {
						content += view.renders()["score_row_template"](score);
					})
				} else {
					content += '<tr><td>bummer. nothing scored.</td></tr>';
				}

				return `<table class='table table-striped table-condensed'>${content}</table>`
			},
			score_row_template: function (score: ScoreRecordType) {
				return "<tr><td>" + score[0].displayVal + score[0].suit + "</td><td>+</td><td>" + score[1].displayVal + score[1].suit +
					"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
			},
			draw_board: function ({game}: { game: Game }) {
				var canvas = document.getElementById("board") as HTMLCanvasElement;
				if (!canvas) return null;
				var ctx = canvas.getContext("2d");
				if (!ctx) return null;

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
