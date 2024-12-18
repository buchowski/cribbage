import { makeObservable, observable, action } from "mobx";
import { getDeck, STATE, isEmpty, removeRandomCard } from "./utils.js";
import { Controller } from "./controller.js";
import type { CardType, ScoreRecordType } from "./types.js";

export class Hand {
	cards: CardType[];
	scores: ScoreRecordType[];

	constructor() {
		this.cards = [];
		this.scores = [];
		makeObservable(this, {
			cards: observable,
			scores: observable
		})
	}

	has_playable_card = (pile: Pile) => {
		return this.cards.some(function (card: CardType) {
			return pile.is_valid_push(card);
		})
	}

	remove_card = action((index: number) => {
		return this.cards.splice(index, 1)[0];
	})

	pushCard = action((card: CardType) => this.cards.push(card))
	pushCards = action((cards: CardType[]) => this.cards = [...cards])
	reset = action(() => this.cards = []);

	score_cards = action(() => {
		for (var i = 0; i < this.cards.length; i++) {
			for (var j = i + 1; j < this.cards.length; j++) {
				var sum = this.cards[i].val + this.cards[j].val;
				if (sum == 15) {
					this.scores.push([this.cards[i], this.cards[j], sum, 2]);
				}
			}
		}
	})

	get total_score() {
		var total = 0;
		this.scores.forEach(function (score: ScoreRecordType) {
			total += score[3]; // the points is a score is worth is stored in the last element of a score array
		})
		return total;
	}
}

export class Pile {
	cards: CardType[];
	score

	constructor() {
		this.cards = [];
		this.score = 0;
		makeObservable(this, {
			cards: observable,
			score: observable
		});
	}

	is_valid_push = (card: CardType) => {
		return ( this.score + card.val <= 31 );
	}

	update_score = action((card: CardType) => {
		this.score += card.val;
	})

	resetScore = action(() => this.score = 0)
	reset = action(() => {
		this.cards = [];
		this.score = 0;
	});

	pushCard = action((card: CardType) => this.cards.push(card))
}

export class Player {
	name
	id
	hand: Hand;
	handCopy: Hand;
	crib: Hand;
	score

	constructor(name: string, id: string) {
		this.name = name;
		this.id = id;
		this.hand = new Hand();
		this.handCopy = new Hand();
		this.crib = new Hand();
		this.score = 0;

		makeObservable(this, {
			hand: observable,
			crib: observable,
			score: observable
		})
	}

	copyHand = action((hand: Hand) => this.handCopy.pushCards(hand.cards));

	addToScore = action((points: number) => this.score += points)

	scoreHand = action(() => {
		this.handCopy.score_cards();
		this.addToScore(this.handCopy.total_score)
	})

	scoreCrib = action(() => {
		this.crib.score_cards();
		this.addToScore(this.crib.total_score)
	})
};

export class Game {
		controller
		deck
		pile
		players: Player[];
		dealer: Player | null;
		current_player: Player | null;
		cut_card: CardType | null;
		duration
		messages: string[]

	constructor(controller: Controller) {
		this.controller = controller;
		this.deck = getDeck();
		this.pile = new Pile();
		this.players = [];
		this.dealer = null;
		this.current_player = null;
		this.cut_card = null;
		this.duration = 'long';
		this.messages = [];

		makeObservable(this, {
			duration: observable,
			players: observable,
			current_player: observable,
			dealer: observable,
			messages: observable,
		})
	}

	get state() {
		if (this.players.length < 2) {
			return STATE.waiting
		}
		const [p1, p2] = this.players;

		if (isEmpty(p1.hand) && isEmpty(p1.crib) && isEmpty(p2.hand) && isEmpty(p2.crib)) {
			return STATE.dealing;
		}

		if (p1.hand.cards.length > 4 || p2.hand.cards.length > 4) {
			return STATE.discarding;
		}

		if (isEmpty(p1.hand) && isEmpty(p2.hand)) {
			return STATE.scoring;
		}

		return STATE.playing;
	}

	// view model
	get pagePrompt() {
		if (this.state === STATE.discarding) {
			return this.controller.discard_msg();
		} else if (this.state === STATE.playing) {
			return this.controller.play_msg();
		} else if (this.state === STATE.scoring) {
			// TODO render prompt when scoring crib
			return this.controller.scoring_hand('hand');
		}
	}

	// view model
	pushMessages = action((messages: string[] | string) => {
		const msgs = Array.isArray(messages) ? messages : [messages];
		this.messages = [...this.messages, ...msgs]
	})

	// view model
	clearMessages = action(() => this.messages = []);

	setDuration = action((duration: string) => {
		this.duration = duration ?? 'long';
	})

	setPlayers = action((player_names: string[]) => {
		this.players = [new Player(player_names[0], "player1"), new Player(player_names[1], "player2")];
		this.current_player = this.players[0]
		this.dealer = this.players[1]
	})

	deal = action(() => {
		var game = this;
		let count = 0;
		while (count < 6) {
			game.players[0].hand.pushCard(removeRandomCard(game.deck.cards))
			game.players[1].hand.pushCard(removeRandomCard(game.deck.cards))
			count++
		}
	})

	switch_player = action(() => {
		this.current_player = this.other_player;
	})

	new_round = action(() => {
		var game = this;
		game.clearMessages();
		game.deck = getDeck();
		game.current_player?.hand.reset();
		game.current_player?.handCopy.reset();
		game.current_player?.crib.reset();
		game.other_player.hand.reset();
		game.other_player.handCopy.reset();
		game.other_player.crib.reset();
		game.pile.reset();

		game.cut_card = removeRandomCard(game.deck.cards);
		game.deal();

		game.dealer = this.nonDealer;
		if (game.current_player == game.dealer) game.switch_player();
	})

	any_playable_cards = () => {
			return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	}

	are_both_hands_empty = () => {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}

	get nonDealer() {
		return (this.dealer == this.players[0]) ? this.players[1] : this.players[0];
	}

	get other_player() {
		return (this.current_player == this.players[0]) ? this.players[1] : this.players[0];
	}
}




