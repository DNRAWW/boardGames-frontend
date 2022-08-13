import { ChessRules, InitailizedBoard } from ".";
import { SquareIsEmptyError } from "../errors";
import { Colors, columnNames } from "../utils";

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

// TODO: refactor this ->
// const columnAndRow = square.split("");
// const column = columnAndRow[0];
// const row = columnAndRow[1];
// const columnNumber = COLUMN_NUMBERS[column]
// put them in a function (probably in utils)

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

  if (board[candidateMove]?.Color !== pieceColor) {
    return true;
  }

  return false;
};

// TODO: add d1 and d2, REFACTORING
const getAvaliableMovesInLine = (
  board: InitailizedBoard,
  startSquare: string,
  direction: "row" | "col" | "d1" | "d2",
  directionChange: -1 | 1
): string[] => {
  if (direction !== "row" && direction !== "col") {
    throw Error("Invalid direction name");
  }

  const avaliableMoves: string[] = [];

  let currentSquare = startSquare;
  const pieceColor: Colors = <Colors>board[startSquare]?.Color;

  for (let c = 0; c < 8; c++) {
    const columnAndRow = currentSquare.split("");

    const columnNumber = COLUMN_NUMBERS[columnAndRow[0]];
    const row = parseInt(columnAndRow[1]);

    if (direction === "row") {
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

    if (direction === "col") {
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
  }

  return avaliableMoves;
};

export const regularRules: ChessRules = {
  bishop: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      return avaliableMoves;
    },
  },

  // TODO: check if any of the moves are dangerous
  king: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const pieceColor = <Colors>board[square]?.Color;
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

      return avaliableMoves;
    },
  },
  // TODO: make pawn eat
  pawn: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      const squareContent = board[square];

      if (squareContent === null) {
        throw SquareIsEmptyError();
      }

      const color = squareContent.Color;

      const direction = color == Colors.BLACK ? -1 : 1;
      const firstRow = color == Colors.BLACK ? "7" : "2";

      const columnAndRow = square.split("");
      const column = columnAndRow[0];
      const row = columnAndRow[1];

      const rowNumber = Number(row);

      let candidateMove = column + (rowNumber + direction);

      if (board[candidateMove] !== null || board[candidateMove] === undefined) {
        return [];
      }

      avaliableMoves.push(candidateMove);

      candidateMove = column + (rowNumber + direction * 2);

      if (
        row === firstRow &&
        board[candidateMove] === null &&
        board[candidateMove] !== undefined
      ) {
        avaliableMoves.push(candidateMove);
      }

      return avaliableMoves;
    },
  },
  queen: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => {
      const avaliableMoves: string[] = [];

      return avaliableMoves;
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
