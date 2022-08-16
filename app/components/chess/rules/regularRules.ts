import { ChessRules, InitailizedBoard } from ".";
import { SquareIsEmptyError } from "../errors";
import { Colors, columnNames, COLUMN_NUMBERS, getSquareInfo } from "../utils";

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
      const { columnName, row } = getSquareInfo(currentSquare);

      const nextRow = row + directionChange;

      const candidateMove = columnName + nextRow;

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
      const { columnNumber, row } = getSquareInfo(currentSquare);

      const nextColumn = columnNames[columnNumber + directionChange];

      if (nextColumn === undefined) {
        break;
      }

      const candidateMove = nextColumn + row;

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
      const { columnNumber, row } = getSquareInfo(currentSquare);
      const nextColumn = columnNames[columnNumber + directionChange];

      if (nextColumn === undefined) {
        break;
      }

      if (row > 8 || row < 1) {
        break;
      }

      const candidateMove = nextColumn + (row + 1);

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
      const { columnNumber, row } = getSquareInfo(currentSquare);
      const nextRow = row - 1;
      const nextColumn = columnNames[columnNumber - directionChange];

      if (nextColumn === undefined) {
        break;
      }

      if (nextRow > 8 || nextRow < 1) {
        break;
      }

      const candidateMove = nextColumn + nextRow;

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

  const { columnNumber, row } = getSquareInfo(startSquare);

  const candidateRow = Number(row) + rowChange;

  let candidateMove = columnNames[columnNumber - 1] + candidateRow;

  for (let c = 0; c < 3; c++) {
    if (candidateMove === undefined) {
      continue;
    }

    if (board[candidateMove] === undefined) {
      continue;
    }

    const { columnNumber, row } = getSquareInfo(candidateMove);

    if (columnNumber === undefined) {
      continue;
    }

    if (isMoveAvaliable(board, candidateMove, piceColor)) {
      avaliableMoves.push(candidateMove);
    }

    candidateMove = columnNames[columnNumber + 1] + row;
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

  const { columnNumber, row } = getSquareInfo(startSquare);

  const pieceColor = <Colors>board[startSquare]?.color;

  const candidateMoveOne =
    columnNames[columnNumber + columnChage] + (Number(row) + 2);

  if (
    board[candidateMoveOne] !== undefined &&
    isMoveAvaliable(board, candidateMoveOne, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveOne);
  }

  const candidateMoveTwo =
    columnNames[columnNumber + 2 * columnChage] + (Number(row) + 1);

  if (
    board[candidateMoveTwo] !== undefined &&
    isMoveAvaliable(board, candidateMoveTwo, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveTwo);
  }

  const candidateMoveThree =
    columnNames[columnNumber + 2 * columnChage] + (Number(row) - 1);

  if (
    board[candidateMoveThree] !== undefined &&
    isMoveAvaliable(board, candidateMoveThree, pieceColor)
  ) {
    avaliableMoves.push(candidateMoveThree);
  }

  const candidateMoveFour =
    columnNames[columnNumber + columnChage] + (Number(row) - 2);

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
      const { columnNumber, row } = getSquareInfo(square);

      const leftSquare = columnNames[columnNumber - 1] + row;
      const rightSquare = columnNames[columnNumber + 1] + row;

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
      const firstRow = pieceColor == Colors.BLACK ? 7 : 2;

      const { columnName, columnNumber, row } = getSquareInfo(square);

      let candidateMove = columnName + (row + direction);

      if (board[candidateMove] === null) {
        avaliableMoves.push(candidateMove);

        candidateMove = columnName + (row + direction * 2);

        if (
          row === firstRow &&
          board[candidateMove] === null &&
          board[candidateMove] !== undefined
        ) {
          avaliableMoves.push(candidateMove);
        }
      }

      const columnLeft = columnNames[columnNumber - 1];
      const columnRight = columnNames[columnNumber + 1];

      candidateMove = columnLeft + (row + direction);

      if (board[candidateMove] !== undefined) {
        if (
          board[candidateMove] !== null &&
          board[candidateMove]?.color !== pieceColor
        ) {
          avaliableMoves.push(candidateMove);
        }
      }

      candidateMove = columnRight + (row + direction);

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
