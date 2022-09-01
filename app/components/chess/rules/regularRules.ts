import { ChessRules, InitailizedBoard } from ".";
import { PieceOnBoard } from "../chessMovement";
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
    board: Readonly<InitailizedBoard>,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const avaliableMoves: string[] = [];
    const controlled: string[] = [];

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
        controlled.push(candidateMove);
        break;
      }
    }

    return { avaliable: avaliableMoves, controlled: controlled };
  },

  col: (
    board: Readonly<InitailizedBoard>,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const availableMoves: string[] = [];
    const controlled: string[] = [];

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
        availableMoves.push(candidateMove);
        if (board[candidateMove] !== null) {
          break;
        }
        currentSquare = candidateMove;
        continue;
      } else {
        controlled.push(candidateMove);
        break;
      }
    }

    return { avaliable: availableMoves, controlled: controlled };
  },

  d1: (
    board: Readonly<InitailizedBoard>,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const availableMoves: string[] = [];
    const controlled: string[] = [];

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
        controlled.push(candidateMove);
        break;
      }
    }

    return { avaliable: availableMoves, controlled: controlled };
  },

  d2: (
    board: Readonly<InitailizedBoard>,
    startSquare: string,
    directionChange: -1 | 1
  ) => {
    const availableMoves: string[] = [];
    const controlled: string[] = [];

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
        controlled.push(candidateMove);
        break;
      }
    }

    return { avaliable: availableMoves, controlled: controlled };
  },
};

const rowOfThree = (
  board: Readonly<InitailizedBoard>,
  startSquare: string,
  rowChange: 1 | -1,
  piceColor: Colors
) => {
  const avaliableMoves: string[] = [];
  const controlled: string[] = [];

  const { columnNumber, row } = getSquareInfo(startSquare);

  const candidateRow = Number(row) + rowChange;

  let candidateColumnNumber = columnNumber - 1;

  let candidateMove = columnNames[candidateColumnNumber] + candidateRow;

  for (let c = 0; c < 3; c++) {
    if (candidateMove === undefined) {
      candidateMove = columnNames[candidateColumnNumber + 1] + candidateRow;

      continue;
    }

    if (board[candidateMove] === undefined) {
      candidateMove = columnNames[candidateColumnNumber + 1] + candidateRow;

      continue;
    }

    if (candidateColumnNumber === undefined) {
      candidateMove = columnNames[candidateColumnNumber + 1] + candidateRow;

      continue;
    }

    const { columnNumber, row } = getSquareInfo(candidateMove);

    if (isMoveAvaliable(board, candidateMove, piceColor)) {
      avaliableMoves.push(candidateMove);
    } else {
      controlled.push(candidateMove);
    }

    candidateMove = columnNames[columnNumber + 1] + row;
  }

  return { avaliable: avaliableMoves, controlled: controlled };
};

const isMoveAvaliable = (
  board: Readonly<InitailizedBoard>,
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
  board: Readonly<InitailizedBoard>,
  startSquare: string,
  columnChage: 1 | -1
) => {
  const avaliableMoves: string[] = [];
  const controlled: string[] = [];

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
    if (board[candidate] !== undefined) {
      if (isMoveAvaliable(board, candidate, pieceColor)) {
        avaliableMoves.push(candidate);
      } else {
        controlled.push(candidate);
      }
    }
  });

  return { avaliable: avaliableMoves, controlled: controlled };
};

const getAvaliableMovesInLine = (
  board: Readonly<InitailizedBoard>,
  startSquare: string,
  direction: "row" | "col" | "d1" | "d2",
  directionChange: -1 | 1
): {
  avaliable: string[];
  controlled: string[];
} => {
  const squares = directionLineFuncs[direction](
    board,
    startSquare,
    directionChange
  );

  return squares;
};

const getQueenMoves = (board: Readonly<InitailizedBoard>, square: string) => {
  const bishop = regularRules.bishop.getAvaliableAndControlledMoves(
    board,
    square
  );

  const rook = regularRules.rook.getAvaliableAndControlledMoves(board, square);

  return {
    avaliable: [...bishop.avaliable, ...rook.avaliable],
    controlled: [...bishop.controlled, ...rook.controlled],
  };
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
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      const avaliableMoves: string[] = [];
      const controlled: string[] = [];

      const diagonalHalfOne = getAvaliableMovesInLine(board, square, "d1", 1);
      const diagonalHalfTwo = getAvaliableMovesInLine(board, square, "d1", -1);

      const diagonalHalfThree = getAvaliableMovesInLine(board, square, "d2", 1);
      const diagonalHalfFour = getAvaliableMovesInLine(board, square, "d2", -1);

      avaliableMoves.push(
        ...diagonalHalfOne.avaliable,
        ...diagonalHalfTwo.avaliable,
        ...diagonalHalfThree.avaliable,
        ...diagonalHalfFour.avaliable
      );

      controlled.push(
        ...diagonalHalfOne.controlled,
        ...diagonalHalfTwo.controlled,
        ...diagonalHalfThree.controlled,
        ...diagonalHalfFour.controlled
      );

      return { avaliable: avaliableMoves, controlled: controlled };
    },
  },
  king: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      const avaliableMoves: string[] = [];
      const controlled: string[] = [];

      const pieceColor = <Colors>board[square]?.color;
      const { columnNumber, row } = getSquareInfo(square);

      const leftSquare = columnNames[columnNumber - 1] + row;
      const rightSquare = columnNames[columnNumber + 1] + row;

      const topRow = rowOfThree(board, square, 1, pieceColor);
      const bottomRow = rowOfThree(board, square, -1, pieceColor);

      controlled.push(...topRow.controlled, ...topRow.controlled);

      avaliableMoves.push(...topRow.avaliable, ...bottomRow.avaliable);

      if (board[rightSquare] !== undefined) {
        if (isMoveAvaliable(board, rightSquare, pieceColor)) {
          avaliableMoves.push(rightSquare);
        } else {
          controlled.push(rightSquare);
        }
      }

      if (board[leftSquare] !== undefined) {
        if (isMoveAvaliable(board, leftSquare, pieceColor)) {
          avaliableMoves.push(leftSquare);
        } else {
          controlled.push(leftSquare);
        }
      }

      const king = <PieceOnBoard>board[square];

      if (king.moved != true) {
        const firstSide = getAvaliableMovesInLine(
          board,
          square,
          "col",
          1
        ).avaliable;
        const secondSide = getAvaliableMovesInLine(
          board,
          square,
          "col",
          -1
        ).avaliable;

        if (firstSide.length === 2) {
          const squareInfo = getSquareInfo(firstSide[1]);

          const rookColumn = columnNames[squareInfo.columnNumber + 1];
          const rookRow = row;
          const rookSquare = rookColumn + rookRow;

          const rook = board[rookSquare];

          if (
            rook !== undefined &&
            rook !== null &&
            rook.piece === Pieces.ROOK &&
            rook.color === pieceColor &&
            rook.moved !== true
          ) {
            avaliableMoves.push(firstSide[1]);
          }
        }

        if (secondSide.length === 3) {
          const squareInfo = getSquareInfo(secondSide[2]);

          const rookColumn = columnNames[squareInfo.columnNumber - 1];
          const rookRow = row;
          const rookSquare = rookColumn + rookRow;

          const rook = board[rookSquare];

          if (
            rook !== undefined &&
            rook !== null &&
            rook.piece === Pieces.ROOK &&
            rook.color === pieceColor &&
            rook.moved !== true
          ) {
            avaliableMoves.push(secondSide[1]);
          }
        }
      }

      return { avaliable: avaliableMoves, controlled: controlled };
    },
  },
  knight: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      const avaliableMoves: string[] = [];
      const controlled: string[] = [];

      const firstHalf = getHalfKnightMoves(board, square, 1);
      const secondHalf = getHalfKnightMoves(board, square, -1);

      avaliableMoves.push(...firstHalf.avaliable, ...secondHalf.avaliable);
      controlled.push(...firstHalf.controlled, ...secondHalf.controlled);

      return { avaliable: avaliableMoves, controlled: controlled };
    },
  },
  pawn: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      const avaliableMoves: string[] = [];
      const controlled: string[] = [];

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
        } else {
          controlled.push(candidateMove);
        }
      }

      candidateMove = columnRight + (row + direction);

      if (board[candidateMove] !== undefined) {
        if (
          board[candidateMove] !== null &&
          board[candidateMove]?.color !== pieceColor
        ) {
          avaliableMoves.push(candidateMove);
        } else {
          controlled.push(candidateMove);
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

      return { avaliable: avaliableMoves, controlled: controlled };
    },
  },
  queen: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      return getQueenMoves(board, square);
    },
  },
  rook: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => {
      const avaliableMoves: string[] = [];
      const controlled: string[] = [];

      let squares = getAvaliableMovesInLine(board, square, "row", 1);

      avaliableMoves.push(...squares.avaliable);
      controlled.push(...squares.controlled);

      squares = getAvaliableMovesInLine(board, square, "col", 1);

      avaliableMoves.push(...squares.avaliable);
      controlled.push(...squares.controlled);

      squares = getAvaliableMovesInLine(board, square, "row", -1);

      avaliableMoves.push(...squares.avaliable);
      controlled.push(...squares.controlled);

      squares = getAvaliableMovesInLine(board, square, "col", -1);

      avaliableMoves.push(...squares.avaliable);
      controlled.push(...squares.controlled);

      return { avaliable: avaliableMoves, controlled: controlled };
    },
  },
};
