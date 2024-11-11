

export type SuitType = 'H' | 'C' | 'S' | 'D';
export type ValAndSuitType = string;

export type CardType = {
  suit: SuitType;
  val: number;
  displayVal: string;
}

export type ScoreRecordType = [CardType, CardType, number, number];
