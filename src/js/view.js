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
					submitPlayerNames: React.PropTypes.func,
					setDuration: React.PropTypes.func,
					duration: React.PropTypes.string
				},
				getInitialState: function () {
					return {
						duration: 'short'
					};
				},
				setDuration: function (duration) {
					this.setState({ duration: duration });
				},
				render: function () {
					return (
						<div>
							<h4>Please Enter Two Player Names</h4>
							<input type="text" id="player1_name" placeholder="Player One" />
							<input type="text" id="player2_name" placeholder="Player Two" />
							
							<h4>Please Select a Game Length</h4>
							<DurationButtons duration={ this.state.duration } setDuration={ this.setDuration } />

							<button onClick={ this.props.submitPlayerNames }>Start Game</button>
						</div>
					);
				}
			});

			return CreateGame;
		}
		newPlayerTemplate() {
			return 	"<div class='col-md-4'></div>" +
					"<div class='col-md-4'>" +
					"<form id='create_players' class='form-horizontal' role='form'>" +
					"<h4>Please Enter Two Player Names</h4>" +
					"<div class='form-group'>" +
					"<div class='col-md-12'>" +
					"<input type='text' class='form-control' id='player1_name' maxlength='20' placeholder='Player One'>" +
					"</div>" +
					"</div>" +
					"<div class='form-group'>" +
					"<div class='col-md-12'>" +
					"<input type='text' class='form-control' id='player2_name' maxlength='20' placeholder='Player Two'>" +
					"</div>" +
					"</div>" +
					"<h4>Please Select a Game Length</h4>" +
					"<div class='form-group'>" +
					"<div class='col-md-4'><button class='btn duration_btn btn-success' value='short'>Short</button></div>" +
					"<div class='col-md-4'><button class='btn duration_btn' value='medium'>Medium</button></div>" +
					"<div class='col-md-4'><button class='btn duration_btn' value='long'>Long</button></div>" +
					"</div>" +
					"<div class='form-group'>" +
					"<div class='col-md-12'>" +
					"<button id='start_btn' type='submit' class='btn btn-info'>Start Game</button>" +
					"</div>" +
					"</div>" +
					"</form>" +
					"</div>" +
					"<div class='col-md-4'></div>";
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
