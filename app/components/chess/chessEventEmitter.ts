import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { ChessMovement } from "./chessMovement";
import { Pieces, Colors, getSquareInfo } from "./utils";

export function getChessEventEmitter(chessMovement: ChessMovement) {
  const chessEventEmitter = new EventEmitter() as TypedEmitter<ChessEvents>;

  chessMovement.setEmitter(chessEventEmitter);

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
      if (selected.piece !== Pieces.PAWN) {
        chessMovement.move(selected.square, data.square);
      } else {
        const toSquareInfo = getSquareInfo(data.square);

        if (toSquareInfo.row !== 8 && toSquareInfo.row !== 1) {
          chessMovement.move(selected.square, data.square);
        } else {
          chessEventEmitter.emit(
            "askForPromotionPiece",
            selected.square,
            data.square,
            selected.color
          );

          return;
        }
      }
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
      if (selected.piece !== Pieces.PAWN) {
        chessMovement.move(selected.square, data.square);
      } else {
        const toSquareInfo = getSquareInfo(data.square);

        if (toSquareInfo.row !== 8 && toSquareInfo.row !== 1) {
          chessMovement.move(selected.square, data.square);
        } else {
          chessEventEmitter.emit(
            "askForPromotionPiece",
            selected.square,
            data.square,
            selected.color
          );

          return;
        }
      }
    }

    chessMovement.unselectPiece();
  });

  chessEventEmitter.on("promote", (from, to, piece) => {
    chessMovement.promote(from, to, piece);
    chessMovement.unselectPiece();
  });

  chessEventEmitter.on("checkGameOver", () => {
    chessMovement.checkForGameOver();
  });

  return chessEventEmitter;
}

export type ChessEvents = PieceEvents &
  SquareEvents &
  BoardEvents &
  PromotionEvents;

export type BoardEvents = {
  move: (from: string, to: string, piece: Pieces, color: Colors) => void;
  emptySquare: (square: string) => void;
  placePiece: (piece: Pieces, color: Colors, square: string) => void;
  askForPromotionPiece: (from: string, to: string, color: Colors) => void;
  avaliableMoves: (squares: string[]) => void;
  cleanAvaliable: (squaresToClean: string[]) => void;
  gameOver: (message: string) => void;
  checkGameOver: () => void;
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

export type PromotionEvents = {
  promote: (from: string, to: string, piece: Pieces) => void;
  closePromotion: () => void;
};
