(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var VALS = CRIBBAGE.VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	var SUITS = CRIBBAGE.SUITS = ['H', 'C', 'S', 'D'];

	var Card = CRIBBAGE.Card = class {
		constructor(suit, val) {
			this.holder = null;
			this.suit = suit;
			this.val = val;
		}
	};

	Card.intVal = function (val) {
		var num = Number(val);
		if (isNaN(num) && val === 'A') {
			return 1;
		} else if (isNaN(num)) {
			return 10;
		} else {
			return num;
		}
	};

	var CardCollection = CRIBBAGE.CardCollection = class {
		constructor() {
			this.cards = [];
		}
		push(card) {
			this.cards.push(card);
		}
		getCardIndex(valAndSuit) {
			for (var i = 0; i < this.cards.length; i++) {
				var card = this.cards[i];
				if (card.val === valAndSuit[0] && card.suit === valAndSuit[1]) {
					return i;
				}
			}
		}
		spliceCard(index) {
			return this.cards.splice(index, 1)[0];
		}
		cutCard() {
			var index = Math.floor(Math.random() * this.cards.length);
			return this.spliceCard(index);
		}
		shuffle() {
			this.cards = _.shuffle(this.cards);
		}
		returnCardsToDeck(deck) {
			while (this.cards.length !== 0) {
				deck.push(this.cards.pop());
			}
		}
	};

	CRIBBAGE.Deck = class Deck extends CardCollection {
		add52Cards() {
			for (var i = 0; i < SUITS.length; i++) {
				for (var j = 0; j < VALS.length; j++) {
					this.cards.push(new Card(SUITS[i], VALS[j]));
				}
			}
		}
	};

	var Hand = CRIBBAGE.Hand = class Hand extends CardCollection {
		constructor(owner) {
			super();

			this.owner = owner;
			this.score = 0;
		}
		hasPlayableCard(pile) {
			return _.some(this.cards, (card) => {
				var valAndSuit = [card.val, card.suit];
				return pile.isValidPush(valAndSuit);
			});
		}
		scoreCards() {
			var scores = [];
			for (var i = 0; i < this.cards.length; i++) {
				for (var j = i + 1; j < this.cards.length; j++) {
					var sum = Card.intVal(this.cards[i].val) + Card.intVal(this.cards[j].val);
					if (sum === 15) {
						scores.push([this.cards[i], this.cards[j], sum, 2]);
					}
				}
			}
			return scores;
		}
	};

	Hand.totalScore = function (scores) {
		var total = 0;
		_.each(scores, (score) => {
			total += score[3]; // the points is a score is worth is stored in the last element of a score array
		});
		return total;
	};

	CRIBBAGE.Pile = class Pile extends CardCollection {
		constructor() {
			super();

			this.score = 0;
		}
		isValidPush(valAndSuit) {
			var val = valAndSuit[0];
			return (this.score + Card.intVal(val) <= 31);
		}
		updateScore(card) {
			this.score += Card.intVal(card.val);
		}
		returnCardsToPlayers() {
			var pile = this;
			while (pile.cards.length !== 0) {
				var card = pile.cards.pop();
				card.holder.hand.push(card);
			}
		}
	};

	CRIBBAGE.Player = class {
		constructor(name, id, game) {
			this.name = name;
			this.id = id;
			this.game = game;
			this.hand = new Hand();
			this.crib = new Hand();
			this.score = 0;
		}
	};

	var Game = CRIBBAGE.Game = class {
		constructor (playerNames, duration, controller) {
			this.controller = controller;
			this.deck = new CRIBBAGE.Deck(this);
			this.pile = new CRIBBAGE.Pile();
			this.players = [new CRIBBAGE.Player(playerNames[0], "player1", this), new CRIBBAGE.Player(playerNames[1], "player2", this)];
			this.dealer = this.players[0];
			this.currentPlayer = this.players[1];
			this.cutCard = null;
			this.discardCount = 0;

			// duration determines the number of holes we draw on the board.
			if (duration === "short") {
				this.duration = 10;
			} else if (duration === "medium") {
				this.duration = 20;
			} else { // duration == long
				this.duration = 30;
			}
		}
		deal() {
			var game = this;
			_.times(12, function (n) {
				var card = game.deck.cards.pop();
				card.holder = game.players[ n % 2 ];
				game.players[ n % 2 ].hand.push(card);
			});
		}
		anyPlayableCards() {
			return (this.players[0].hand.hasPlayableCard(this.pile) || this.players[1].hand.hasPlayableCard(this.pile));
		}
		areBothHandsEmpty() {
			return (this.players[0].hand.cards.length === 0 && this.players[1].hand.cards.length === 0);
		}
		otherPlayer() {
			return (this.currentPlayer === this.players[0]) ? this.players[1] : this.players[0];
		}
		switchPlayer() {
			this.currentPlayer = this.otherPlayer();
		}
		returnCardsToDeck() {
			var game = this;
			_.each(game.players, function (player) {
				player.hand.returnCardsToDeck(game.deck);
				player.crib.returnCardsToDeck(game.deck);
			});
			game.deck.push(game.cutCard);
		}
	}
})(window);
