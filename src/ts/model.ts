const VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['H', 'C', 'S', 'D'];

export class Card {
	holder: Player;
	constructor(public suit : string, public val : string) {}
	static int_val(val : string) : number {
		var num = Number(val);
		return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
	}
}

export class Card_Collection {
	constructor(public cards : Card[] = []) {}
	push(card : Card) : void {
		this.cards.push(card);
	}
	get_card_index(val_and_suit : string[]) : number {
		for (let i = 0; i < this.cards.length; i++) {
			let card = this.cards[i];
			if (card.val == val_and_suit[0] && card.suit == val_and_suit[1]) return i;
		}
	}
	splice_card(index : number) : Card {
		return this.cards.splice(index, 1)[0];
	}
	cut_card() : Card {
		// you may eventually add functionality so the user can determine where the deck's cut
		let index = Math.floor(Math.random() * this.cards.length);
		return this.splice_card(index);
	}
	shuffle() : void {
		let newOrder : Card[] = [];

		while(this.cards.length) {
			let index = Math.floor(Math.random() * this.cards.length)
			let card : Card = this.cards.splice(index, 1)[0];

			newOrder.push(card);
		}

		this.cards = newOrder;
	}
	return_cards_to_deck(deck : Deck) {
		while (this.cards.length) {
			deck.push(this.cards.pop());
		}
	}
}

class Deck extends Card_Collection {
	constructor(public cards : Card[] = []) {
		super();
	}
	add_52_cards() : void {
		for (let i = 0; i < SUITS.length; i++ ) {
			for (let j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	};
}

export class Hand extends Card_Collection {
	cards: Card[];
	score: number;
	constructor(owner : Player) {
		super();
		this.cards = [];
		this.score = 0;
	}
	static total_score(scores : any[]) : number {
		var total = 0;
		for (let score of scores) {
			total += score[3]; // the points a score is worth is stored in the last element of a score array
		}
		return total;
	}
	has_playable_card(pile : Pile) : boolean {
		for (let card of this.cards) {
			let val_and_suit = [card.val, card.suit];
			if (pile.is_valid_push(val_and_suit)) {
				return true;
			}
		}
		return false;
	}
	score_cards() : any[] {
		let scores = [];	
		for (let i = 0; i < this.cards.length; i++) {
			for (let j = i + 1; j < this.cards.length; j++) {
				let sum = Card.int_val(this.cards[i].val) + Card.int_val(this.cards[j].val);
				if (sum == 15) {
					scores.push([this.cards[i], this.cards[j], sum, 2]);
				} 
			}
		}	
		return scores;
	}
}

class Pile extends Card_Collection {
	cards : Card[];
	score : number;
	constructor() {
		super();
		this.cards = [];
		this.score = 0;
	}
	is_valid_push(val_and_suit : string[]) : boolean {
		var val = val_and_suit[0];
		return ( this.score + Card.int_val(val) <= 31 );
	}
	update_score(card : Card) : void {
		this.score += Card.int_val(card.val);
	}
	return_cards_to_players() : void {
		while (this.cards.length != 0) {
			var card = this.cards.pop();
			card.holder.hand.push(card);
		}
	}
}

export class Player {
	hand: Hand;
	crib: Hand;
	score: number;
	constructor(public name: string, public id: string, game: Game) {
		this.score = 0;
		this.hand = new Hand(this);
		this.crib = new Hand(this);
	}
}

export class Game {
	deck: Deck;
	pile: Pile;
	players: Player[];
	dealer: Player;
	current_player: Player;
	cut_card: Card;
	discard_count: number;
	constructor(player_names: string[], public duration: any) {
		this.deck = new Deck();
		this.pile = new Pile();
		this.players = [new Player(player_names[0], "player1", this), new Player(player_names[1], "player2", this)];
		this.dealer = this.players[0];
		this.current_player = this.players[1];
		this.cut_card = null;
		this.discard_count = 0;
		this.duration = (duration == 'short') ? 10 : (duration == 'medium') ? 20 : 30;
	}
	deal() : void {
		for (let i = 0; i < 12; i++) {
			let card = this.deck.cards.pop();
			card.holder = this.players[ i % 2 ];
			this.players[ i % 2 ].hand.push(card);
		}
	}
	any_playable_cards() : boolean {
		 return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	}
	are_both_hands_empty() : boolean {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}
	other_player() : Player {
		return (this.current_player == this.players[0]) ? this.players[1] : this.players[0];
	}
	switch_player() : void {
		this.current_player = this.other_player();
	}
	return_cards_to_deck() : void {
		for (let player of this.players) {
			player.hand.return_cards_to_deck(this.deck);
			player.crib.return_cards_to_deck(this.deck);
		}
		this.deck.push(this.cut_card);
	}
}




