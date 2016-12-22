import { View } from './view';
import { Game, Hand } from './model';

export class Controller {
	view: View;
	game: Game;
	player_names: string[];
	duration: any;
	constructor() {
		this.view = new View();

		$("#cribbage").empty().append(this.view.new_player_template);
		$(".duration_btn").on("click", this.set_duration);
		$("#start_btn").on("click", this.submit_player_names.bind(this));
	}
	static get_val_suit($el : JQuery) : any[] {
		let val = $el.attr('id')[0];
		val = ( val == '1') ? '10' : val;
		let suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	}
	submit_player_names(e : Event) : void {
		e.preventDefault();
		let player1_name = $("#player1_name").val();
		let player2_name = $("#player2_name").val();
		let duration = $(".btn-success").val();
		// if (player1_name.length == 0 || player2_name.length == 0) {
		// 	controller.username_error();
		// } else {
		$('#create_players').hide(400, () => {
			this.create_game([player1_name, player2_name], duration);
		})					
		// }
	}
	set_duration(e : Event) {
		e.preventDefault();
		$(".duration_btn").toggleClass("btn-success", false);
		$(e.target).toggleClass("btn-success", true);
	}
	discard(e : Event) : void {
		var val_and_suit = Controller.get_val_suit($(e.target));
		this.discard_card(val_and_suit);
	}
	play(e : Event) {
		var val_and_suit = Controller.get_val_suit($(e.target));
		this.play_card(val_and_suit);
	}
	close_warning(e : Event) {
		$("#cribbage").empty().append(this.view.game_template([this.play_msg()], this.game));
		$("#" + this.game.dealer.id).append(this.view.crib_template(this.game.dealer));
		$("#" + this.game.current_player.id).on("click", ".card", this.play.bind(this));
		this.draw_board();
	}
	return_cards(e : Event) {		
		this.game.pile.return_cards_to_players();
		$("#cribbage").empty().append(this.view.game_template([], this.game));
		$("#" + this.game.dealer.id).append(this.view.crib_template(this.game.dealer));
		this.draw_board();
		this.score_hand();
	}
	new_round() : void {
		let game = this.game;
		let view = this.view;

		game.discard_count = 0;
		game.return_cards_to_deck();
		game.deck.shuffle();
		game.cut_card = game.deck.cut_card();
		game.deal();

		game.dealer = (game.dealer == game.players[0]) ? game.players[1] : game.players[0];
		if (game.current_player == game.dealer) game.switch_player();

		$("#cribbage").empty().append(view.game_template([this.discard_msg()], game));
		$("#" + this.game.dealer.id).append(view.crib_template(game.dealer));
		this.draw_board();
		$("#" + game.current_player.id).on("click", ".card", this.discard.bind(this));
	}
	score_hand() : void {
		let controller = this;
		let player = controller.game.current_player;
		let view = controller.view;
		let scores = player.crib.score_cards();
		let el_id = "crib";

		if ($("#" + player.id + " > table").length == 0) {
			scores = player.hand.score_cards(); //scores[0] contains the scores array. scores[1] contains the score sum
			el_id = player.id;
			$("#prompt").empty().append("<h3>" + controller.scoring_hand("hand") + "</h3>");
		} else {
			$("#prompt").empty().append("<h3>" + controller.scoring_hand("crib") + "</h3>");
		}

		$("<table id='" + el_id + "_score_table' class='table table-striped table-condensed'></table>").insertBefore("#" + el_id + " > .card");
		controller.append_scores(el_id, scores, 0);
	}
	append_scores(el_id : string, scores : any[], index : number) {
		let total_score = Hand.total_score(scores);

		setTimeout(() => {
			let score_template = (scores.length == 0) ? "bummer_template" : "score_row_template";

			$("#" + el_id + "_score_table").append(this.view[score_template](scores[index]));

			if (index < scores.length - 1) {
				this.append_scores(el_id, scores, index + 1);
			} else {
				let new_score = this.game.current_player.score + total_score;
				let fn_name = (scores.length != 0) ? "score_animation": "display_score_msg";
				this[fn_name](["+", total_score, "=", new_score], 0);
			}
		}, 1800)
	}
	score_animation(new_score_array : any[], index : number) {
		setTimeout(() => {
			let fn_name = (index < new_score_array.length - 1) ? "score_animation": "slide_score";

			$("#" + this.game.current_player.id + "_score").append(" <span>" + new_score_array[index] + "</span>");
			this[fn_name](new_score_array, index + 1);
		}, 1000)
	}
	display_score_msg(new_score_array : any[]) {
		let fn_name = ($("#crib > table").length == 0) ? "score_hand": "new_round";
		let hand_name = ($("#crib > table").length == 0) ? "hand": "crib";

		$("#prompt").empty().append("<h3>" + this.points_scored_msg(new_score_array[1], hand_name) + "</h3>");
		this.display_info_msg(fn_name); 

		this.game.current_player.score = new_score_array[3];
		if (this.game.current_player != this.game.dealer) this.game.switch_player();						
	}
	slide_score(new_score_array : any[]) {
		setTimeout(() => {
			let player = this.game.current_player;
			$("#" + player.id + "_score").empty();
			$("#" + player.id + "_score").append(player.name + "'s Score: " + new_score_array[3]);
			this.display_score_msg(new_score_array);
		}, 700)
	}
	draw_board() {
		// var canvas = $("#board"); Why doesn't JQuery select the canvas?
		var canvas = <HTMLCanvasElement>document.getElementById("board");
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
	play_card(val_and_suit : string[]) { 
		let hand = this.game.current_player.hand;
		let view = this.view;
		let pile = this.game.pile;
		let callback = "close_warning";
		let reset_score = false;
		let messages : string[] = [];

		if (pile.is_valid_push(val_and_suit)) {
			let card_index = hand.get_card_index(val_and_suit);
			let card = hand.splice_card(card_index);

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
					callback = "return_cards";
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
		$("#cribbage").empty().append(view.game_template(messages, this.game));
		$("#" + this.game.dealer.id).append(view.crib_template(this.game.dealer));
		(messages[0] == this.play_msg()) ? this.play_bind() : this.display_info_msg(callback);
		this.draw_board();

		if (reset_score) pile.score = 0;
	}
	fifteen() : string {
		this.game.current_player.score += 2;
		return this.fifteen_msg();
	}
	play_bind() : void {
		$("#" + this.game.current_player.id).on("click", ".card", this.play.bind(this));
	}
	thirtyone() : string {
		this.game.current_player.score += 1; // player already received 1 point for last card
		return this.thirtyone_msg();
	}
	display_info_msg(callback : string) : void{
		$("#prompt").append(this.view.ok_button_template());
		$("#warning").on("click", this[callback].bind(this));
	}
	discard_card(val_and_suit : string[]) : void {
		let hand = this.game.current_player.hand;
		let count = this.game.discard_count;
		let card_index = hand.get_card_index(val_and_suit);
		let card = hand.splice_card(card_index);
		let view = this.view;

		this.game.dealer.crib.push(card);
		this.game.discard_count++;
		this.game.switch_player();

		let callback = (count < 3) ? "discard" : "play";
		let message = (count < 3) ? this.discard_msg.bind(this) : this.play_msg.bind(this);

		$("#cribbage").empty().append(view.game_template([message()], this.game));
		$("#" + this.game.dealer.id).append(view.crib_template(this.game.dealer));
		this.draw_board();
		$("#" + this.game.current_player.id).on("click", ".card", this[callback].bind(this));
	}
	create_game(player_names : string[], duration : any) : void {
		let view = this.view;

		this.game = new Game(player_names, duration);
		this.game.deck.add_52_cards();
		this.game.deck.shuffle();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deal();

		$("#cribbage").empty().append(view.game_template([this.discard_msg()], this.game));
		$("#" + this.game.dealer.id).append(view.crib_template(this.game.dealer));
		this.draw_board();
		$("#" + this.game.current_player.id).on("click", ".card", this.discard.bind(this));

	}
	toggle_prompt_class(display : boolean) : void {
		$("body").toggleClass("gray", display);
		$("#prompt").toggleClass("white", display);
	}
	username_error() : void {
		$("#error").remove();
		$("#player1_name").before("<h4 id='error'>You must enter a name for both users!</h4><br>");
	}
	play_msg() : string {
		return this.game.current_player.name + ", slap a card down on the battlefield!";
	}
	discard_msg() : string {
		return this.game.current_player.name + ", rid thyself of a card!";
	}
	fifteen_msg() : string {
		return this.game.current_player.name + " gets 2 points for 15!";
	}
	thirtyone_msg() : string {
		return this.game.current_player.name + " gets 2 points for 31!";
	}
	point_for_last_card_msg() : string {
		return this.game.current_player.name + " gets 1 point for last card.";
	}
	still_your_turn_msg() : string {
		return this.game.current_player.name + " it's still your turn. " + this.game.other_player().name + "can't play a card.";
	}
	both_hands_empty_msg() : string {
		return  "both players' hands are empty. Let's score " + this.game.current_player.name + "'s hand.";
	}
	invalid_card_msg() : string {
		return this.game.current_player.name + ", you cannot play that card!";
	}
	scoring_hand(hand : string) : string {
		return "scoring " + this.game.current_player.name + "'s "+ hand + "...";
	}
	points_scored_msg(points : number, hand : string) : string {
		return this.game.current_player.name + "'s " + hand + " is worth " + points + " points.";
	}
}