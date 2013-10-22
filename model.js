(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var VALS = CRIBBAGE.VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	var SUITS = CRIBBAGE.SUITS = ['H', 'C', 'S', 'D'];

	var Card = CRIBBAGE.Card = function (suit, val) {
		this.holder = null;
		this.suit = suit;
		this.val = val;
	}
	Card.int_val = function (val) {
		var num = Number(val);
		return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
	};

	var Card_Collection = CRIBBAGE.Card_Collection = function () {};
	Card_Collection.prototype.push = function (card) {
		this.cards.push(card);
	};
	Card_Collection.prototype.get_card_index = function (val_and_suit) {
		// should this function be rewritten to take a card object?
		for (var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			if (card.val == val_and_suit[0] && card.suit == val_and_suit[1]) return i;
		}
	};
	Card_Collection.prototype.splice_card = function (index) {
		return this.cards.splice(index, 1)[0];
	}
	Card_Collection.prototype.cut_card = function () {
		// you may eventually add functionality so the user can determine where the deck's cut
		var index = Math.floor(Math.random() * this.cards.length);
		return this.splice_card(index);
	};
	Card_Collection.prototype.shuffle = function () {
		this.cards = _.shuffle(this.cards);
	};

	var Deck = CRIBBAGE.Deck = function () {
		this.cards = [];
	};
	Deck.prototype = Card_Collection.prototype;
	Deck.prototype.add_52_cards = function () {
		for (var i = 0; i < SUITS.length; i++ ) {
			for (var j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	};

	var Hand = CRIBBAGE.Hand = function (owner) {
		this.owner = owner;
		this.cards = [];
		this.score = 0;
	};
	Hand.prototype = Card_Collection.prototype;
	Hand.prototype.has_playable_card = function (pile) {
		return _.some(this.cards, function (card) {
			var val_and_suit = [card.val, card.suit];
			return pile.is_valid_push(val_and_suit);
		})
	};

	var Pile = CRIBBAGE.Pile = function () {
		this.cards = [];
		this.score = 0;
	};
	Pile.prototype = Card_Collection.prototype;
	Pile.prototype.is_valid_push = function (val_and_suit) {
		var val = val_and_suit[0];
		return ( this.score + Card.int_val(val) <= 31 );
	}
	Pile.prototype.update_score = function (card) {
		this.score += Card.int_val(card.val);
	};
	Pile.prototype.return_cards_to_players = function () {
		var pile = this;
		while (pile.hand.cards.length != 0) {
			var card = pile.hand.cards.pop();
			card.holder.hand.push(card);
		}
	};

	var Player = CRIBBAGE.Player = function (name, id, game) {
		this.name = name;
		this.id = id;
		this.game = game;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;
	};
	
	var Game = CRIBBAGE.Game = function (player_names, controller) {
		this.controller = controller;
		this.deck = new CRIBBAGE.Deck(this);
		this.pile = new CRIBBAGE.Pile();
		this.players = [new CRIBBAGE.Player(player_names[0], "player1", this), new CRIBBAGE.Player(player_names[1], "player2", this)];
		this.dealer = this.players[0];
		this.current_player = this.players[1];
		this.cut_card = null;
		this.discard_count = 0;
	};
	Game.prototype.deal = function () {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			card.holder = game.players[ n % 2 ];
			game.players[ n % 2 ].hand.push(card);
		})
	};
	Game.prototype.any_playable_cards = function () {
		 return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	};
	Game.prototype.are_both_hands_empty = function () {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}
	Game.prototype.other_player = function () {
		return (this.current_player == this.players[0]) ? this.players[1] : this.players[0];
	};
	Game.prototype.switch_player = function () {
		this.current_player = this.other_player();
	};

})(this);





