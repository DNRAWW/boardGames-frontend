import {
  BadSquareNameError,
  BoardIsNotInitializedErorr,
  SquareIsEmptyError,
} from "./errors";
import { ChessRules } from "./rules";
import { Colors, columnNames, getSquareInfo, Pieces } from "./utils";
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

// TODO: Redo avaliable moves system
// Before every move calculate every legal move
// So that we can run the algorithm for finding illigal
// Moves only one time
// To do that we need an additional class
// Chess movement is going to be a proxy to that class
// That class is going to have a copy of the board for calculations
// That class is going to have a threat map (online mode only opponent)
// Illigal moves

// When I do this through this class I can just request
// legal moves for a piece that was selected
export class ChessMovement {
  private board: Board | null = null;
  private rules: ChessRules | null = null;

  private readonly eventEmitter: TypedEmitter<BoardEvents>;

  constructor(eventEmitter: TypedEmitter<ChessEvents>, colorToMove?: Colors) {
    this.eventEmitter = eventEmitter;
    if (colorToMove) {
      this.colorToMove = colorToMove;
    }
  }

  private selectedPiece: {
    square: string;
    piece: Pieces;
    color: Colors;
    avaliableMoves: string[];
  } | null = null;

  private isWhiteKingInDanger: boolean = false;
  private isBlackKingInDanger: boolean = false;

  private colorToMove: Colors = Colors.WHITE;

  setSquares(squares: Board) {
    this.board = squares;
  }

  setRules(rules: ChessRules) {
    this.rules = rules;
  }

  getColorToMove() {
    return this.colorToMove;
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

    if (this.selectedPiece) {
      this.unselectPiece();
    }

    // TODO: Replace this with a call to a class that calculates all
    // legal moves
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

    this.eventEmitter.emit("avaliableMoves", avaliableMoves);
  }

  unselectPiece() {
    if (!this.selectedPiece) {
      throw Error("Piece is not selected");
    }

    const squaresToClean = this.selectedPiece.avaliableMoves;
    this.selectedPiece = null;

    this.eventEmitter.emit("cleanAvaliable", squaresToClean);
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

    this.changeColorToMove();
  }

  promote(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    console.log("promote");
    return;
  }

  private changeColorToMove() {
    if (this.colorToMove === Colors.WHITE) {
      this.colorToMove = Colors.BLACK;
      return;
    }

    this.colorToMove = Colors.WHITE;
  }

  private castle(from: string, to: string) {
    if (!this.board || !this.rules) {
      throw BoardIsNotInitializedErorr();
    }

    const toSquareInfo = getSquareInfo(to);
    const fromSquareInfo = getSquareInfo(from);
    const fromContent = <PieceOnBoard>this.board[from];

    const direction =
      toSquareInfo.columnNumber > fromSquareInfo.columnNumber ? -1 : 1;

    const rookColumn = direction === -1 ? "h" : "a";
    const rookRow = fromSquareInfo.row;

    this.board[from] = null;
    this.board[to] = fromContent;

    const movedKing = <PieceOnBoard>this.board[to];

    movedKing.moved = true;

    const nearestRook = this.board[rookColumn + rookRow];

    if (
      nearestRook === undefined ||
      nearestRook === null ||
      nearestRook.piece !== Pieces.ROOK ||
      nearestRook.color !== fromContent.color
    ) {
      throw Error(`Something went wrong, square ${
        rookColumn + rookRow
      } does not have a rook on it (or wrong color), content - ${nearestRook}
      `);
    }

    const squareToMoveRook =
      columnNames[toSquareInfo.columnNumber + direction] + toSquareInfo.row;

    this.board[squareToMoveRook] = nearestRook;

    const movedRook = <PieceOnBoard>this.board[squareToMoveRook];

    movedRook.moved = true;

    this.board.lastMove = {
      color: fromContent.color,
      from: from,
      to: to,
      piece: fromContent.piece,
    };

    this.eventEmitter.emit(
      "move",
      from,
      to,
      fromContent.piece,
      fromContent.color
    );

    this.eventEmitter.emit(
      "move",
      rookColumn + rookRow,
      squareToMoveRook,
      nearestRook.piece,
      nearestRook.color
    );

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
}
