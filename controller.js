(function (root) {

	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var Controller = CRIBBAGE.Controller = function () {
		controller = this;
		controller.executes = {
			submit_player_names: function (e) {
				e.preventDefault();
				var player1_name = $("#player1").val();
				var player2_name = $("#player2").val();
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
			}
		};
		$("body").empty();
		$("body").append(CRIBBAGE.View.new_player_template());
		$("#create_players").on("submit", this.executes["submit_player_names"]);
	};
	Controller.prototype.play_card = function (val_and_suit) { // return [val, suit];
		var hand = this.game.current_player.hand;
		var pile = this.game.pile;

		if (pile.is_valid_push(val_and_suit[0])) {
			var card_index = hand.get_card_index(val_and_suit);
			var card = hand.splice_card(card_index);
			pile.push(card);
			pile.update_score(card);
			$("body").empty();

			if (this.game.other_player().hand.has_playable_card(pile)) {
				this.game.switch_player();

				$("body").append(CRIBBAGE.View.play_template(this.game));
				$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
			} else if (this.game.current_player().hand.has_playable_card(pile)) {
				// the other player can't make a play so it's still the current player's turn
				$("body").append(CRIBBAGE.View.play_template(this.game));
				$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
			} else { // neither player can play a card
				round.current_player.score += (pile.score == 31) ? 2 : 1;
				if (this.game.are_both_hands_empty()) {
					alert("y'all done done it!!!");
				} else if (this.game.other_player().hand.cards.length == 0) {
					pile.score == 0;

					$("body").append(CRIBBAGE.View.play_template(this.game));
					$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
				} else {
					pile.score == 0;
					this.game.switch_player();

						$("body").append(CRIBBAGE.View.play_template(this.game));
						$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
				}
			}
		} else {
			alert("no puedes hacer lo jefe!");
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
		$("body").empty();

		if (count < 3) {
			$("body").append(CRIBBAGE.View.discard_template(this.game));
			$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);
		} else {
			$("body").append(CRIBBAGE.View.play_template(this.game));
			$("#" + this.game.current_player.id).on("click", ".card", this.executes["play"]);
		}
	};
	Controller.prototype.create_game = function (player_names) {
		this.game = new CRIBBAGE.Game(player_names, controller);

		this.game.deck.add_52_cards();
		this.game.cut_card = this.game.deck.cut_card();
		this.game.deck.shuffle();
		this.game.deal();

		$("body").empty();
		$("body").append(CRIBBAGE.View.discard_template(this.game));
		$("#" + this.game.current_player.id).on("click", ".card", this.executes["discard"]);

	};
	Controller.get_val_suit = function($el) {
		var val = $el.attr('id')[0];
		var val = ( val == '1') ? '10' : val;
		var suit = ( val == '10') ? $el.attr('id')[2] : $el.attr('id')[1];
		return [val, suit];
	};
})(this);
