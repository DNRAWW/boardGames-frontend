import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { Board, ChessMovement } from "./chessMovement";
import { ChessRules } from "./rules";
import { Pieces, Colors } from "./utils";

export function getChessEventEmitter() {
  const chessEventEmitter = new EventEmitter() as TypedEmitter<ChessEvents>;

  const chessMovement = new ChessMovement(chessEventEmitter);

  chessEventEmitter.on("pieceClicked", (data) => {
    const selected = chessMovement.getSelectedPiece();
    const colorToMove = chessMovement.getColorToMove();

    if (!selected) {
      if (data.color === colorToMove) {
        chessMovement.selectPiece(data.square);
      }

      return;
    }

    if (selected.square == data.square) {
      chessMovement.unselectPiece();
      return;
    }

    if (selected.color === data.color) {
      chessMovement.selectPiece(data.square);
      return;
    }

    let isMoveAvaliable = false;

    selected.avaliableMoves.forEach((move) => {
      if (data.square === move) {
        isMoveAvaliable = true;
        return;
      }
    });

    if (isMoveAvaliable) {
      chessMovement.move(selected.square, data.square);
    }

    chessMovement.unselectPiece();
  });

  chessEventEmitter.on("squareClicked", (data) => {
    const selected = chessMovement.getSelectedPiece();

    if (selected == null) {
      return;
    }

    let isMoveAvaliable = false;

    selected.avaliableMoves.forEach((move) => {
      if (data.square === move) {
        isMoveAvaliable = true;
        return;
      }
    });

    if (isMoveAvaliable) {
      chessMovement.move(selected.square, data.square);
    }

    chessMovement.unselectPiece();
  });

  chessEventEmitter.once("initChessMovement", (board, rules) => {
    chessMovement.init(board, rules);
  });

  return chessEventEmitter;
}

export type ChessEvents = PieceEvents & SquareEvents & BoardEvents;

export type BoardEvents = {
  initChessMovement: (board: Board, rules: ChessRules) => void;
  move: (from: string, to: string, piece: Pieces, color: Colors) => void;
  emptySquare: (square: string) => void;
  avaliableMoves: (squares: string[]) => void;
  cleanAvaliable: (squaresToClean: string[]) => void;
  gameOver: (colorLost: Colors) => void;
  stalemate: () => void;
};

export type SquareEvents = {
  squareClicked: (data: { square: string; color: Colors }) => void;
};

export type PieceEvents = {
  pieceClicked: (data: {
    piece: Pieces;
    square: string;
    color: Colors;
  }) => void;
};
