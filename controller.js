import { makeObservable, observable, action } from "https://cdnjs.cloudflare.com/ajax/libs/mobx/6.13.5/mobx.esm.development.js"
import {Game} from './model.js';

export class Controller {

	constructor() {
		this.view = new CRIBBAGE.View();
	}

	static get_val_suit ($el) {
		const val_and_suit = $el?.target?.id;
		if (!val_and_suit) throw Error(`no val_and_suit`);
		const val = val_and_suit.slice(0, -1);
		const suit = val_and_suit.slice(-1);

		return [val, suit];
	}

	submit_player_names = (e) => {
		e.preventDefault();
		var player1_name = $("#player1_name").val();
		var player2_name = $("#player2_name").val();
		var duration = $(".btn-success").val();
		if (player1_name.length == 0 || player2_name.length == 0) {
			this.username_error();
		} else {
			$('#create_players').hide(400, () => {
				this.create_game([player1_name, player2_name], duration);
			})
		}
	}

	set_duration (e) {
		e.preventDefault();
		$(".duration_btn").toggleClass("btn-success", false);
		$(this).toggleClass("btn-success", true);
	}

	close_warning = (e) => {
		$("#cribbage").empty().append(this.view.renders["game_template"].call(this.game, [this.play_msg()]));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		this.on_card_click(this.play_card);
		this.draw_board();
	}

	return_cards = (e) => {
		this.game.pile.return_cards_to_players();
		$("#cribbage").empty().append(this.view.renders["game_template"].call(this.game, []));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		this.draw_board();
		this.score_hand();
	}

	new_round = () => {
		var game = this.game;

		game.discard_count = 0;
		game.return_cards_to_deck();
		game.deck.shuffle();
		game.cut_card = game.deck.cut_card();
		game.deal();

		game.dealer = (game.dealer == game.players[0]) ? game.players[1] : game.players[0];
		if (game.current_player == game.dealer) game.switch_player();

		$("#cribbage").empty().append(this.view.renders["game_template"].call(game, [this.discard_msg()]));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		this.draw_board();
		this.on_card_click(this.discard_card);
	}

	score_hand = () => {
		var player = this.game.current_player;

		if ($("#" + player.id + " > table").length == 0) {
			var scores = player.hand.score_cards(); //scores[0] contains the scores array. scores[1] contains the score sum
			var el_id = player.id;
			$("#prompt").empty().append("<h3>" + this.scoring_hand("hand") + "</h3>");
		} else {
			var scores = player.crib.score_cards();
			var el_id = "crib";
			$("#prompt").empty().append("<h3>" + this.scoring_hand("crib") + "</h3>");
		}

		$("<table id='" + el_id + "_score_table' class='table table-striped table-condensed'></table>").insertBefore("#" + el_id + " > .card");
		this.append_scores(el_id, scores, 0);
	}

	append_scores = (el_id, scores, index) => {
		var total_score = CRIBBAGE.Hand.total_score(scores);
		setTimeout(() => {
			var score_template = (scores.length == 0) ? "bummer_template" : "score_row_template";
			$("#" + el_id + "_score_table").append(this.view.renders[score_template].call(this, scores[index]));

			if (index < scores.length - 1) {
				this.append_scores(el_id, scores, index + 1);
			} else {
				var new_score = this.game.current_player.score + total_score;
				var callback = (scores.length != 0) ? this.score_animation: this.display_score_msg;
				callback(["+", total_score, "=", new_score], 0);
			}
		}, 1800)
	}

	score_animation = (new_score_array, index) => {
		setTimeout(() => {
			var callback = (index < new_score_array.length - 1) ? this.score_animation: this.slide_score;

			$("#" + this.game.current_player.id + "_score").append(" <span>" + new_score_array[index] + "</span>");
			callback(new_score_array, index + 1);
		}, 1000)
	}

	display_score_msg = (new_score_array) => {
		var callback = ($("#crib > table").length == 0) ? this.score_hand: this.new_round;
		var hand_name = ($("#crib > table").length == 0) ? "hand": "crib";

		$("#prompt").empty().append("<h3>" + this.points_scored_msg(new_score_array[1], hand_name) + "</h3>");
		this.display_info_msg(callback);

		this.game.current_player.score = new_score_array[3];
		if (this.game.current_player != this.game.dealer) this.game.switch_player();
	}

	slide_score = (new_score_array) => {
		setTimeout(() => {
			var player = this.game.current_player;
			$("#" + player.id + "_score").empty();
			$("#" + player.id + "_score").append(player.name + "'s Score: " + new_score_array[3]);
			this.display_score_msg(new_score_array);
		}, 700)
	}

	draw_board = () => {
		// var canvas = $("#board"); Why doesn't JQuery select the canvas?
		var canvas = document.getElementById("board");
		var ctx = canvas.getContext("2d");
		var game = this.game;

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

		ctx.fillText("Cut Card: " + game.cut_card.val + game.cut_card.suit, 70, 70);
		ctx.fillText("Start", 60, canvas.height - 20);
		ctx.fillText("Finish", canvas.width / 2 - 30, canvas.height / 2 - 20);
	}

	play_card = (val_and_suit) => {
		var hand = this.game.current_player.hand;
		var pile = this.game.pile;
		var callback = this.close_warning;
		var reset_score = false;
		var messages = [];

		if (pile.is_valid_push(val_and_suit)) {
			var card_index = hand.get_card_index(val_and_suit);
			var card = hand.splice_card(card_index);

			pile.push(card);
			pile.update_score(card);

			if (pile.score == 15) messages.push(this.fifteen());

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();
			} else if (this.game.current_player.hand.has_playable_card(pile)) {
				messages.push(this.still_your_turn_msg());
			} else {
				reset_score = true;
				this.game.current_player.score += 1;
				(pile.score == 31) ? messages.push(this.thirtyone()): messages.push(this.point_for_last_card_msg());

				if (this.game.are_both_hands_empty()) {
					if (this.game.current_player == this.game.dealer) this.game.switch_player();
					messages.push(this.both_hands_empty_msg());
					callback = this.return_cards;
				} else if (this.game.other_player().hand.cards.length == 0) {
					messages.push(this.still_your_turn_msg());
				} else {
					this.game.switch_player();
				}
			}
		} else {
			messages.push(this.invalid_card_msg());
		}

		if (messages.length == 0) messages = [this.play_msg()];
		$("#cribbage").empty().append(this.view.renders["game_template"].call(this.game, messages));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		(messages[0] == this.play_msg()) ? this.on_card_click(this.play_card) : this.display_info_msg(callback);
		this.draw_board();

		if (reset_score) pile.score = 0;
	}

	fifteen = () => {
		this.game.current_player.score += 2;
		return this.fifteen_msg();
	}

	thirtyone = () => {
		this.game.current_player.score += 1; // player already received 1 point for last card
		return this.thirtyone_msg();
	}

	display_info_msg = (callback) => {
		$("#prompt").append(this.view.renders["ok_button_template"]);
		$("#warning").on("click", callback);
	}

	discard_card = (val_and_suit) => {
		var hand = this.game.current_player.hand;
		var count = this.game.discard_count;
		var card_index = hand.get_card_index(val_and_suit);
		var card = hand.splice_card(card_index);

		this.game.dealer.crib.push(card);
		this.game.discard_count++;
		this.game.switch_player();

		var callback = (count < 3) ? this.discard_card : this.play_card;
		var message = (count < 3) ? this.discard_msg : this.play_msg;

		$("#cribbage").empty().append(this.view.renders["game_template"].call(this.game, [message.call(this)]));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		this.draw_board();
		this.on_card_click(callback)
	}

	create_game = (player_names, duration) => {
		this.game = new Game(player_names, duration, this);

		this.game.deck.add_52_cards();
		this.game.deck.shuffle();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deal();

		$("#cribbage").empty().append(this.view.renders["game_template"].call(this.game, [this.discard_msg()]));
		$("#" + this.game.dealer.id).append(this.view.renders["crib_template"].call(this.game));
		this.draw_board();
		this.on_card_click(this.discard_card)
	}

	on_card_click = (callback) => {
		$("#" + this.game.current_player.id).on("click", ".card", (e) => {
			const val_and_suit = Controller.get_val_suit(e);
			callback(val_and_suit);
		});
	}

	toggle_prompt_class (display) {
		$("body").toggleClass("gray", display);
		$("#prompt").toggleClass("white", display);
	}

	username_error = () => {
		$("#error").remove();
		$("#player1_name").before("<h4 id='error'>You must enter a name for both users!</h4><br>");
	}

	play_msg = () => {
		return this.game.current_player.name + ", slap a card down on the battlefield!";
	}

	discard_msg = () => {
		return this.game.current_player.name + ", rid thyself of a card!";
	}

	fifteen_msg = () => {
		return this.game.current_player.name + " gets 2 points for 15!";
	}

	thirtyone_msg = () => {
		return this.game.current_player.name + " gets 2 points for 31!";
	}

	point_for_last_card_msg = () => {
		return this.game.current_player.name + " gets 1 point for last card.";
	}

	still_your_turn_msg = () => {
		return this.game.current_player.name + " it's still your turn. " + this.game.other_player().name + "can't play a card.";
	}

	both_hands_empty_msg = () => {
		return  "both players' hands are empty. Let's score " + this.game.current_player.name + "'s hand.";
	}

	invalid_card_msg = () => {
		return this.game.current_player.name + ", you cannot play that card!";
	}

	scoring_hand = (hand) => {
		return "scoring " + this.game.current_player.name + "'s "+ hand + "...";
	}

	points_scored_msg = (points, hand) => {
		return this.game.current_player.name + "'s " + hand + " is worth " + points + " points.";
	}
}
