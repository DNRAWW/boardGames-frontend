import { BadSquareNameError, BoardIsNotInitializedErorr } from "./errors";
import { ChessRules } from "./rules";
import { Colors, Pieces } from "./utils";

export type Board = { [key: string]: { Piece: Pieces; Color: Colors } | null };

export class ChessMovement {
  private board: Board | null = null;
  private rules: ChessRules | null = null;

  private selectedPiece: {
    square: string;
    piece: Pieces;
    color: Colors;
    avaliableMoves: string[];
  } | null = null;

  private isWhiteKingInDanger: boolean = false;
  private isBlackKingInDanger: boolean = false;

  setSquares(squares: Board) {
    this.board = squares;
  }

  setRules(rules: ChessRules) {
    this.rules = rules;
  }

  getKingStatus(color: Colors) {
    return color == Colors.BLACK
      ? this.isBlackKingInDanger
      : this.isWhiteKingInDanger;
  }

  selectPiece(square: string, piece: Pieces, color: Colors) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    if (this.board[square] === undefined) {
      throw BadSquareNameError();
    }

    const avaliableMoves = this.rules[piece].getAvaliableMoves(
      this.board,
      square
    );

    console.log(avaliableMoves);

    this.selectedPiece = {
      square: square,
      piece: piece,
      color: color,
      avaliableMoves: avaliableMoves,
    };
  }

  unselectPiece() {
    this.selectedPiece = null;
  }

  getSelectedPiece() {
    return this.selectedPiece;
  }

  getSquarePiece(square: string) {
    if (!this.board) {
      throw BoardIsNotInitializedErorr();
    }

    if (this.board[square] === undefined) {
      throw BadSquareNameError();
    }

    return this.board[square];
  }

  move(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const temp = this.board[from];

    this.board[from] = null;

    this.board[to] = temp;
  }
}
