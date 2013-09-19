var Card = require('./card.js').Card;
var SUITS = require('./card.js').SUITS;
var VALS = require('./card.js').VALS;

Deck = function () {
	this.cut_card = null;
	this.deck = [];
	for (var i = 0; i < SUITS.length; i++ ) {
		for (var j = 0; j < VALS.length; j++ ) {
			this.deck.push(new Card(SUITS[i], VALS[j]));
		}
	}
}


Deck.prototype.shuffle = function () {
	this.deck = _.shuffle(this.deck);
};
Deck.prototype.cut = function () {
	var index = Math.floor(Math.random() * this.deck.length);
	this.cut_card = this.deck.splice(index, 1)[0];
};
Deck.prototype.deal = function (player1, player2) {
	var that = this;
	_.times(12, function (n) {
		( n % 2 === 0) ? player1.hand.push(that.deck.pop()) : player2.hand.push(that.deck.pop());
	})
};

module.exports = Deck;