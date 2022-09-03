export enum Colors {
  WHITE = "white",
  BLACK = "black",
}

export enum Pieces {
  BISHOP = "bishop",
  KING = "king",
  KNIGHT = "knight",
  PAWN = "pawn",
  QUEEN = "queen",
  ROOK = "rook",
}

export const columnNames: Readonly<{
  [key: number]: string;
}> = {
  1: "a",
  2: "b",
  3: "c",
  4: "d",
  5: "e",
  6: "f",
  7: "g",
  8: "h",
};

export const COLUMN_NUMBERS: { [key: string]: number } = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
};

export type SquareInfo = {
  columnName: string;
  columnNumber: number;
  row: number;
};

export function getSquareInfo(square: string): SquareInfo {
  const columnAndRow = square.split("");
  const column = columnAndRow[0];
  const row = columnAndRow[1];
  const columnNumber = COLUMN_NUMBERS[column];

  return {
    columnName: column,
    columnNumber: columnNumber,
    row: Number(row),
  };
}

export type TPromotion = {
  to: string;
  from: string;
  color: Colors;
};
