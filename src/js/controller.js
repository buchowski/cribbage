(function (root) {

	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	var Controller = CRIBBAGE.Controller = class {
		constructor() {
			this.view = new CRIBBAGE.View();

			var CreateGame = this.view.getReactComponents();

			ReactDOM.render(
				<CreateGame createGame={ this.createGame.bind(this) } />,
				document.getElementById('cribbage')
			);
		}
		discard(e) {
			var valAndSuit = this.getValSuit($(e.target));
			this.discardCard(valAndSuit);
		}
		play(e) {
			var valAndSuit = this.getValSuit($(e.target));
			this.playCard(valAndSuit);
		}
		closeWarning() {
			$("#cribbage").empty().append(this.view.gameTemplate(this.game, [this.playMsg()]));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			$("#" + this.game.currentPlayer.id).on("click", ".card", this.play.bind(this));
		}
		returnCards() {
			this.game.pile.returnCardsToPlayers();
			$("#cribbage").empty().append(this.view.gameTemplate(this.game, []));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			this.scoreHand();
		}
		newRound() {
			var game = this.game;

			game.discardCount = 0;
			game.returnCardsToDeck();
			game.deck.shuffle();
			game.cutCard = game.deck.cutCard();
			game.deal();

			game.dealer = (game.dealer === game.players[0]) ? game.players[1] : game.players[0];
			if (game.currentPlayer === game.dealer) {
				game.switchPlayer();
			}

			$("#cribbage").empty().append(this.view.gameTemplate(game, [this.discardMsg()]));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			$("#" + game.currentPlayer.id).on("click", ".card", this.discard.bind(this));
		}
		scoreHand() {
			var player = this.game.currentPlayer;
			var scores;
			var elId;

			if ($("#" + player.id + " > table").length === 0) {
				scores = player.hand.scoreCards(); //scores[0] contains the scores array. scores[1] contains the score sum
				elId = player.id;
				$("#prompt").empty().append("<h3>" + this.scoringHand("hand") + "</h3>");
			} else {
				scores = player.crib.scoreCards();
				elId = "crib";
				$("#prompt").empty().append("<h3>" + this.scoringHand("crib") + "</h3>");
			}

			$("<table id='" + elId + "_score_table' class='table table-striped table-condensed'></table>").insertBefore("#" + elId + " > .card");
			this.appendScores(elId, scores, 0);
		}
		appendScores(elId, scores, index) {
			var totalScore = CRIBBAGE.Hand.totalScore(scores);
			root.setTimeout(() => {
				var fn = (scores.length === 0) ? this.view.bummerTemplate : this.view.scoreRowTemplate;
				$("#" + elId + "_score_table").append(fn(scores[index]));

				if (index < scores.length - 1) {
					this.appendScores(this, elId, scores, index + 1);
				} else {
					var newScore = this.game.currentPlayer.score + totalScore;
					var fn = (scores.length !== 0) ? this.scoreAnimation : this.displayScoreMsg;
					fn.call(this, ["+", totalScore, "=", newScore], 0);
				}
			}, 1800);
		}
		scoreAnimation(newScoreArray, index) {
			root.setTimeout(() => {
				var fn = (index < newScoreArray.length - 1) ? this.scoreAnimation : this.slideScore;

				$("#" + this.game.currentPlayer.id + "_score").append(" <span>" + newScoreArray[index] + "</span>");
				fn.call(this, newScoreArray, index + 1);
			}, 1000);
		}
		displayScoreMsg(newScoreArray) {
			var fn = ($("#crib > table").length === 0) ? this.scoreHand : this.newRound;
			var handName = ($("#crib > table").length === 0) ? "hand" : "crib";

			$("#prompt").empty().append("<h3>" + this.pointsScoredMsg(newScoreArray[1], handName) + "</h3>");
			this.displayInfoMsg(fn.bind(this));

			this.game.currentPlayer.score = newScoreArray[3];
			if (this.game.currentPlayer !== this.game.dealer) {
				this.game.switchPlayer();
			}
		}
		slideScore(newScoreArray) {
			root.setTimeout(() => {
				var player = this.game.currentPlayer;
				$("#" + player.id + "_score").empty();
				$("#" + player.id + "_score").append(player.name + "'s Score: " + newScoreArray[3]);
				this.displayScoreMsg.bind(this, newScoreArray);
			}, 700);
		}
		playCard(valAndSuit) {
			var hand = this.game.currentPlayer.hand;
			var pile = this.game.pile;
			var callback = this.closeWarning.bind(this);
			var resetScore = false;
			var messages = [];

			if (pile.isValidPush(valAndSuit)) {
				var cardIndex = hand.getCardIndex(valAndSuit);
				var card = hand.spliceCard(cardIndex);

				pile.push(card);
				pile.updateScore(card);

				if (pile.score === 15) {
					messages.push(this.fifteen());
				}

				if (this.game.otherPlayer().hand.hasPlayableCard(pile)) {
					this.game.switchPlayer();
				} else if (this.game.currentPlayer.hand.hasPlayableCard(pile)) {
					messages.push(this.stillYourTurnMsg());
				} else {
					resetScore = true;
					this.game.currentPlayer.score += 1;

					if (pile.score === 31) {
						messages.push(this.thirtyone());
					} else {
						messages.push(this.pointForLastCardMsg());
					}

					if (this.game.areBothHandsEmpty()) {
						if (this.game.currentPlayer === this.game.dealer) {
							this.game.switchPlayer();
						}
						messages.push(this.bothHandsEmptyMsg());
						callback = this.returnCards.bind(this);
					} else if (this.game.otherPlayer().hand.cards.length === 0) {
						messages.push(this.stillYourTurnMsg());
					} else {
						this.game.switchPlayer();
					}
				}
			} else {
				messages.push(this.invalidCardMsg());
			}

			if (messages.length === 0) {
				messages = [this.playMsg()];
			}
			$("#cribbage").empty().append(this.view.gameTemplate(this.game, messages));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			if (messages[0] === this.playMsg()) {
				this.playBind();
			} else {
				this.displayInfoMsg(callback);
			}

			if (resetScore) {
				pile.score = 0;
			}
		}
		fifteen() {
			this.game.currentPlayer.score += 2;
			return this.fifteenMsg();
		}
		playBind() {
			$("#" + this.game.currentPlayer.id).on("click", ".card", this.play.bind(this));
		}
		thirtyone() {
			this.game.currentPlayer.score += 1; // player already received 1 point for last card
			return this.thirtyoneMsg();
		}
		displayInfoMsg(callback) {
			$("#prompt").append(this.view.okButtonTemplate());
			$("#warning").on("click", callback.bind(this));
		}
		discardCard(valAndSuit) {
			var hand = this.game.currentPlayer.hand;
			var count = this.game.discardCount;
			var cardIndex = hand.getCardIndex(valAndSuit);
			var card = hand.spliceCard(cardIndex);

			this.game.dealer.crib.push(card);
			this.game.discardCount++;
			this.game.switchPlayer();

			var callback = (count < 3) ? this.discard : this.play;
			var message = (count < 3) ? this.discardMsg : this.playMsg;

			$("#cribbage").empty().append(this.view.gameTemplate(this.game, [message.call(this)]));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			$("#" + this.game.currentPlayer.id).on("click", ".card", callback.bind(this));
		}
		createGame(playerNames, duration) {
			this.game = new CRIBBAGE.Game(playerNames, duration, this);

			this.game.deck.add52Cards();
			this.game.deck.shuffle();
			this.game.cutCard = this.game.deck.cutCard();
			this.game.deal();

			$("#cribbage").empty().append(this.view.gameTemplate(this.game, [this.discardMsg()]));
			$("#" + this.game.dealer.id).append(this.view.cribTemplate(this.game));
			$("#" + this.game.currentPlayer.id).on("click", ".card", this.discard.bind(this));
		}
		togglePromptClass(display) {
			$("body").toggleClass("gray", display);
			$("#prompt").toggleClass("white", display);
		}
		getValSuit($el) {
			var val = $el.attr('id')[0];
			val = val === '1' ? '10' : val;
			var suit = val === '10' ? $el.attr('id')[2] : $el.attr('id')[1];
			return [val, suit];
		}
		playMsg() {
			return `${this.game.currentPlayer.name}, slap a card down on the battlefield!`;
		}
		discardMsg() {
			return `${this.game.currentPlayer.name}, rid thyself of a card!`;
		}
		fifteenMsg () {
			return `${this.game.currentPlayer.name} gets 2 points for 15!`;
		}
		thirtyoneMsg() {
			return `${this.game.currentPlayer.name} gets 2 points for 31!`;
		}
		pointForLastCardMsg() {
			return `${this.game.currentPlayer.name} gets 1 point for last card.`;
		}
		stillYourTurnMsg() {
			return `${this.game.currentPlayer.name} it's still your turn. ${this.game.otherPlayer().name} can't play a card.`;
		}
		bothHandsEmptyMsg() {
			return `both players' hands are empty. Let's score ${this.game.currentPlayer.name}'s hand.`;
		}
		invalidCardMsg() {
			return `${this.game.currentPlayer.name}, you cannot play that card!`;
		}
		scoringHand(hand) {
			return `scoring ${this.game.currentPlayer.name}'s ${hand}...`;
		}
		pointsScoredMsg(points, hand) {
			return `${this.game.currentPlayer.name}'s ${hand} is worth ${points} points.`;
		}
	};
})(window);
