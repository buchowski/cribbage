root._ = require('./underscore.js');

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];

function Card(suit, val) {
	this.suit = suit;
	this.val = val;
}
function Player() {
	this.hand = [];
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
Deck.prototype.deal = function (player1, player2) {
	var that = this;
	_.times(12, function (n) {
		( n % 2 === 0) ? player1.hand.push(that.deck.pop()) : player2.hand.push(that.deck.pop());
	})
};

var jeremy = new Player();
var nathan = new Player();
var deck = new Deck();

deck.cut();
deck.shuffle();
deck.deal(jeremy, nathan);

console.log(deck.deck.length);
console.log(jeremy.hand);
console.log(nathan.hand);




