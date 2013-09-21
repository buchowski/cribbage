root._ = require('./underscore.js');

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];
var COLORS = {'green': '\033[32m', 'cyan': '\033[36m', 'black': '\033[0m'}

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
Hand.prototype.show = function () {
	var card_str = '';
	_.each(this.cards, function (card) {
		card_str += card.val + card.suit + ', ';
	})
	return card_str;
}

function Pile() {
	this.cards = [];
}
Pile.prototype = Object.create(Hand.prototype);
Pile.prototype.score = function () {
	var total_score = 0;
	_.each(this.cards, function (card) {
		if ( card.val == 'A' ) { 
			total_score += 1;
		} else if ( isNaN(Number(card.val)) ) {
			total_score += 10;
		} else {
			total_score += Number(card.val);
		}
	})
	return total_score;
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
	this.pile = new Pile();
	this.current_player = player1;
	this.dealer = player1;
	this.player1 = player1;
	this.player2 = player2;
	this.discard_count = 0;
}
Game.prototype.discard = function () {
	var that = this;
	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	if ( this.discard_count >= 4 ) { 
		rl.close(); 
		this.play();
		this.discard_count = 0;
		return; 
	} 
	console.log(this.current_player.name + "'s hand: " + COLORS['green'] + this.current_player.hand.show() + COLORS['black']);
	rl.question(this.current_player.name + ', what card would you like to discard?', function (card) {
		rl.close();
		that.dealer.crib.push(that.current_player.discard(card));
		that.discard_count++;
		that.switch_player();
		that.discard();
	})
}
Game.prototype.switch_player = function () {
	this.current_player = ( this.current_player == this.player1 ) ? this.player2: this.player1;
}
Game.prototype.play = function () {
	var that = this;
	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	this.switch_player();

	if ( this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0 ) {
		rl.close();
		this.print_state();
		return;
	}

	console.log(this.current_player.name + "'s hand: " + COLORS['green'] + this.current_player.hand.show() + COLORS['black']);

	rl.question(this.current_player.name + ', add a card to the pile.', function (card) {
		rl.close();
		that.pile.cards.push(that.current_player.discard(card));
		console.log(COLORS['cyan'] + 'the pile score is: ' + that.pile.score() + COLORS['black']);
		that.play();
	})
}

Game.prototype.print_state = function () {
	_.each([this.player1, this.player2], function (player) {
		console.log(player.name + ' hand: ' + player.hand.show());
		console.log(player.name + ' crib: ' + player.crib.show());
	})
	console.log('pile: ' + this.pile.show());
}

var jeremy = new Player('jeremy');
var nathan = new Player('nathan');
var game = new Game(jeremy, nathan); //The first player you pass is the dealer

game.deck.cut();
game.deck.shuffle();
game.deck.deal(jeremy, nathan);
game.discard();






