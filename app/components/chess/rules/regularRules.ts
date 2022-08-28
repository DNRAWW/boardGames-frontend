import { ChessRules, InitailizedBoard } from ".";
import { SquareIsEmptyError } from "../errors";
import {
  Colors,
  columnNames,
  getSquareInfo,
  Pieces,
  SquareInfo,
} from "../utils";

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

      if (board[candidateMove] === undefined) {
        break;
      }

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

      if (board[candidateMove] === undefined) {
        break;
      }

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

const getHalfKnightMoves = (
  board: InitailizedBoard,
  startSquare: string,
  columnChage: 1 | -1
) => {
  const avaliableMoves: string[] = [];

  const { columnNumber, row } = getSquareInfo(startSquare);

  const pieceColor = <Colors>board[startSquare]?.color;

  const candidateMoveOne = columnNames[columnNumber + columnChage] + (row + 2);

  const candidateMoveTwo =
    columnNames[columnNumber + 2 * columnChage] + (row + 1);

  const candidateMoveThree =
    columnNames[columnNumber + 2 * columnChage] + (row - 1);

  const candidateMoveFour = columnNames[columnNumber + columnChage] + (row - 2);

  const candidateMoves: string[] = [
    candidateMoveOne,
    candidateMoveTwo,
    candidateMoveThree,
    candidateMoveFour,
  ];

  candidateMoves.forEach((candidate) => {
    if (
      board[candidate] !== undefined &&
      isMoveAvaliable(board, candidate, pieceColor)
    ) {
      avaliableMoves.push(candidate);
    }
  });

  return avaliableMoves;
};

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

const enPassantCheck = (
  squareToCheck: string,
  pieceColor: Colors,
  lastMoveInfo: {
    from: SquareInfo;
    to: SquareInfo;
  }
): boolean => {
  const { columnName, columnNumber, row } = getSquareInfo(squareToCheck);

  const directionOfOpponentPawn = pieceColor === Colors.BLACK ? 1 : -1;
  const startRowOpponent = pieceColor === Colors.BLACK ? 2 : 7;

  const columnLeft = columnNames[columnNumber - 1];
  const columnRight = columnNames[columnNumber + 1];

  const isLastMoveOnRightColumn =
    (lastMoveInfo.from.columnName === columnLeft &&
      lastMoveInfo.to.columnName === columnLeft) ||
    (lastMoveInfo.from.columnName === columnRight &&
      lastMoveInfo.to.columnName === columnRight);

  if (!isLastMoveOnRightColumn) {
    return false;
  }

  if (!(lastMoveInfo.from.row === startRowOpponent)) {
    return false;
  }

  if (
    lastMoveInfo.to.row !==
    lastMoveInfo.from.row + directionOfOpponentPawn * 2
  ) {
    return false;
  }

  return true;
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
  // TODO: castling
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

      // checking for enPassant
      const enPassantRow = pieceColor === Colors.BLACK ? 4 : 5;
      if (
        board.lastMove &&
        board.lastMove.piece === Pieces.PAWN &&
        row === enPassantRow
      ) {
        const lastMoveInfo = {
          from: getSquareInfo(board.lastMove.from),
          to: getSquareInfo(board.lastMove.to),
        };

        if (enPassantCheck(square, pieceColor, lastMoveInfo)) {
          const moveToPush =
            lastMoveInfo.to.columnName + (lastMoveInfo.to.row + direction);
          avaliableMoves.push(moveToPush);
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
