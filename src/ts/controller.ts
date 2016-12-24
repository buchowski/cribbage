import { Game, Hand } from './model';

export class Controller {
	game: Game;
	player_names: string[];
	duration: any;

	static get_val_suit($el : JQuery) : any[] {
		let val = $el.attr('id')[0];
		val = ( val == '1') ? '10' : val;
		let suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	}
	submit_player_names(e : Event) : void {
		let player1_name = $("#player1_name").val();
		let player2_name = $("#player2_name").val();
		let duration = $(".btn-success").val();

		this.create_game([player1_name, player2_name], duration);
	}
	discard(e : Event) : void {
		var val_and_suit = Controller.get_val_suit($(e.target));
		this.discard_card(val_and_suit);
	}
	play(e : Event) {
		var val_and_suit = Controller.get_val_suit($(e.target));
		this.play_card(val_and_suit);
	}
	return_cards(e : Event) {		
		this.game.pile.return_cards_to_players();
		this.score_hand();
	}
	new_round() : void {
		let game = this.game;

		game.discard_count = 0;
		game.return_cards_to_deck();
		game.deck.shuffle();
		game.cut_card = game.deck.cut_card();
		game.deal();

		game.dealer = (game.dealer == game.players[0]) ? game.players[1] : game.players[0];
		if (game.current_player == game.dealer) game.switch_player();
	}
	score_hand() : void {
		let controller = this;
		let player = controller.game.current_player;
		let scores = player.crib.score_cards();
		let el_id = "crib";

		if ($("#" + player.id + " > table").length == 0) {
			scores = player.hand.score_cards(); //scores[0] contains the scores array. scores[1] contains the score sum
			el_id = player.id;
		}

		controller.append_scores(el_id, scores, 0);
	}
	append_scores(el_id : string, scores : any[], index : number) {
		let total_score = Hand.total_score(scores);

		if (index < scores.length - 1) {
			this.append_scores(el_id, scores, index + 1);
		} else {
			let new_score = this.game.current_player.score + total_score;
			let fn_name = (scores.length != 0) ? "score_animation": "display_score_msg";
			this[fn_name](["+", total_score, "=", new_score], 0);
		}
	}
	score_animation(new_score_array : any[], index : number) {
		let fn_name = (index < new_score_array.length - 1) ? "score_animation": "slide_score";

		this[fn_name](new_score_array, index + 1);
	}
	display_score_msg(new_score_array : any[]) {
		this.game.current_player.score = new_score_array[3];
		if (this.game.current_player != this.game.dealer) this.game.switch_player();						
	}
	slide_score(new_score_array : any[]) {
		this.display_score_msg(new_score_array);
	}
	play_card(val_and_suit : string[]) { 
		let hand = this.game.current_player.hand;
		let pile = this.game.pile;
		let reset_score = false;

		if (pile.is_valid_push(val_and_suit)) {
			let card_index = hand.get_card_index(val_and_suit);
			let card = hand.splice_card(card_index);

			pile.push(card);
			pile.update_score(card);

			if (pile.score == 15) this.fifteen();

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();
			} else if (!this.game.current_player.hand.has_playable_card(pile)) {
				reset_score = true;
				this.game.current_player.score += 1; 
				if (pile.score == 31) this.thirtyone();

				if (this.game.are_both_hands_empty()) {
					if (this.game.current_player == this.game.dealer) this.game.switch_player();
				} else if (this.game.other_player().hand.cards.length != 0) {
					this.game.switch_player();
				}
			}
		}

		if (reset_score) pile.score = 0;
	}
	fifteen() : void {
		this.game.current_player.score += 2;
	}
	thirtyone() : void {
		this.game.current_player.score += 1; // player already received 1 point for last card
	}
	discard_card(val_and_suit : string[]) : void {
		let hand = this.game.current_player.hand;
		let count = this.game.discard_count;
		let card_index = hand.get_card_index(val_and_suit);
		let card = hand.splice_card(card_index);

		this.game.dealer.crib.push(card);
		this.game.discard_count++;
		this.game.switch_player();
	}
	create_game(player_names : string[], duration : any) : void {
		this.game = new Game(player_names, duration);
		this.game.deck.add_52_cards();
		this.game.deck.shuffle();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deal();
	}
}