import {
  BadSquareNameError,
  BoardIsNotInitializedErorr,
  SquareIsEmptyError,
} from "./errors";
import { ChessRules } from "./rules";
import { Colors, getSquareInfo, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";
import { BoardEvents, ChessEvents } from "./chessEventEmitter";

export type Board = {
  [key: string]: { piece: Pieces; color: Colors; moved?: boolean } | null;
} & BoardExtras;

export type BoardExtras = {
  lastMove: {
    from: string;
    to: string;
    piece: Pieces;
    color: Colors;
  } | null;
};

export type PieceOnBoard = { piece: Pieces; color: Colors; moved?: boolean };

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

  selectPiece(square: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const piece = this.board[square];

    if (piece === undefined) {
      throw BadSquareNameError();
    }

    if (piece === null) {
      throw SquareIsEmptyError();
    }

    const avaliableMoves = this.rules[piece.piece].getAvaliableMoves(
      this.board,
      square
    );

    console.log(avaliableMoves);

    this.selectedPiece = {
      square: square,
      piece: piece.piece,
      color: piece.color,
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

  // TODO: Refactoring, moving should not repeat in castle and enPassant
  move(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const fromContent = this.board[from];
    const toContent = this.board[to];

    const fromSquare = getSquareInfo(from);
    const toSquare = getSquareInfo(to);

    if (fromContent === null) {
      throw SquareIsEmptyError();
    }

    if (fromContent === undefined || toContent === undefined) {
      console.error("from:", fromContent, "\nto:", toContent);
      throw BadSquareNameError();
    }

    if (
      fromContent.piece === Pieces.KING &&
      (fromSquare.columnNumber + 2 == toSquare.columnNumber ||
        fromSquare.columnNumber - 2 == toSquare.columnNumber)
    ) {
      this.castle(from, to);
      return;
    }

    const enPassantRow = fromContent.color === Colors.BLACK ? 4 : 5;

    if (
      fromContent.piece === Pieces.PAWN &&
      fromSquare.row === enPassantRow &&
      fromSquare.columnName !== toSquare.columnName &&
      toContent === null
    ) {
      this.enPassant(from, to);
      return;
    }

    this.board[to] = fromContent;
    this.board[from] = null;

    this.board.lastMove = {
      color: fromContent.color,
      from: from,
      to: to,
      piece: fromContent.piece,
    };

    if (
      (fromContent.piece === Pieces.ROOK ||
        fromContent.piece === Pieces.KING) &&
      fromContent.moved === undefined
    ) {
      const pieceToChange = <PieceOnBoard>this.board[to];
      pieceToChange.moved = true;
    }

    this.eventEmitter.emit(
      "move",
      from,
      to,
      fromContent.piece,
      fromContent.color
    );
  }

  private castle(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const fromContent = <PieceOnBoard>this.board[from];

    // TODO: castle

    this.board.lastMove = {
      color: fromContent.color,
      from: from,
      to: to,
      piece: fromContent.piece,
    };

    return;
  }

  private enPassant(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const fromContent = <PieceOnBoard>this.board[from];

    const direction = fromContent.color === Colors.BLACK ? -1 : 1;

    this.board[to] = this.board[from];
    this.board[from] = null;

    const { columnName, row } = getSquareInfo(to);

    const squareToEmpty = columnName + (row - direction);

    this.board[squareToEmpty] = null;

    this.eventEmitter.emit("emptySquare", squareToEmpty);

    this.eventEmitter.emit(
      "move",
      from,
      to,
      fromContent.piece,
      fromContent.color
    );

    this.board.lastMove = {
      color: fromContent.color,
      from: from,
      to: to,
      piece: fromContent.piece,
    };

    return;
  }

  promote(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    console.log("promote");
    return;
  }
}
