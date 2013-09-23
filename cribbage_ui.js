root._ = require('./underscore.js');
var Player = require('./cribbage.js').Player;
var Game = require('./cribbage.js').Game;
var Hand = require('./cribbage.js').Hand;
var Deck = require('./cribbage.js').Deck;
var Card = require('./cribbage.js').Card;

var COLORS = {'green': '\033[32m', 'cyan': '\033[36m', 'black': '\033[0m', 'red': '\033[31m'}

function UI (player1, player2) {
	this.game = new Game(player1, player2);
	this.readline = require('readline');
	this.rl = this.readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
}
UI.prototype.print_state = function () {
	var that = this;
	_.each([this.game.player1, this.game.player2], function (player) {
		console.log(player.name + ' hand: ' + that.show_hand(player.hand));
		console.log(player.name + ' crib: ' + that.show_hand(player.crib));
	})
	console.log('pile: ' + JSON.stringify(this.game.pile.cards));
}
UI.prototype.show_hand = function (hand) {
	return _.map(hand.cards, function (card) {
		return card.val + card.suit;
	}).join(', ');
}
UI.prototype.discard = function () {
	var game = this.game;
	var that = this;

	if ( game.cards_discarded() ) { 
		game.register_cards();
		that.play();
		game.reset_discard_count();
		return; 
	} else {
		this.show_current_players_hand();
		this.rl.question(this.ask_for_discard() , function (card) {
			game.dealer.crib.push(game.current_player.discard(card));
			game.increment_discard_count();
			game.switch_player();
			that.discard();
		})
	}
}

UI.prototype.play = function () {
	var game = this.game;
	var that = this;

<<<<<<< HEAD
	game.switch_player();

	if ( game.all_hands_played() ) {
=======
	if ( game.player1.hand.cards.length == 0 && game.player2.hand.cards.length == 0 ) {
>>>>>>> score_tracker
		that.rl.close();
		that.print_state();
		return;
	} else {
		this.show_current_players_hand();
		this.rl.question(this.ask_for_card() , function (card) {
			game.pile.push(game.current_player.discard(card));
			that.show_scores(game);
			that.play();
		})
	}
<<<<<<< HEAD
}
UI.prototype.ask_for_discard = function () {
	return this.game.current_player.name + ', what card would you like to discard?';
}
UI.prototype.ask_for_card = function () {
	return this.game.current_player.name + ', add a card to the pile.'
}
UI.prototype.show_current_players_hand = function () {
	var player = this.game.current_player;
	console.log(player.name + "'s hand: " + COLORS['green'] + this.show_hand(player.hand) + COLORS['black']);
}
=======

	console.log(game.current_player.name + "'s hand: " + COLORS['green'] + this.show_hand(game.current_player.hand) + COLORS['black']);

	this.rl.question(game.current_player.name + ', add a card to the pile.', function (card) {

		if ( game.pile.is_valid_push(game.current_player.card(card)) ) { 
			game.pile.push(game.current_player.discard(card));
			game.switch_player();
		} else {
			if ( game.current_player.hand.has_playable_card(game) ) {
				console.log(COLORS['red'] + "you can't play that card. try again." + COLORS['black']);
			} else { 
				game.switch_player(); //can the opponent play a card?
				if ( game.current_player.hand.has_playable_card(game) ) {
					console.log(COLORS['red'] + "you can't play any cards." + COLORS['black']);
				} else {
					console.log(COLORS['red'] + "neither player can play a card. reset to zero." + COLORS['black']);
					game.switch_player();
					game.pile.reset_score();
					game.reward_point_for_last_card();
				}
			}
		}
		that.show_scores(game);
		that.play();
	})
}
>>>>>>> score_tracker
UI.prototype.show_scores = function (game) {
	console.log(COLORS['cyan'] + 'the pile score is: ' + game.pile.score);
	console.log(game.player1.name + "'s score is: " + game.player1.score);
	console.log(game.player2.name + "'s score is: " + game.player2.score + COLORS['black']);
}
<<<<<<< HEAD
=======

>>>>>>> score_tracker

var jeremy = new Player('jeremy');
var nathan = new Player('nathan');
var ui = new UI(jeremy, nathan); //The first player you pass is the dealer

ui.game.deck.cut();
ui.game.deck.shuffle();
ui.game.deck.deal(jeremy, nathan);
ui.discard();