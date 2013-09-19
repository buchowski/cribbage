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
Deck.prototype.deal = function (player1, player2) {
	var that = this;
	_.times(12, function (n) {
		( n % 2 === 0) ? player1.hand.push(that.deck.pop()) : player2.hand.push(that.deck.pop());
	})
};

function Hand() {
	this.cards = [];
}
Hand.prototype.push = function (card) {
	this.cards.push(card);
}


function Player(name) {
	this.name = name;
	this.hand = new Hand();
	this.crib = new Hand();
}
Player.prototype.discard = function (card) {
	return this.hand.cards.splice(card - 1, 1)[0];
};

function Game(player1, player2) {
	
	this.deck = new Deck();
	this.current_player = player1;
	this.dealer = player1;
	this.player1 = player1;
	this.player2 = player2;
	this.discard_count = 0;
}
Game.prototype.prompt = function () {
	var that = this;
	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	if ( this.discard_count >= 4 ) { 
		rl.close(); 
		this.print_state();
		return; 
	} 

	rl.question(this.current_player.name + ', what card would you like to discard?', function (answer) {
		rl.close();
		that.dealer.crib.push(that.current_player.discard(answer));
		that.discard_count++;
		that.current_player = ( that.current_player == that.player1 ) ? that.player2: that.player1;
		that.prompt();
	})
}

Game.prototype.print_state = function () {
	_.each([this.player1, this.player2], function (player) {
		console.log(player.name + ' hand: ');
		_.each(player.hand.cards, function (card) {
			console.log(card);
		})
		console.log(player.name + ' crib: ');
		_.each(player.crib.cards, function (card) {
			console.log(card);
		})
	})
}

var jeremy = new Player('jeremy');
var nathan = new Player('nathan');
var game = new Game(jeremy, nathan); //The first player you pass is the dealer

game.deck.cut();
game.deck.shuffle();
game.deck.deal(jeremy, nathan);
game.prompt();






