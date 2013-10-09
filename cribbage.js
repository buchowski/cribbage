(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var VALS = CRIBBAGE.VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
	var SUITS = CRIBBAGE.SUITS = ['H', 'C', 'S', 'D'];

	var Card = CRIBBAGE.Card = function (suit, val) {
		this.holder = null;
		this.suit = suit;
		this.val = val;
	}
	Card.prototype.int_val = function () {
		var num = Number(this.val);
		return ( isNaN(num) ) ? ((this.val == 'A') ? 1 : 10 ): num;
	};

	var Deck = CRIBBAGE.Deck = function (game) {
		this.game = game;
		this.cut_card = null;
		this.cards = [];
		for (var i = 0; i < SUITS.length; i++ ) {
			for (var j = 0; j < VALS.length; j++ ) {
				this.cards.push(new Card(SUITS[i], VALS[j]));
			}
		}
	};
	Deck.prototype.shuffle = function () {
		this.cards = _.shuffle(this.cards);
	};
	Deck.prototype.cut = function () {
		var index = Math.floor(Math.random() * this.cards.length);
		this.cut_card = this.cards.splice(index, 1)[0];
	};
	Deck.prototype.push = function (card, render) {
		var hand = this.game.round.current_player.hand;
		var round = this.game.round;

		this.cards.push(hand.cards.splice(hand.get_card_index(card[0], card[1]), 1)[0]);
		round.discard_count++;
		round.switch_player();
		render();
	};

	var Hand = CRIBBAGE.Hand = function () {
		this.cards = [];
		this.score = 0;
	};
	Hand.prototype.push = function (card) {
		this.cards.push(card);
	};
	
	Hand.prototype.get_card_index = function (val, suit) {
		for (var i = 0; i < this.cards.length; i++) {
			var card = this.cards[i];
			if (card.val == val && card.suit == suit) return i;
		}
	}
	Hand.prototype.has_playable_card = function (pile) {
		return _.some(this.cards, function (card) {
			return pile.is_valid_push(card);
		})
	};

	var Pile = CRIBBAGE.Pile = function (game) {
		this.game = game;
		this.hand = new Hand();
		this.score = 0;
		this.name = 'Pile';
	}
	Pile.prototype.push = function (card, render) {
		var pile = this;
		var round = pile.game.round;
		var hand = round.current_player.hand;
		var card_index = hand.get_card_index(card[0], card[1]);
		var callback = pile.reset_score.bind(pile);
		var msg = "";

		if (pile.is_valid_push(hand.cards[card_index])) {
			card = hand.cards.splice(card_index, 1)[0];
			pile.hand.cards.push(card);
			pile.update_score(card);
			round.discard_count++;

			if (round.other_player.hand.has_playable_card(pile)) { 
				round.switch_player();
				msg = null;
			} else if (round.current_player.hand.has_playable_card(pile)) { 
				msg += round.other_player.name + " can't play a card so it's still " + round.current_player.name + "'s turn.";
			} else { // neither player can play a card 
				msg += round.current_player.name;
				msg += (pile.score == 31) ? " gets 2 points for 31!" : " gets point for last card.";
				round.current_player.score += (pile.score == 31) ? 2 : 1;

				if (pile.game.are_both_hands_empty()) {
					msg += " The round is over.";
					callback = pile.return_cards_to_players.bind(pile);
					// if (round.current_player == round.dealer) { round.switch_player(); }
				} else if (round.other_player.hand.cards.length == 0) {
					msg += round.other_player.name + " has no cards so it's still " + round.current_player.name + "'s turn.";
				} else {
					round.switch_player();
				}
			}
			render(msg, callback);
		} else {
			render('invalid push. try a different card.');
		}
	}
	Pile.prototype.is_valid_push = function (card) {
		return ( this.score + card.int_val() <= 31 );
	}
	Pile.prototype.update_score = function (card) {
		this.score += card.int_val();
	};
	Pile.prototype.reset_score = function () {
		this.score = 0;
	};
	Pile.prototype.return_cards_to_players = function () {
		var pile = this;
		while (pile.hand.cards.length != 0) {
			var card = pile.hand.cards.pop();
			card.holder.hand.push(card);
		}
	};
	var Round = CRIBBAGE.Round = function (game) {
		this.game = game;
		this.current_player = game.players[0];
		this.other_player = game.players[1];
		this.dealer = game.players[1];
		this.discard_count = 0;
	};
	Round.prototype.switch_player = function () {
		var temp_player = this.current_player;
		this.current_player = this.other_player;
		this.other_player = temp_player;
	};

	var Player = CRIBBAGE.Player = function (name, game) {
		this.name = name;
		this.game = game;
		this.hand = new Hand();
		this.crib = new Hand();
		this.score = 0;
	};
	// Player.prototype.discard = function (val, suit, group, render) {
	// 	var round = this.game.round;
	// 	var hand = this.hand;

	// 	group.push(hand.cards.splice(hand.get_card_index(val, suit), 1)[0])
	// 	round.discard_count++;
	// 	round.switch_player();
	// 	render();
	// };
	var Game = CRIBBAGE.Game = function (player1, player2, view) {
		this.view = view;
		this.deck = new CRIBBAGE.Deck(this);
		this.pile = new CRIBBAGE.Pile(this);
		this.players = [new CRIBBAGE.Player(player1, this), new CRIBBAGE.Player(player2, this)];
		this.round = new Round(this);
	};
	Game.prototype.deal = function () {
		var game = this;
		_.times(12, function (n) {
			var card = game.deck.cards.pop();
			card.holder = game.players[ n % 2 ];
			game.players[ n % 2 ].hand.push(card);
		})
	};
	Game.prototype.any_playable_cards = function () {
		 return (this.players[0].hand.has_playable_card(this.pile) || this.players[1].hand.has_playable_card(this.pile));
	};
	Game.prototype.are_both_hands_empty = function () {
		return (this.players[0].hand.cards.length == 0 && this.players[1].hand.cards.length == 0);
	}
})(this);





