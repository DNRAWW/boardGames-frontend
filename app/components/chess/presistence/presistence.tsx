// TODO: Make presistance interface
// Offline presistance class saves board to localStorage
// TODO: Make a function to convert board into view

import TypedEventEmitter from "typed-emitter";
import { ChessEvents } from "../chessEventEmitter";
import { Board } from "../chessMovement";
import Piece from "../piece";
import Square from "../square";
import { Colors, getSquareInfo } from "../utils";

// TODO: Refactoring
export class OfflineBoardPersistence {
  private board: string | null = null;
  private parsedBoard: Board | null = null;

  constructor() {
    this.board = localStorage.getItem("board");

    if (!this.board) {
      return;
    }

    this.parsedBoard = JSON.parse(this.board);
  }

  getUI(
    perspective: Colors,
    eventEmitter: TypedEventEmitter<ChessEvents>
  ): { [key: string]: JSX.Element } | null {
    const colorToMove = localStorage.getItem("colorToMove");

    if (!this.board || !this.parsedBoard || !colorToMove) {
      return null;
    }

    if (colorToMove !== Colors.WHITE && colorToMove !== Colors.BLACK) {
      return null;
    }

    const squares: { [key: string]: JSX.Element } = {};

    const keys = Object.keys(this.parsedBoard);

    if (perspective !== Colors.WHITE) {
      keys.reverse();
    }

    for (const square of keys) {
      if (square === "lastMove") {
        continue;
      }

      const squareToRender = this.parsedBoard[square];
      const { columnNumber, row } = getSquareInfo(square);

      let piece = null;
      let pieceColor = null;

      const squareColor =
        (columnNumber + row) % 2 === 0 ? Colors.BLACK : Colors.WHITE;

      if (squareToRender) {
        piece = squareToRender.piece;
        pieceColor = squareToRender.color;
      }

      const jsxSquare = (
        <Square
          avaliable={false}
          color={squareColor}
          eventEmitter={eventEmitter}
          square={square}
          key={square}
        >
          {piece && pieceColor ? (
            <Piece
              color={pieceColor}
              piece={piece}
              square={square}
              eventEmitter={eventEmitter}
            ></Piece>
          ) : undefined}
        </Square>
      );

      squares[square] = jsxSquare;
    }

    return squares;
  }

  getBoardInfo(): { board: Board; colorToMove: Colors } | null {
    const colorToMove = localStorage.getItem("colorToMove");

    if (!this.board || !this.parsedBoard || !colorToMove) {
      return null;
    }

    if (colorToMove !== Colors.WHITE && colorToMove !== Colors.BLACK) {
      return null;
    }

    return {
      board: this.parsedBoard,
      colorToMove: colorToMove,
    };
  }

  presistBoard(board: Board, colorToMove: Colors): void {
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("colorToMove", colorToMove);
  }
}
