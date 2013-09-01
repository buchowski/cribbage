var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];

function Card(suit, val) {
	this.suit = suit;
	this.val = val;
}

module.exports.Card = Card;
module.exports.VALS = VALS;
module.exports.SUITS = SUITS;