(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	CRIBBAGE.View = class {
		cardTemplate(card) {
			return "<div class='card " + card.suit + "' id='" + card.val + card.suit + "'>"
						+ card.val + card.suit +
					"</div>";
		}
		okButtonTemplate() {
			return "<input id='warning' class='btn btn-info' type='button' value='Okee Dokee' />";
		}
		handTemplate(hand) {
			var htmlString = "";
			_.each(hand.cards, (card) => {
				htmlString += this.cardTemplate(card);
			});
			return (hand.cards.length === 0) ? "<h3>empty, no cards</h3>" : htmlString;
		}
		playerTemplate(player) {
			return "<div id='" + player.id + "_score'>" + player.name + "'s Score: <span>" + player.score + "</span></div>" +
					"<p>" + player.name + "'s Cards:</p>";
		}
		getReactComponents() {
			var DurationButton = React.createClass({
				propTypes: {
					label: React.PropTypes.string,
					duration: React.PropTypes.string,
					setDuration: React.PropTypes.func
				},
				render () {
					let label = this.props.label;
					let setDuration = this.props.setDuration.bind(null, label)
					let className = this.props.duration === label ? 'btn-success': null;

					return (
						<button className={ className } onClick={ setDuration }>{ this.props.children }</button>
					);
				}
			});

			var DurationButtons = React.createClass({
				propTypes: {
					setDuration: React.PropTypes.func,
					duration: React.PropTypes.string
				},
				render () {
					let setDuration = this.props.setDuration;
					let duration = this.props.duration;

					return (
						<div>
							<DurationButton label="short" duration={ duration} setDuration={ setDuration }>Short</DurationButton>
							<DurationButton label="medium" duration={ duration} setDuration={ setDuration }>Medium</DurationButton>
							<DurationButton label="long" duration={ duration} setDuration={ setDuration }>Long</DurationButton>
						</div>
					);
				}
			});

			var CreateGame = React.createClass({
				propTypes: {
					createGame: React.PropTypes.func
				},
				getInitialState: function () {
					return {
						duration: 'short',
						playerOneName: '',
						playerTwoName: '',
						isError: false
					};
				},
				setDuration: function (duration) {
					this.setState({ duration: duration });
				},
				startGame: function () {
					let playerOneName = this.state.playerOneName;
					let playerTwoName = this.state.playerTwoName;

					if (!playerOneName.length || !playerTwoName.length) {
						this.setState({ isError: true });
					} else {
						this.props.createGame([playerOneName, playerTwoName], this.state.duration);
					}

				},
				setPlayerName: function (event) {
					let playerOneName = this.state.playerOneName;
					let playerTwoName = this.state.playerTwoName;
					let player = event.target.name;
					let name = event.target.value;
					let otherPlayerName = this.state[player] === playerOneName ? playerTwoName : playerOneName;
					let playerObject = {};

					if (name.length && otherPlayerName.length) {
						playerObject.isError = false;
					}

					playerObject[player] = name;
					this.setState(playerObject);
				},
				render: function () {
					let error = this.state.isError ? <h4 className='error'>You must enter a name for both users!</h4> : null;

					return (
						<div>
							<h4>Please Enter Two Player Names</h4>
							{ error }
							<input onChange={ this.setPlayerName } type="text" name="playerOneName" placeholder="Player One" />
							<input onChange={ this.setPlayerName } type="text" name="playerTwoName" placeholder="Player Two" />
							
							<h4>Please Select a Game Length</h4>
							<DurationButtons duration={ this.state.duration } setDuration={ this.setDuration } />

							<button onClick={ this.startGame }>Start Game</button>
						</div>
					);
				}
			});

			return CreateGame;
		}
		gameTemplate(game, messages) {
			return "<div id='prompt'>" +
						"<h3>" +
							messages.join(" ") +
						"</h3>" +
					"</div>" +
					"<div id='game'>" +
						"<div class='col-md-4' id='" + game.players[0].id + "'>" +
								this.playerTemplate(game.players[0]) +
								this.handTemplate(game.players[0].hand) +
						"</div>" +
						"<div class='col-md-4' id='pile'>" +
								"<p>Pile Score: " + game.pile.score + "</p>" +
								"<p>Pile Cards:</p>" +
								this.handTemplate(game.pile) +
								"<canvas id='board' width='' height=''>Your browser cannot display the game board!</canvas>" +
						"</div>" +
						"<div class='col-md-4' id='" + game.players[1].id + "'>" +
								this.playerTemplate(game.players[1]) +
								this.handTemplate(game.players[1].hand) +
						"</div>" +
					"</div>";
		}
		cribTemplate(game) {
			return "<div id='crib'><p>" + game.dealer.name + "'s Crib: </p>" +
				this.handTemplate(game.dealer.crib) +
			"</div>";
		}
		scoreTableTemplate(scores, elId) {
			var view = this;
			var $table = $("<table id='" + elId + "_score_table' class='table table-striped table-condensed'></table>");
			if (scores.length === 0) {
				$table.append("<tr><td>bummer. nothing scored.</td></tr>");
			} else {
				_.each(scores, (score) => {
					$table.append(this.scoreRowTemplate(view, score));
				});
			}
			return $table;
		}
		scoreRowTemplate(score) {
			return "<tr><td>" + score[0].val + score[0].suit + "</td><td>+</td><td>" + score[1].val + score[1].suit +
				"</td><td>=</td><td>" + score[2] + "</td><td>for</td><td>" + score[3] + "</td></tr>";
		}
		bummerTemplate() {
			return "<tr><td>bummer. nothing scored.</td></tr>";
		}
	};
})(window);
