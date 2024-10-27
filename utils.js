
export const VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS = ['H', 'C', 'S', 'D'];

export const getCardIntVal = (val) => {
	var num = Number(val);
	return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
}

export const getCardIndex = (val_and_suit, cards) => {
	for (var i = 0; i < cards.length; i++) {
		var card = cards[i];
		if (card.val == val_and_suit[0] && card.suit == val_and_suit[1]) return i;
	}
}

export const getCutCard = (cards) => {
  // you may eventually add functionality so the user can determine where the deck's cut
  var index = Math.floor(Math.random() * cards.length);
	return cards.splice(index, 1)[0];
}

export const returnCardsToDeck = (deck, cards) => {
  while (cards.length != 0) {
    deck.cards.push(cards.pop());
  }
}

export const getDeck = () => {
	const cards = []
	for (var i = 0; i < SUITS.length; i++ ) {
		for (var j = 0; j < VALS.length; j++ ) {
			cards.push({suit: i, val: j});
		}
	}
	return { cards };
}

