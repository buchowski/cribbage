import { makeObservable, computed, makeAutoObservable, observable, action } from "https://cdnjs.cloudflare.com/ajax/libs/mobx/6.13.5/mobx.esm.development.js"
import { returnCardsToDeck, getCardIntVal, getDeck, STATE, isEmpty } from "./utils.js";

export class Hand {
	constructor(owner) {
		this.owner = owner;
		this.cards = [];
		this.score = 0;
		makeObservable(this, {
			cards: observable,
		})
	}

	has_playable_card = (pile) => {
		return _.some(this.cards, function (card) {
			var val_and_suit = [card.val, card.suit];
			return pile.is_valid_push(val_and_suit);
		})
	}

	remove_card = action((index) => {
		return this.cards.splice(index, 1)[0];
	})

	pushCard = action((card) => this.cards.push(card))

	score_cards = () => {
		var scores = [];
		for (var i = 0; i < this.cards.length; i++) {
			for (var j = i + 1; j < this.cards.length; j++) {
				var sum = getCardIntVal(this.cards[i].val) + getCardIntVal(this.cards[j].val);
				if (sum == 15) {
					scores.push([this.cards[i], this.cards[j], sum, 2]);
				}
			}
		}
		return scores;
	}

	static total_score = (scores) => {
		var total = 0;
		_.each(scores, function (score) {
			total += score[3]; // the points is a score is worth is stored in the last element of a score array
		})
		return total;
	}
}

class Pile {
	constructor() {
		this.cards = [];
		this.score = 0;
		makeObservable(this, {
			cards: observable,
			score: observable
		});
	}

	is_valid_push = (val_and_suit) => {
		var val = val_and_suit[0];
		return ( this.score + getCardIntVal(val) <= 31 );
	}

	update_score = action((card) => {
		this.score += getCardIntVal(card.val);
	})

	resetScore = action(() => this.score = 0)

	pushCard = action((card) => this.cards.push(card))

	return_cards_to_players = action(() => {
		var pile = this;
		while (pile.cards.length != 0) {
			var card = pile.cards.pop();
			card.holder.hand.push(card);
		}
	})
}

class Player {
	constructor(name, id) {
		this.name = name;
		this.id = id;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;

		makeObservable(this, {
			hand: observable,
			crib: observable,
			score: observable
		})
	}

	addToScore = action(points => this.score += points)
};

export class Game {
	constructor(controller) {
		this.controller = controller;
		this.deck = getDeck();
		this.pile = new Pile();
		this.players = [];
		this.dealer = null;
		this.current_player = null;
		this.cut_card = null;
		this.discard_count = 0;
		this.duration = 'long';

		makeObservable(this, {
			duration: observable,
			players: observable,
			current_player: observable
		})
	}

	get isDiscarding() {
		return this.players.length === 2 &&
			(this.players[0]?.hand?.cards?.length > 4 ||
			this.players[1]?.hand?.cards?.length > 4);
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

	setDuration = action((duration) => {
		this.duration = duration ?? 'long';
	})

	setPlayers = action((player_names) => {
		this.players = [new Player(player_names[0], "player1", this), new Player(player_names[1], "player2", this)];
		this.current_player = this.players[0]
		this.dealer = this.players[1]
	})

	deal = action(() => {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			card.holder = game.players[ n % 2 ];
			game.players[ n % 2 ].hand.cards.push(card);
		})
	})

	switch_player = action(() => {
		this.current_player = this.other_player();
	})

	return_cards_to_deck = action(() => {
		var game = this;
		_.each(game.players, function (player) {
			returnCardsToDeck(game.deck, player.hand.cards);
			returnCardsToDeck(game.deck, player.crib.cards);
		})
		game.deck.cards.push(game.cut_card);
	})

	any_playable_cards = () => {
			return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	}

	are_both_hands_empty = () => {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}

	other_player = () => {
		return (this.current_player == this.players[0]) ? this.players[1] : this.players[0];
	}
}




