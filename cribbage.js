root._ = require('./underscore.js');
var Deck = require('./deck.js');

function Player() {
	this.hand = [];
}
Player.prototype.discard = function (deck) {

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


