root._ = require('./underscore.js');

var VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
var SUITS = ['H', 'C', 'S', 'D'];
var COLORS = {'green': '\033[32m', 'cyan': '\033[36m', 'black': '\033[0m'}





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
Hand.prototype.show = function () {
	var card_str = '';
	_.each(this.cards, function (card) {
		card_str += card.val + card.suit + ', ';
	})
	return card_str;
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
Game.prototype.discard = function () {
	var that = this;
	var rl = this.create_interface();
	
	if ( this.discard_count >= 4 ) { 
		rl.close(); 
		this.register_cards();
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

Game.prototype.play = function () {
	var that = this;
	var rl = this.create_interface();

	this.switch_player();

	if ( this.player1.hand.cards.length == 0 && this.player2.hand.cards.length == 0 ) {
		rl.close();
		this.print_state();
		return;
	}

	console.log(this.current_player.name + "'s hand: " + COLORS['green'] + this.current_player.hand.show() + COLORS['black']);

	rl.question(this.current_player.name + ', add a card to the pile.', function (card) {
		rl.close();

		that.pile.push(that.current_player.discard(card));
		
		console.log(COLORS['cyan'] + 'the pile score is: ' + that.pile.score);
		console.log(that.player1.name + "'s score is: " + that.player1.score);
		console.log(that.player2.name + "'s score is: " + that.player2.score + COLORS['black']);
		that.play();
	})
}
Game.prototype.create_interface = function () {
	var readline = require('readline');
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
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
Game.prototype.print_state = function () {
	_.each([this.player1, this.player2], function (player) {
		console.log(player.name + ' hand: ' + player.hand.show());
		console.log(player.name + ' crib: ' + player.crib.show());
	})
	console.log('pile: ' + JSON.stringify(this.pile.cards));
}





var jeremy = new Player('jeremy');
var nathan = new Player('nathan');
var game = new Game(jeremy, nathan); //The first player you pass is the dealer

game.deck.cut();
game.deck.shuffle();
game.deck.deal(jeremy, nathan);
game.discard();







