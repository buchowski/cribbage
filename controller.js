(function (root) {

	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var Controller = CRIBBAGE.Controller = function () {
		controller = this;
		controller.view = new CRIBBAGE.View();
		controller.executes = {
			submit_player_names: function (e) {
				e.preventDefault();
				var player1_name = $("#player1_name").val();
				var player2_name = $("#player2_name").val();
				$('#create_players').hide(400, function () {
					controller.create_game([player1_name, player2_name]);
				})
			},
			discard: function (e) {
				var val_and_suit = Controller.get_val_suit($(this));
				controller.discard_card(val_and_suit);
			},
			play: function (e) {
				var val_and_suit = Controller.get_val_suit($(this));
				controller.play_card(val_and_suit);
			},
			close_warning: function (e) {
				// $("#cribbage").empty();
				$("#cribbage").append(controller.view.renders["game_template"].call(controller.game, [controller.play_msg()]));

				controller.toggle_prompt_class(false);

				$("#" + controller.game.current_player.id).on("click", ".card", controller.executes["play"]);
			},
			return_cards: function (e) {
				controller.game.pile.return_cards_to_players();
				$("#cribbage").append(controller.view.renders["game_template"].call(controller.game, ["big dog know best!"]));
				controller.toggle_prompt_class(false);
			}
		};
		$("#cribbage").empty();
		$("#cribbage").append(controller.view.renders["new_player_template"]);
		$("#create_players").on("submit", this.executes["submit_player_names"]);
	};
	Controller.prototype.play_card = function (val_and_suit) { 
		var hand = this.game.current_player.hand;
		var renders = this.view.renders;
		var pile = this.game.pile;
		var callback = "close_warning";
		var reset_score = false;
		var messages = [];

		if (pile.is_valid_push(val_and_suit)) {
			var card_index = hand.get_card_index(val_and_suit);
			var card = hand.splice_card(card_index);

			pile.push(card);
			pile.update_score(card);

			if (pile.score == 15) messages.push(this.fifteen());

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();
			} else if (this.game.current_player.hand.has_playable_card(pile)) {
				messages.push(this.still_your_turn_msg());
			} else { 
				reset_score = true;
				this.game.current_player.score += 1; 
				(pile.score == 31) ? messages.push(this.thirtyone()): messages.push(this.point_for_last_card_msg());

				if (this.game.are_both_hands_empty()) {
					messages.push(this.both_hands_empty_msg());
					callback = "return_cards";
				} else if (this.game.other_player().hand.cards.length == 0) {
					messages.push(this.still_your_turn_msg());
				} else {
					this.game.switch_player();
				}
			}
		} else { 
			messages.push(this.invalid_card_msg());
		}

		if (messages.length == 0) messages = [this.play_msg()];
		$("#cribbage").append(this.view.renders["game_template"].call(this.game, messages));
		(messages[0] == this.play_msg()) ? this.play_bind() : this.display_info_msg(callback);

		if (reset_score) pile.score = 0;
	};
	Controller.prototype.fifteen = function () {
		this.game.current_player.score += 2;
		return this.fifteen_msg();
	},
	Controller.prototype.play_bind = function () {
		$("#" + this.game.current_player.id).on("click", ".card", controller.executes["play"]);
	}
	Controller.prototype.thirtyone = function () {
		this.game.current_player.score += 1; // player already received 1 point for last card
		return this.thirtyone_msg();
	},
	Controller.prototype.display_info_msg = function (callback) {
		$("#prompt").append(this.view.renders["ok_button_template"]);
		this.toggle_prompt_class(true);
		$("#warning").on("click", this.executes[callback]);
	}
	Controller.prototype.discard_card = function (val_and_suit) {
		var hand = this.game.current_player.hand;
		var count = this.game.discard_count;
		var card_index = hand.get_card_index(val_and_suit);
		var card = hand.splice_card(card_index);

		this.game.dealer.crib.push(card);
		this.game.discard_count++;
		this.game.switch_player();

		var callback = (count < 3) ? "discard" : "play";
		var message = (count < 3) ? this.discard_msg : this.play_msg;

		$("#cribbage").empty();
		$("#cribbage").append(this.view.renders["game_template"].call(this.game, [message.call(this)]));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes[callback]);
	};
	Controller.prototype.create_game = function (player_names) {
		this.game = new CRIBBAGE.Game(player_names, controller);

		this.game.deck.add_52_cards();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deck.shuffle();
		this.game.deal();

		$("#cribbage").append(this.view.renders["game_template"].call(this.game, [this.discard_msg()]));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);

	};
	Controller.prototype.toggle_prompt_class = function (display) {
		$("body").toggleClass("gray", display);
		$("#prompt").toggleClass("white", display);
	};
	Controller.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
	Controller.prototype.play_msg = function () {
		return this.game.current_player.name + ", slap a card down on the battlefield!";
	};
	Controller.prototype.discard_msg = function () {
		return this.game.current_player.name + ", rid thyself of a card!";
	};
	Controller.prototype.fifteen_msg = function () {
		return this.game.current_player.name + " gets 2 points for 15!";
	};
	Controller.prototype.thirtyone_msg = function () {
		return this.game.current_player.name + " gets 2 points for 31!";
	};
	Controller.prototype.point_for_last_card_msg = function () {
		return this.game.current_player.name + " gets 1 point for last card.";
	};
	Controller.prototype.still_your_turn_msg = function () {
		return this.game.current_player.name + " it's still your turn. " + this.game.other_player().name + "can't play a card.";
	};
	Controller.prototype.both_hands_empty_msg = function () {
		return  "both players' hands are empty. Let's score our hands and the crib now.";
	};
	Controller.prototype.invalid_card_msg = function () {
		return this.game.current_player.name + ", you cannot play that card!";
	};
})(this);
