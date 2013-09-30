(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var VALS = CRIBBAGE.VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	var SUITS = CRIBBAGE.SUITS = ['H', 'C', 'S', 'D'];

	var Card = CRIBBAGE.Card = function (suit, val) {
		this.player = null;
		this.suit = suit;
		this.val = val;
	}
	Card.prototype.int_val = function () {
		var num = Number(this.val);
		return ( isNaN(num) ) ? ((this.val == 'A') ? 1 : 10 ): num;
	};

	var Deck = CRIBBAGE.Deck = function () {
		this.cut_card = null;
		this.cards = [];
		for (var i = 0; i < SUITS.length; i++ ) {
			for (var j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	}
	Deck.prototype.shuffle = function () {
		this.cards = _.shuffle(this.cards);
	};
	Deck.prototype.cut = function () {
		var index = Math.floor(Math.random() * this.cards.length);
		this.cut_card = this.cards.splice(index, 1)[0];
	};

	var Hand = CRIBBAGE.Hand = function () {
		this.cards = [];
		this.score = 0;
	}
	Hand.prototype.push = function (card) {
		this.cards.push(card);
		this.update_score(card);
	}
	Hand.prototype.is_valid_push = function (card) {
		return ( this.score + card.int_val() <= 31 );
	}
	Hand.prototype.update_score = function (card) {
		this.score += card.int_val();
	}
	Hand.prototype.has_playable_card = function (game) {
		return _.some(this.cards, function (card) {
			return game.pile.is_valid_push(card);
		})
	}
	Hand.prototype.reset_score = function () {
		this.score = 0;
	}
	Hand.prototype.is_score = function (num) {
		return this.score == num;
	}
	Hand.prototype.is_empty = function () {
		return this.cards.length == 0;
	}
	var Round = CRIBBAGE.Round = function (players) {
		// should Round store the crib?
		// Round should store the discard_count
		this.current_player = players[0];
		this.dealer = players[1];
	}

	var Player = CRIBBAGE.Player = function (name, game) {
		this.name = name;
		this.game = game;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;
	}
	Player.prototype.discard = function (val, suit, render) {
		console.log(val, suit);
		var player = this;
		_.each(player.hand.cards, function (card) {
			if (card.val == val && card.suit == suit) {
				player.game.deck.cards.push(player.hand.cards.splice(player.hand.cards.indexOf(card), 1)[0]);
				render();
			}
		});
	};
	Player.prototype.card = function (card) {
		return this.hand.cards.slice(card - 1)[0];
	}
	var Game = CRIBBAGE.Game = function (player1, player2, view) {
		this.view = view;
		this.deck = new CRIBBAGE.Deck();
		this.pile = new CRIBBAGE.Hand();
		this.players = [new CRIBBAGE.Player(player1, this), new CRIBBAGE.Player(player2, this)];
		this.round = new Round(this.players);
		this.discard_count = 0;
	}
	Game.prototype.deal = function () {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			game.players[ n % 2 ].hand.push(card);
		})
	}
	Game.prototype.switch_player = function () {
		this.current_player = ( this.current_player == this.player1 ) ? this.player2: this.player1;
	}
	Game.prototype.register_cards = function () {
		_.each([this.player1, this.player2], function (player) {
			_.each(player.hand.cards, function (card) {
				card.player = player.name;
			})
		})
	}
	Game.prototype.increment_discard_count = function () {
		this.discard_count++;
	}
	Game.prototype.reset_discard_count = function () {
		this.discard_count = 0;
	}
	Game.prototype.cards_discarded = function () {
		return this.discard_count >= 4;
	}
	Game.prototype.all_hands_played = function () {
		return (this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0);
	}
	Game.prototype.add_points = function (num) {
		this.current_player.score += num;
	}
	Game.prototype.award_points = function () {
		if ( this.pile.is_score(15) || this.pile.is_score(31) ) { 
			this.add_points(2); 
		}
		if ( this.pile.is_score(31) ) {
			this.pile.reset_score(); 
		}
	}
	Game.prototype.is_round_over = function () {
		return ( this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0 );
	}
})(this);





