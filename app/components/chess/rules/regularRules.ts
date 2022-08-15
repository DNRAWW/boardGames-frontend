import { ChessRules, InitailizedBoard } from ".";
import { SquareIsEmptyError } from "../errors";
import { Colors, columnNames } from "../utils";

// TODO: refactor this ->
// const columnAndRow = square.split("");
// const column = columnAndRow[0];
// const row = columnAndRow[1];
// const columnNumber = COLUMN_NUMBERS[column]
// put them in a function (probably in utils)

const COLUMN_NUMBERS: { [key: string]: number } = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
};

// TODO: refactoring
const directionLineFuncs = {
  row: (
    board: InitailizedBoard,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const avaliableMoves: string[] = [];
    const pieceColor: Colors = <Colors>board[startSquare]?.color;

    let currentSquare = startSquare;

    for (let c = 0; c < 8; c++) {
      const columnAndRow = currentSquare.split("");

      const columnNumber = COLUMN_NUMBERS[columnAndRow[0]];
      const row = parseInt(columnAndRow[1]);

      const column = columnAndRow[0];
      const nextRow = row + directionChange;

      const candidateMove = column + nextRow;

      if (board[candidateMove] === undefined) {
        break;
      }

      const isCandidateMoveAvaliable = isMoveAvaliable(
        board,
        candidateMove,
        pieceColor
      );

      if (isCandidateMoveAvaliable === true) {
        avaliableMoves.push(candidateMove);
        if (board[candidateMove] !== null) {
          break;
        }
        currentSquare = candidateMove;
        continue;
      } else {
        break;
      }
    }

    return avaliableMoves;
  },

  col: (
    board: InitailizedBoard,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const avaliableMoves: string[] = [];
    const pieceColor: Colors = <Colors>board[startSquare]?.color;

    let currentSquare = startSquare;

    for (let c = 0; c < 8; c++) {
      const columnAndRow = currentSquare.split("");

      const columnNumber = COLUMN_NUMBERS[columnAndRow[0]];
      const row = parseInt(columnAndRow[1]);
      const column = columnNames[columnNumber + directionChange - 1];

      if (column === undefined) {
        break;
      }

      const candidateMove = column + row;

      if (board[candidateMove] === undefined) {
        break;
      }

      const isCandidateMoveAvaliable = isMoveAvaliable(
        board,
        candidateMove,
        pieceColor
      );

      if (isCandidateMoveAvaliable) {
        avaliableMoves.push(candidateMove);
        if (board[candidateMove] !== null) {
          break;
        }
        currentSquare = candidateMove;
        continue;
      } else {
        break;
      }
    }

    return avaliableMoves;
  },

  d1: (
    board: InitailizedBoard,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const availableMoves: string[] = [];
    const pieceColor = <Colors>board[startSquare]?.color;

    let currentSquare = startSquare;

    for (let c = 0; c < 8; c++) {
      const columnAndRow = currentSquare.split("");
      const columnNumber = COLUMN_NUMBERS[columnAndRow[0]];
      const row = parseInt(columnAndRow[1]) + 1;
      const column = columnNames[columnNumber + directionChange - 1];

      if (column === undefined) {
        break;
      }

      if (row > 8 || row < 1) {
        break;
      }

      const candidateMove = column + row;

      if (isMoveAvaliable(board, candidateMove, pieceColor)) {
        availableMoves.push(candidateMove);

        if (board[candidateMove] !== null) {
          break;
        }

        currentSquare = candidateMove;
      } else {
        break;
      }
    }

    return availableMoves;
  },

  d2: (
    board: InitailizedBoard,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const availableMoves: string[] = [];

    const pieceColor = <Colors>board[startSquare]?.color;

    let currentSquare = startSquare;

    for (let c = 0; c < 8; c++) {
      const columnAndRow = currentSquare.split("");
      const columnNumber = COLUMN_NUMBERS[columnAndRow[0]];
      const row = parseInt(columnAndRow[1]) - 1;
      const column = columnNames[columnNumber - directionChange - 1];

      if (column === undefined) {
        break;
      }

      if (row > 8 || row < 1) {
        break;
      }

      const candidateMove = column + row;

      if (isMoveAvaliable(board, candidateMove, pieceColor)) {
        availableMoves.push(candidateMove);

        if (board[candidateMove] !== null) {
          break;
        }

        currentSquare = candidateMove;
      } else {
        break;
      }
    }

    return availableMoves;
  },
};

const rowOfThreeAvaliable = (
  board: InitailizedBoard,
  startSquare: string,
  rowChange: 1 | -1,
  piceColor: Colors
) => {
  const avaliableMoves: string[] = [];

  const columnAndRow = startSquare.split("");
  const column = columnAndRow[0];
  const row = columnAndRow[1];
  const columnNumber = COLUMN_NUMBERS[column];

  const candidateRow = Number(row) + rowChange;

  let candidateMove = columnNames[columnNumber - 1 - 1] + candidateRow;

  for (let c = 0; c < 3; c++) {
    if (candidateMove === undefined) {
      continue;
    }

    const columnAndRow = candidateMove.split("");
    const column = columnAndRow[0];
    const row = columnAndRow[1];
    const columnNumber = COLUMN_NUMBERS[column];

    if (columnNumber === undefined) {
      continue;
    }

    if (board[candidateMove] === undefined) {
      continue;
    }

    if (isMoveAvaliable(board, candidateMove, piceColor)) {
      avaliableMoves.push(candidateMove);
    }

    candidateMove = columnNames[columnNumber + 1 - 1] + row;
  }

  return avaliableMoves;
};

const isMoveAvaliable = (
  board: InitailizedBoard,
  candidateMove: string,
  pieceColor: Colors
): boolean => {
  if (board[candidateMove] === null) {
    return true;
  }

  if (board[candidateMove]?.color !== pieceColor) {
    return true;
  }

  return false;
};

// TODO: refactoring
const getHalfKnightMoves = (
  board: InitailizedBoard,
  startSquare: string,
  columnChage: 1 | -1
) => {
  const avaliableMoves: string[] = [];

  const columnAndRow = startSquare.split("");
  const column = columnAndRow[0];
  const row = columnAndRow[1];
  const columnNumber = COLUMN_NUMBERS[column];

  const pieceColor = <Colors>board[startSquare]?.color;

  const candidateMoveOne =
    columnNames[columnNumber + columnChage - 1] + (Number(row) + 2);

  if (
    board[candidateMoveOne] !== undefined &&
    isMoveAvaliable(board, candidateMoveOne, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveOne);
  }

  const candidateMoveTwo =
    columnNames[columnNumber + 2 * columnChage - 1] + (Number(row) + 1);

  if (
    board[candidateMoveTwo] !== undefined &&
    isMoveAvaliable(board, candidateMoveTwo, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveTwo);
  }

  const candidateMoveThree =
    columnNames[columnNumber + 2 * columnChage - 1] + (Number(row) - 1);

  if (
    board[candidateMoveThree] !== undefined &&
    isMoveAvaliable(board, candidateMoveThree, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveThree);
  }

  const candidateMoveFour =
    columnNames[columnNumber + columnChage - 1] + (Number(row) - 2);

  if (
    board[candidateMoveFour] !== undefined &&
    isMoveAvaliable(board, candidateMoveFour, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveFour);
  }

  return avaliableMoves;
};

// TODO: REFACTORING
const getAvaliableMovesInLine = (
  board: InitailizedBoard,
  startSquare: string,
  direction: "row" | "col" | "d1" | "d2",
  directionChange: -1 | 1
): string[] => {
  const avaliableMoves: string[] = directionLineFuncs[direction](
    board,
    startSquare,
    directionChange
  );

  return avaliableMoves;
};

const getQueenMoves = (board: InitailizedBoard, square: string): string[] => {
  return [
    ...regularRules.bishop.getAvaliableMoves(board, square),
    ...regularRules.rook.getAvaliableMoves(board, square),
  ];
};

export const regularRules: ChessRules = {
  bishop: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const diagonalHalfOne = getAvaliableMovesInLine(board, square, "d1", 1);
      const diagonalHalfTwo = getAvaliableMovesInLine(board, square, "d1", -1);

      const diagonalHalfThree = getAvaliableMovesInLine(board, square, "d2", 1);
      const diagonalHalfFour = getAvaliableMovesInLine(board, square, "d2", -1);

      avaliableMoves.push(
        ...diagonalHalfOne,
        ...diagonalHalfTwo,
        ...diagonalHalfThree,
        ...diagonalHalfFour
      );

      return avaliableMoves;
    },
  },
  // TODO: check if any of the moves are dangerous
  king: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const pieceColor = <Colors>board[square]?.color;
      const columnAndRow = square.split("");
      const column = columnAndRow[0];
      const row = columnAndRow[1];

      const leftSquare = columnNames[COLUMN_NUMBERS[column] - 1 - 1] + row;
      const rightSquare = columnNames[COLUMN_NUMBERS[column] + 1 - 1] + row;

      const topRow = rowOfThreeAvaliable(board, square, 1, pieceColor);
      const bottomRow = rowOfThreeAvaliable(board, square, -1, pieceColor);

      avaliableMoves.push(...topRow, ...bottomRow);

      if (board[rightSquare] !== undefined) {
        if (isMoveAvaliable(board, rightSquare, pieceColor)) {
          avaliableMoves.push(rightSquare);
        }
      }

      if (board[leftSquare] !== undefined) {
        if (isMoveAvaliable(board, leftSquare, pieceColor)) {
          avaliableMoves.push(leftSquare);
        }
      }

      return avaliableMoves;
    },
  },
  knight: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const firstHalf: string[] = getHalfKnightMoves(board, square, 1);
      const secondHalf: string[] = getHalfKnightMoves(board, square, -1);

      avaliableMoves.push(...firstHalf, ...secondHalf);

      return avaliableMoves;
    },
  },
  // TODO: refactoring
  pawn: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const squareContent = board[square];

      if (squareContent === null) {
        throw SquareIsEmptyError();
      }

      const pieceColor = squareContent.color;

      const direction = pieceColor == Colors.BLACK ? -1 : 1;
      const firstRow = pieceColor == Colors.BLACK ? "7" : "2";

      const columnAndRow = square.split("");
      const column = columnAndRow[0];
      const row = columnAndRow[1];

      let candidateMove = column + (Number(row) + direction);

      if (board[candidateMove] === null) {
        avaliableMoves.push(candidateMove);

        candidateMove = column + (Number(row) + direction * 2);

        if (
          row === firstRow &&
          board[candidateMove] === null &&
          board[candidateMove] !== undefined
        ) {
          avaliableMoves.push(candidateMove);
        }
      }

      const columnLeft = columnNames[COLUMN_NUMBERS[column] - 1 - 1];
      const columnRight = columnNames[COLUMN_NUMBERS[column] + 1 - 1];

      candidateMove = columnLeft + (Number(row) + direction);

      if (board[candidateMove] !== undefined) {
        if (
          board[candidateMove] !== null &&
          board[candidateMove]?.color !== pieceColor
        ) {
          avaliableMoves.push(candidateMove);
        }
      }

      candidateMove = columnRight + (Number(row) + direction);

      if (board[candidateMove] !== undefined) {
        if (
          board[candidateMove] !== null &&
          board[candidateMove]?.color !== pieceColor
        ) {
          avaliableMoves.push(candidateMove);
        }
      }

      return avaliableMoves;
    },
  },
  queen: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      return getQueenMoves(board, square);
    },
  },
  rook: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      avaliableMoves.push(...getAvaliableMovesInLine(board, square, "row", 1));

      avaliableMoves.push(...getAvaliableMovesInLine(board, square, "col", 1));

      avaliableMoves.push(...getAvaliableMovesInLine(board, square, "row", -1));

      avaliableMoves.push(...getAvaliableMovesInLine(board, square, "col", -1));

      return avaliableMoves;
    },
  },
};
