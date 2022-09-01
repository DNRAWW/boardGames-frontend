import {
  BadSquareNameError,
  BoardIsNotInitializedErorr,
  SquareIsEmptyError,
} from "./errors";
import { ChessRules } from "./rules";
import { Colors, columnNames, getSquareInfo, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";
import { BoardEvents, ChessEvents } from "./chessEventEmitter";
import { ChessCalculations } from "./chessCalculations";

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
  private board: Board | null = null;

  private readonly eventEmitter: TypedEmitter<BoardEvents>;

  private chessCalculations: ChessCalculations | null = null;

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

  init(board: Board, rules: ChessRules) {
    this.board = board;
    this.chessCalculations = new ChessCalculations(rules, board);

    this.chessCalculations.calculatePossition(this.colorToMove);
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
    if (!this.chessCalculations || !this.board) {
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

    const avaliableMoves = this.chessCalculations.getLegalMovesForPiece(square);

    // console.log(avaliableMoves);

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
    if (!this.chessCalculations || !this.board) {
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

      this.changeColorToMove();

      this.chessCalculations.updateBoard(structuredClone(this.board));
      this.chessCalculations.calculatePossition(this.colorToMove);
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

      this.changeColorToMove();
      this.chessCalculations.updateBoard(structuredClone(this.board));
      this.chessCalculations.calculatePossition(this.colorToMove);
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
    this.chessCalculations.updateBoard(structuredClone(this.board));
    this.chessCalculations.calculatePossition(this.colorToMove);
  }

  promote(from: string, to: string) {
    if (!this.board) {
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
    if (!this.board) {
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
    if (!this.board) {
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
