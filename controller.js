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
				$("#cribbage").empty();
				$("#cribbage").append(controller.view.renders["game_template"].call(controller.game, ["play_msg"]));
				$("body").toggleClass("gray", false);
				$("#" + controller.game.current_player.id).on("click", ".card", controller.executes["play"]);
			}
		};
		$("#cribbage").empty();
		$("#cribbage").append(controller.view.renders["new_player_template"]);
		$("#create_players").on("submit", this.executes["submit_player_names"]);
	};
	Controller.prototype.play_card = function (val_and_suit) { 
		var hand = this.game.current_player.hand;
		var pile = this.game.pile;
		var append_prompt = true;
		var reset_score = false;
		var messages = [];

		if (pile.is_valid_push(val_and_suit)) {
			var card_index = hand.get_card_index(val_and_suit);
			var card = hand.splice_card(card_index);

			pile.push(card);
			pile.update_score(card);

			if (pile.score == 15 || pile.score == 31) {
				this.game.current_player.score += 2;
				(pile.score == 15) ? messages.push("fifteen_msg") : messages.push("thirtyone_msg"); ;
			} 

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();
				if (pile.score != 15) {
					append_prompt = false;
					messages.push("play_msg");
				}
			} else if (this.game.current_player.hand.has_playable_card(pile)) {
				// the other player can't make a play so it's still the current player's turn
				messages.push("still_your_turn_msg");
			} else { // neither player can play a card
				if (pile.score != 31) {
					this.game.current_player.score += 1;
					messages.push("point_for_last_card_msg");
				} 
				reset_score = true;
				if (this.game.are_both_hands_empty()) {
					messages.push("both_hands_empty_msg");
				} else if (this.game.other_player().hand.cards.length == 0) {
					messages.push("still_your_turn_msg");
				} else {
					this.game.switch_player();
					messages.push("play_msg");
				}
			}
		} else { // the push isn't valid
			messages.push("invalid_card_msg");
		}
		$("#cribbage").empty();
		$("#cribbage").append(this.view.renders["game_template"].call(this.game, messages));
		if (append_prompt) {
			$("#prompt").append(this.view.renders["ok_button_template"]);
			$("body").toggleClass("gray", true);
			$("#prompt").toggleClass("white", true);
			$("#warning").on("click", this.executes["close_warning"]);
			if (reset_score) pile.score = 0;
		} else {
			$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
		}
	};
	Controller.prototype.discard_card = function (val_and_suit) {
		var hand = this.game.current_player.hand;
		var count = this.game.discard_count;
		var card_index = hand.get_card_index(val_and_suit);
		var card = hand.splice_card(card_index);

		this.game.dealer.crib.push(card);
		this.game.discard_count++;
		this.game.switch_player();

		var callback = (count < 3) ? "discard" : "play";
		var message = (count < 3) ? "discard_msg" : "play_msg";

		$("#cribbage").empty();
		$("#cribbage").append(this.view.renders["game_template"].call(this.game, [message]));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes[callback]);
	};
	Controller.prototype.create_game = function (player_names) {
		this.game = new CRIBBAGE.Game(player_names, controller);

		this.game.deck.add_52_cards();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deck.shuffle();
		this.game.deal();

		$("#cribbage").empty();
		$("#cribbage").append(this.view.renders["game_template"].call(this.game, ["discard_msg"]));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);

	};
	Controller.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
})(this);
