(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var VALS = CRIBBAGE.VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	var SUITS = CRIBBAGE.SUITS = ['H', 'C', 'S', 'D'];

	var Card = CRIBBAGE.Card = function (suit, val) {
		this.holder = null;
		this.suit = suit;
		this.val = val;
	}
	Card.prototype.int_val = function () {
		var num = Number(this.val);
		return ( isNaN(num) ) ? ((this.val == 'A') ? 1 : 10 ): num;
	};

	var Deck = CRIBBAGE.Deck = function (game) {
		this.game = game;
		this.cut_card = null;
		this.cards = [];
		for (var i = 0; i < SUITS.length; i++ ) {
			for (var j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	};
	Deck.prototype.shuffle = function () {
		this.cards = _.shuffle(this.cards);
	};
	Deck.prototype.cut = function () {
		var index = Math.floor(Math.random() * this.cards.length);
		this.cut_card = this.cards.splice(index, 1)[0];
	};
	Deck.prototype.push = function (card) {
		var hand = this.game.round.current_player.hand;
		var round = this.game.round;

		this.cards.push(hand.cards.splice(hand.get_card_index(card[0], card[1]), 1)[0]);
		round.discard_count++;
		round.switch_player();
	};

	var Hand = CRIBBAGE.Hand = function () {
		this.cards = [];
		this.score = 0;
	};
	Hand.prototype.push = function (card) {
		this.cards.push(card);
	};
	
	Hand.prototype.get_card_index = function (val, suit) {
		for (var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			if (card.val == val && card.suit == suit) return i;
		}
	}

	var Pile = CRIBBAGE.Pile = function (game) {
		this.game = game;
		this.hand = new Hand();
		this.score = 0;
		this.name = 'Pile';
	}
	Pile.prototype.push = function (card) {
		var round = this.game.round;
		var hand = round.current_player.hand;
		var card_index = hand.get_card_index(card[0], card[1]);

		if (this.is_valid_push(hand.cards[card_index])) {
			card = hand.cards.splice(card_index, 1)[0];
			this.hand.cards.push(card);
			this.update_score(card);
			round.discard_count++;
			round.switch_player();
		} else {
			alert('invalid push');
		}
	}
	Pile.prototype.is_valid_push = function (card) {
		return ( this.score + card.int_val() <= 31 );
	}
	Pile.prototype.update_score = function (card) {
		this.score += card.int_val();
		// if ( this.score == 15 || this.score == 31 ) {
		// 	card.holder.score += 2;
		// } else if ( this.score == 31 ) {
		// 	card.holder.score += 2;
		// 	this.score = 0;
		// }
	};


	// Hand.prototype.has_playable_card = function (game) {
	// 	return _.some(this.cards, function (card) {
	// 		return game.pile.is_valid_push(card);
	// 	})
	// }
	// Hand.prototype.reset_score = function () {
	// 	this.score = 0;
	// }
	// Hand.prototype.is_score = function (num) {
	// 	return this.score == num;
	// }
	// Hand.prototype.is_empty = function () {
	// 	return this.cards.length == 0;
	// }
	var Round = CRIBBAGE.Round = function (game) {
		this.game = game;
		this.current_player = game.players[0];
		this.dealer = game.players[1];
		this.discard_count = 0;
	};
	Round.prototype.switch_player = function () {
		var players = this.game.players;
		this.current_player = players[( players.indexOf(this.current_player ) + 1) % 2];
	};

	var Player = CRIBBAGE.Player = function (name, game) {
		this.name = name;
		this.game = game;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;
	};
	Player.prototype.discard = function (val, suit, group, render) {
		var round = this.game.round;
		var hand = this.hand;

		group.push(hand.cards.splice(hand.get_card_index(val, suit), 1)[0])
		round.discard_count++;
		round.switch_player();
		render();
	};
	// Player.prototype.card = function (card) {
	// 	return this.hand.cards.slice(card - 1)[0];
	// }
	var Game = CRIBBAGE.Game = function (player1, player2, view) {
		this.view = view;
		this.deck = new CRIBBAGE.Deck(this);
		this.pile = new CRIBBAGE.Pile(this);
		this.players = [new CRIBBAGE.Player(player1, this), new CRIBBAGE.Player(player2, this)];
		this.round = new Round(this);
	};
	Game.prototype.deal = function () {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			card.holder = game.players[ n % 2 ];
			game.players[ n % 2 ].hand.push(card);
		})
	};
	// Game.prototype.switch_player = function () {
	// 	this.current_player = ( this.current_player == this.player1 ) ? this.player2: this.player1;
	// }
	// Game.prototype.register_cards = function () {
	// 	_.each([this.player1, this.player2], function (player) {
	// 		_.each(player.hand.cards, function (card) {
	// 			card.player = player.name;
	// 		})
	// 	})
	// }
	// Game.prototype.increment_discard_count = function () {
	// 	this.discard_count++;
	// }
	// Game.prototype.reset_discard_count = function () {
	// 	this.discard_count = 0;
	// }
	// Game.prototype.cards_discarded = function () {
	// 	return this.discard_count >= 4;
	// }
	// Game.prototype.all_hands_played = function () {
	// 	return (this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0);
	// }
	// Game.prototype.add_points = function (num) {
	// 	this.current_player.score += num;
	// }
	// Game.prototype.award_points = function () {
	// 	if ( this.pile.is_score(15) || this.pile.is_score(31) ) { 
	// 		this.add_points(2); 
	// 	}
	// 	if ( this.pile.is_score(31) ) {
	// 		this.pile.reset_score(); 
	// 	}
	// }
	// Game.prototype.is_round_over = function () {
	// 	return ( this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0 );
	// }
})(this);





