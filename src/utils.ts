import type { ValAndSuitType, CardType, SuitType } from "./types";
import {Hand} from "./model"

export const VALS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUITS: SuitType[] = ['H', 'C', 'S', 'D'];
export const STATE = {
  waiting: 'waiting',
  dealing: 'dealing',
  discarding: 'discarding',
  playing: 'playing',
  scoring: 'scoring',
}

export const getCardIntVal = (val: string) => {
	var num = Number(val);
	return ( isNaN(num) ) ? ((val == 'A') ? 1 : 10 ): num;
}

export const getCardIndex = (val_and_suit: ValAndSuitType, cards: CardType[] | undefined) => {
  if (!cards) return -1;
  const val = getCardIntVal(val_and_suit.slice(0, val_and_suit.length - 1));
  const suit = val_and_suit.slice(val_and_suit.length - 1)
  return cards.findIndex(card => card.val == val && card.suit == suit)
}

export const getCutCard = (cards: CardType[]) => {
  // you may eventually add functionality so the user can determine where the deck's cut
  var index = Math.floor(Math.random() * cards.length);
	return cards.splice(index, 1)[0];
}

export const getDeck = () => {
	const cards: CardType[] = []
	for (var i = 0; i < SUITS.length; i++ ) {
		for (var j = 0; j < VALS.length; j++ ) {
			cards.push({suit: SUITS[i], val: getCardIntVal(VALS[j]), displayVal: VALS[j] });
		}
	}
	return { cards };
}

export const isEmpty = (hand: Hand) => hand?.cards?.length === 0;

