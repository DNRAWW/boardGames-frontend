import {
  BadSquareNameError,
  BoardIsNotInitializedErorr,
  SquareIsEmptyError,
} from "./errors";
import { ChessRules } from "./rules";
import { Colors, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";
import { BoardEvents, ChessEvents } from "./chessEventEmitter";

export type Board = {
  [key: string]: { piece: Pieces; color: Colors } | null;
} & BoardExtras;

export type BoardExtras = {
  lastMove: {
    from: string;
    to: string;
    piece: Pieces;
    color: Colors;
  } | null;
};

export class ChessMovement {
  // TODO: add controlled field to board squares
  // so that we can know if a move
  // is dangerous for the king
  private board: Board | null = null;
  private rules: ChessRules | null = null;

  private readonly eventEmitter: TypedEmitter<BoardEvents>;

  constructor(eventEmitter: TypedEmitter<ChessEvents>) {
    this.eventEmitter = eventEmitter;
  }

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

    const fromContent = this.board[from];
    const toContent = this.board[to];

    if (fromContent === null) {
      throw SquareIsEmptyError();
    }

    if (fromContent === undefined || toContent === undefined) {
      console.error("from:", fromContent, "\nto:", toContent);
      throw BadSquareNameError();
    }

    // TODO: check if piece is king, and going over 2 squares (column + 2 or - 2)
    if (false) {
      this.castle(from, to);
      return;
    }

    // TODO: check if piece is pawn, and from is on the right row, and column changes, and to is null
    if (false) {
      this.enPassant(from, to);
      return;
    }

    this.board[to] = fromContent;
    this.board[from] = null;

    this.eventEmitter.emit(
      "move",
      from,
      to,
      fromContent.piece,
      fromContent.color
    );
  }

  castle(from: string, to: string) {
    return;
  }

  enPassant(from: string, to: string) {
    return;
  }

  promote(from: string, to: string) {
    return;
  }
}
