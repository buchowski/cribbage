(function (root) {
	var CRIBBAGE = root.CRIBBAGE = (root.CRIBBAGE || {});

	CRIBBAGE.View = class {
		okButtonTemplate() {
			return "<input id='warning' class='btn btn-info' type='button' value='Okee Dokee' />";
		}
		getReactComponents() {
			let DurationButton = React.createClass({
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

			let DurationButtons = React.createClass({
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

			let CreateGame = React.createClass({
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

			let Card = React.createClass({
				render: function () {
					let { card, discard } = this.props;

					return (
						<div id={ card.val + card.suit }
							className={ `card ${ card.suit }` }
							onClick={ discard.bind(null, card.val, card.suit) }>
							{ card.val + card.suit }
						</div>
					);
				}
			});

			let Cards = React.createClass({
				render: function () {
					let discard = this.props.discard;
					var hand = this.props.cards.map((card, i) => {
						return <Card key={ i } card={ card } discard={ discard } />
					});

					hand = hand && hand.length ? hand : <h3>empty, no cards</h3>;

					return <section>{ hand }</section>;
				}
			});

			let Player = React.createClass({
				render: function () {
					var game = this.props.game;
					var player = this.props.player;
					var crib = game.dealer === player ? <Crib game={ game } /> : null;

					return (
						<div id={ player.id } className="col-md-4">
							<span id={ `${ player.id }_score`}>
								{ player.name }'s Score:
							</span>
							<span>{ player.score }</span>
							<p>{ player.name }'s Cards:</p>
							<Cards cards={ player.hand.cards } discard={ this.props.discard } />
							{ crib }
						</div>
					)
				}
			});

			let Pile = React.createClass({
				render: function () {
					var pile = this.props.pile;

					return (
						<div id="pile" className="col-md-4">
							<p>Pile Score: { pile.score }</p>
							<p>Pile Cards:</p>
							<Cards cards={ pile.cards } />
						</div>
					)
				}
			});

			let Crib = React.createClass({
				render: function () {
					var game = this.props.game;

					return (
						<div id="crib">
							<p>{ `${ game.dealer.name }'s Crib:` }</p>
							<Cards cards={ game.dealer.crib.cards } />
						</div>
					);
				}
			});

			let Game = React.createClass({
				getInitialState: function () {
					return { game: this.props.game };
				},
				discard: function (val, suit) {
					this.props.discard(val, suit);
				},
				render: function () {
					let game = this.state.game;
					let playerOne = game.players[0];
					let playerTwo = game.players[1];

					return (
						<section>
							<div id="prompt">
								<h3>{ this.props.messages }</h3>
							</div>
							<div id="game">
								<Player player={ playerOne } game={ game } discard={ this.discard } />
								<Pile pile={ game.pile } />
								<Player player={ playerTwo } game={ game } discard={ this.discard } />
							</div>
						</section>
					);
				}
			});

			return { Game, CreateGame, Crib };
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
