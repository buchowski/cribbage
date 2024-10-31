
export const VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS = ['H', 'C', 'S', 'D'];
export const STATE = {
  waiting: 'waiting',
  dealing: 'dealing',
  discarding: 'discarding',
  playing: 'playing',
  scoring: 'scoring',
}

export const getCardIntVal = (val) => {
	var num = Number(val);
	return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
}

export const getCardIndex = (val_and_suit, cards) => {
  const val = val_and_suit.slice(0, val_and_suit.length - 1)
  const suit = val_and_suit.slice(val_and_suit.length - 1)
  return cards.findIndex(card => card.val == val && card.suit == suit)
}

export const getCutCard = (cards) => {
  // you may eventually add functionality so the user can determine where the deck's cut
  var index = Math.floor(Math.random() * cards.length);
	return cards.splice(index, 1)[0];
}

// export const returnCardsToDeck = (deck, cards) => {
//   while (cards.length != 0) {
//     deck.cards.push(cards.pop());
//   }
// }

export const getDeck = () => {
	const cards = []
	for (var i = 0; i < SUITS.length; i++ ) {
		for (var j = 0; j < VALS.length; j++ ) {
			cards.push({suit: SUITS[i], val: getCardIntVal(VALS[j]), displayVal: VALS[j] });
		}
	}
	return { cards };
}

export const isEmpty = (hand) => hand?.cards?.length === 0;

