(function (root) {

	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var Controller = CRIBBAGE.Controller = function () {
		controller = this;
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
				$("#cribbage").append(CRIBBAGE.View.main_template(controller.game, "slap a card down on thy battlefield!"));
				$("#" + controller.game.current_player.id).on("click", ".card", controller.executes["play"]);
			}
		};
		$("#cribbage").empty();
		$("#cribbage").append(CRIBBAGE.View.new_player_template());
		$("#create_players").on("submit", this.executes["submit_player_names"]);
	};
	Controller.prototype.play_card = function (val_and_suit) { 
		var hand = this.game.current_player.hand;
		var pile = this.game.pile;
		$("#cribbage").empty();

		if (pile.is_valid_push(val_and_suit)) {
			var card_index = hand.get_card_index(val_and_suit);
			var card = hand.splice_card(card_index);
			pile.push(card);
			pile.update_score(card);

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();

				$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "slap a card down on thy battlefield!"));
				$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
			} else if (this.game.current_player.hand.has_playable_card(pile)) {
				// the other player can't make a play so it's still the current player's turn
				$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "it's still your turn. " + this.game.other_player().name + "can't play a card."));
				$("#prompt").append("<input id='warning' type='button' value='Okee Dokee' />");
				$("#warning").on("click", this.executes["close_warning"]);

			} else { // neither player can play a card
				this.game.current_player.score += (pile.score == 31) ? 2 : 1;

				if (this.game.are_both_hands_empty()) {
					$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "gets a point or two for last card. " + 
						"Both players' hands are empty. Let's score our hand's and the crib now."));
					$("#prompt").append("<input id='warning' type='button' value='Okee Dokee' />");
				} else if (this.game.other_player().hand.cards.length == 0) {

					$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "it's still your turn. " + this.game.other_player().name + "can't play a card. " +
						this.game.current_player.name + " gets a point or two for last card."));
					$("#prompt").append("<input id='warning' type='button' value='Okee Dokee' />");
					pile.score = 0;
					$("#warning").on("click", this.executes["close_warning"]);
				} else {
					this.game.switch_player();

					$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "it's your turn. " + 
						this.game.other_player().name + " gets a point or two for last card."));
					$("#prompt").append("<input id='warning' type='button' value='Okee Dokee' />");
					pile.score = 0;
					$("#warning").on("click", this.executes["close_warning"]);
				}
			}
		} else { // the push isn't valid
			$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "you cannot play that card!"));
			$("#prompt").append("<input id='warning' type='button' value='Okee Dokee' />");
			$("#warning").on("click", this.executes["close_warning"]);
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
		$("#cribbage").empty();

		if (count < 3) {
			$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "rid thyself of a card!"));
			$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);
		} else {
			$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "slap a card down on thy battlefield!"));
			$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
		}
	};
	Controller.prototype.create_game = function (player_names) {
		this.game = new CRIBBAGE.Game(player_names, controller);

		this.game.deck.add_52_cards();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deck.shuffle();
		this.game.deal();

		$("#cribbage").empty();
		$("#cribbage").append(CRIBBAGE.View.main_template(this.game, "rid thyself of a card!"));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);

	};
	Controller.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
})(this);
