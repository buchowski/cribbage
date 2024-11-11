import {Game, Hand} from './model.js';
import {View} from './view.js';
import {getCardIndex, getCutCard, getDeck} from './utils.js';

export class Controller {

	constructor() {
		this.game = new Game(this);
		this.view = new View(this);
	}

	static get_val_suit ($el) {
		const val_and_suit = $el?.target?.id;
		if (!val_and_suit) throw Error(`no val_and_suit`);
		const val = val_and_suit.slice(0, -1);
		const suit = val_and_suit.slice(-1);

		return [val, suit];
	}

	noop = () => {
		console.log('noop')
	}

	submit_player_names = () => {
		var player1_name = document.getElementById("player1_name").value;
		var player2_name = document.getElementById("player2_name").value;
		this.game.clearMessages();

		if (player1_name.length == 0 || player2_name.length == 0) {
			this.game.pushMessages('You must enter a name for both users!')
		} else {
			this.create_game([player1_name, player2_name]);
		}
	}

	set_duration (duration) {
		this.game.setDuration(duration)
	}

	new_round = () => {
		this.game.new_round();
	}

	score_hands_and_crib = () => {
		const { dealer, nonDealer } = this.game || {};

		dealer.scoreHand();
		dealer.scoreCrib();
		nonDealer.scoreHand();
	}

	play_card = (player_id, val_and_suit) => {
		var hand = this.game.current_player.hand;
		var pile = this.game.pile;
		var reset_score = false;
		var messages = [];
		this.game.clearMessages();

		if (this.game.current_player.id !== player_id) {
			const notYourTurnMsg = `it is not your turn, ${this.game.other_player.name}`;
			this.game.pushMessages(notYourTurnMsg);
			return;
		}

		if (getCardIndex(val_and_suit, hand.cards) === -1) {
			const notYourCardMsg = `card ${val_and_suit} does not belong to player ${this.game.current_player.name}`;
			this.game.pushMessages(notYourCardMsg);
			return;
		}

		if (pile.is_valid_push(val_and_suit)) {
			var card_index = getCardIndex(val_and_suit, hand.cards);
			var card = hand.remove_card(card_index);

			pile.pushCard(card);
			pile.update_score(card);

			if (pile.score == 15) messages.push(this.fifteen());

			if (this.game.other_player.hand.has_playable_card(pile)) {
				this.game.switch_player();
			} else if (this.game.current_player.hand.has_playable_card(pile)) {
				messages.push(this.still_your_turn_msg());
			} else {
				reset_score = true;
				this.game.current_player.addToScore(1);
				(pile.score == 31) ? messages.push(this.thirtyone()): messages.push(this.point_for_last_card_msg());

				if (this.game.are_both_hands_empty()) {
					if (this.game.current_player == this.game.dealer) this.game.switch_player();
					messages.push(this.both_hands_empty_msg());
					this.score_hands_and_crib();
				} else if (this.game.other_player.hand.cards.length == 0) {
					messages.push(this.still_your_turn_msg());
				} else {
					this.game.switch_player();
				}
			}
		} else {
			messages.push(this.invalid_card_msg());
		}

		this.game.pushMessages(messages);
		if (reset_score) pile.resetScore();
	}

	fifteen = () => {
		this.game.current_player.addToScore(2);
		return this.fifteen_msg();
	}

	thirtyone = () => {
		this.game.current_player.addToScore(1); // player already received 1 point for last card
		return this.thirtyone_msg();
	}

	discard_card = (player_id, val_and_suit) => {
		const [playerOne, playerTwo] = this.game.players;
		const isPlayerOne = player_id === playerOne.id;
		const player = isPlayerOne ? playerOne : playerTwo;
		var hand = player.hand;
		var card_index = getCardIndex(val_and_suit, hand.cards);

		this.game.clearMessages();

		if (card_index === -1) {
			const notYourCardMsg = `card ${val_and_suit} does not belong to player ${player.name}`;
			this.game.pushMessages(notYourCardMsg);
			return;
		}
		if (hand.cards.length <= 4) {
			const noMoreDiscardsMsg = "cannot discard anymore cards. you're all out";
			this.game.pushMessages(noMoreDiscardsMsg);
			return;
		}
		var card = hand.remove_card(card_index);

		// we want a copy of the hand state after discarding so we can use it later for scoring
		player.copyHand(hand);

		this.game.dealer.crib.pushCard(card);
	}

	create_game = (player_names) => {
		const game = this.game
		game.clearMessages();
		game.setPlayers(player_names);
		game.deck = getDeck();
		game.deck.cards = _.shuffle(game.deck.cards);
		game.cut_card = getCutCard(game.deck.cards);
		game.deal();
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
		return this.game.current_player.name + " it's still your turn. " + this.game.other_player.name + "can't play a card.";
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
