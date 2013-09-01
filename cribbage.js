root._ = require('./underscore.js');

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];

function Card(suit, val) {
	this.suit = suit;
	this.val = val;
}

function Deck() {
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

var deck = new Deck();
_.times(30, function (n) {
	deck.cut();
	console.log('deck length: ' + deck.deck.length + ", cut card: " + deck.cut_card.val + deck.cut_card.suit);
})




