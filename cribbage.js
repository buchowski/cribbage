root._ = require('./underscore.js');

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];

function Card(suit, val) {
	this.player = null;
	this.suit = suit;
	this.val = val;
}
Card.prototype.int_val = function () {
	var num = Number(this.val);
	return ( isNaN(num) ) ? ((this.val == 'A') ? 1 : 10 ): num;
};

function Deck() {
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
Deck.prototype.deal = function (player1, player2) {
	var that = this;
	_.times(12, function (n) {
		( n % 2 === 0) ? player1.hand.push(that.cards.pop()) : player2.hand.push(that.cards.pop());
	})
};

function Hand() {
	this.cards = [];
	this.score = 0;
}
Hand.prototype.push = function (card) {
	this.cards.push(card);
}

function Player(name) {
	this.name = name;
	this.score = 0;
	this.hand = new Hand();
	this.crib = new Hand();
}
Player.prototype.discard = function (card) {
	return this.hand.cards.splice(card - 1, 1)[0];
};

function Game(player1, player2) {
	
	this.deck = new Deck();
	this.pile = new Hand();
	this.current_player = player1;
	this.dealer = player1;
	this.player1 = player1;
	this.player2 = player2;
	this.discard_count = 0;
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

module.exports.Player = Player;
module.exports.Game = Game;
module.exports.Hand = Hand;
module.exports.Deck = Deck;
module.exports.Card = Card;






