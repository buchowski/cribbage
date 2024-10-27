import { makeObservable, observable, action } from "https://cdnjs.cloudflare.com/ajax/libs/mobx/6.13.5/mobx.esm.development.js"

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];

class Card {
	constructor(suit, val) {
		this.holder = null;
		this.suit = suit;
		this.val = val;
	}
	static int_val = (val) => {
		var num = Number(val);
		return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
	}
}

class Card_Collection {
	push = (card) => {
		this.cards.push(card);
	}

	get_card_index = (val_and_suit) => {
		for (var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			if (card.val == val_and_suit[0] && card.suit == val_and_suit[1]) return i;
		}
	}

	splice_card = (index) => {
		return this.cards.splice(index, 1)[0];
	}

	cut_card = () => {
		// you may eventually add functionality so the user can determine where the deck's cut
		var index = Math.floor(Math.random() * this.cards.length);
		return this.splice_card(index);
	}

	shuffle = () => {
		this.cards = _.shuffle(this.cards);
	}

	return_cards_to_deck = (deck) => {
		while (this.cards.length != 0) {
			deck.push(this.cards.pop());
		}
	}
}

class Deck extends Card_Collection {
	constructor() {
		super();
		this.cards = [];
	}
	add_52_cards = () =>  {
		for (var i = 0; i < SUITS.length; i++ ) {
			for (var j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	}
}

export class Hand extends Card_Collection {
	constructor(owner) {
		super();
		this.owner = owner;
		this.cards = [];
		this.score = 0;
	}
	has_playable_card = (pile) => {
		return _.some(this.cards, function (card) {
			var val_and_suit = [card.val, card.suit];
			return pile.is_valid_push(val_and_suit);
		})
	}

	score_cards = () => {
		var scores = [];
		for (var i = 0; i < this.cards.length; i++) {
			for (var j = i + 1; j < this.cards.length; j++) {
				var sum = Card.int_val(this.cards[i].val) + Card.int_val(this.cards[j].val);
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

class Pile extends Card_Collection {
	constructor() {
		super();
		this.cards = [];
		this.score = 0;
	}

	is_valid_push = (val_and_suit) => {
		var val = val_and_suit[0];
		return ( this.score + Card.int_val(val) <= 31 );
	}

	update_score = (card) => {
		this.score += Card.int_val(card.val);
	}

	return_cards_to_players = () => {
		var pile = this;
		while (pile.cards.length != 0) {
			var card = pile.cards.pop();
			card.holder.hand.push(card);
		}
	}
}

class Player {
	constructor(name, id) {
		this.name = name;
		this.id = id;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;
	}
};

export class Game {
	constructor(controller) {
		this.controller = controller;
		this.deck = new Deck();
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
			setDuration: action,
			setPlayers: action,
		})

		// set all this stuff so we can skip inputting the usernames
		// this.players = [new Player('kron', "player1", this), new Player('spookey', "player2", this)];
		// this.deck.add_52_cards();
		// this.deck.shuffle();
		// this.cut_card = this.deck.cut_card();
		// this.deal();
	}

	setDuration(duration) {
		this.duration = duration ?? 'long';
	}

	setPlayers(player_names) {
		this.players = [new Player(player_names[0], "player1", this), new Player(player_names[1], "player2", this)];
	}

	deal = () => {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			card.holder = game.players[ n % 2 ];
			game.players[ n % 2 ].hand.push(card);
		})
	}

	any_playable_cards = () => {
			return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	}

	are_both_hands_empty = () => {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}

	other_player = () => {
		return (this.current_player == this.players[0]) ? this.players[1] : this.players[0];
	}

	switch_player = () => {
		this.current_player = this.other_player();
	}

	return_cards_to_deck = () => {
		var game = this;
		_.each(game.players, function (player) {
			player.hand.return_cards_to_deck(game.deck);
			player.crib.return_cards_to_deck(game.deck);
		})
		game.deck.push(game.cut_card);
	}
}




