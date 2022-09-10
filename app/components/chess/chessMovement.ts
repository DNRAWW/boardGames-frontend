import {
  BadSquareNameError,
  BoardIsNotInitializedErorr,
  SquareIsEmptyError,
} from "./errors";
import { ChessRules } from "./rules";
import { Colors, columnNames, getSquareInfo, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";
import { BoardEvents, ChessEvents, PromotionEvents } from "./chessEventEmitter";
import { ChessCalculations } from "./chessCalculations";
import { BoardPersistence } from "./presistence/presistence";

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

  private eventEmitter: TypedEmitter<BoardEvents & PromotionEvents> | null =
    null;

  private chessCalculations: ChessCalculations | null = null;

  private persistence = new BoardPersistence();

  private selectedPiece: {
    square: string;
    piece: Pieces;
    color: Colors;
    avaliableMoves: string[];
  } | null = null;

  private isWhiteKingInDanger: boolean = false;
  private isBlackKingInDanger: boolean = false;

  private colorToMove: Colors = Colors.WHITE;

  setEmitter(eventEmitter: TypedEmitter<BoardEvents>) {
    this.eventEmitter = eventEmitter;
  }

  getBoard() {
    if (!this.board) {
      throw BoardIsNotInitializedErorr();
    }
    return this.board;
  }

  init(board: Board, colorToMove: Colors, rules: ChessRules) {
    this.board = board;
    this.colorToMove = colorToMove;

    this.chessCalculations = new ChessCalculations(
      rules,
      structuredClone(this.board)
    );

    this.chessCalculations.calculateLegalMoves(this.colorToMove);
  }

  getColorToMove() {
    if (!this.colorToMove) {
      throw BoardIsNotInitializedErorr();
    }
    return this.colorToMove;
  }

  getKingStatus(color: Colors) {
    return color == Colors.BLACK
      ? this.isBlackKingInDanger
      : this.isWhiteKingInDanger;
  }

  selectPiece(square: string) {
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

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

    this.selectedPiece = {
      square: square,
      piece: piece.piece,
      color: piece.color,
      avaliableMoves: avaliableMoves,
    };

    this.eventEmitter.emit("avaliableMoves", avaliableMoves);
  }

  unselectPiece() {
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

    if (!this.selectedPiece) {
      throw Error("Piece is not selected");
    }

    const squaresToClean = this.selectedPiece.avaliableMoves;
    this.selectedPiece = null;

    this.eventEmitter.emit("cleanAvaliable", squaresToClean);
    this.eventEmitter.emit("closePromotion");
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
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

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

    this.board[to] = fromContent;
    this.board[from] = null;

    if (
      fromContent.piece === Pieces.KING &&
      (fromSquare.columnNumber + 2 == toSquare.columnNumber ||
        fromSquare.columnNumber - 2 == toSquare.columnNumber)
    ) {
      this.castle(from, to);

      this.runAfterMoveLogic();
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

      this.runAfterMoveLogic();
      return;
    }

    this.board.lastMove = {
      color: this.colorToMove,
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

    this.runAfterMoveLogic();
  }

  promote(from: string, to: string, pieceToPlace: Pieces) {
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

    if (!this.board || !this.chessCalculations) {
      throw BoardIsNotInitializedErorr();
    }

    const fromContent = this.board[from];

    if (!fromContent) {
      throw SquareIsEmptyError();
    }

    if (this.colorToMove !== fromContent.color) {
      throw Error("Color to move != promoted piece's color");
    }

    this.board[to] = {
      color: fromContent.color,
      piece: pieceToPlace,
      moved: true,
    };

    this.board.lastMove = {
      color: this.colorToMove,
      from: from,
      to: to,
      piece: fromContent.piece,
    };

    this.board[from] = null;

    this.eventEmitter.emit("move", from, to, Pieces.PAWN, this.colorToMove);
    this.eventEmitter.emit("placePiece", pieceToPlace, this.colorToMove, to);

    this.runAfterMoveLogic();

    return;
  }

  checkForGameOver() {
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

    if (!this.chessCalculations) {
      throw BoardIsNotInitializedErorr();
    }

    if (this.chessCalculations.getLegalMovesCount() === 0) {
      if (!this.chessCalculations.isKingInCheck()) {
        this.eventEmitter.emit("gameOver", "Stalemate!");
      } else {
        this.eventEmitter.emit(
          "gameOver",
          `Checkmate! ${
            this.colorToMove[0].toUpperCase() + this.colorToMove.slice(1)
          } lost.`
        );
      }
    }
  }

  private runAfterMoveLogic() {
    if (!this.board || !this.chessCalculations) {
      throw BoardIsNotInitializedErorr();
    }

    this.changeColorToMove();
    this.persistence.presistBoard(this.board, this.colorToMove);
    this.chessCalculations.updateBoard(structuredClone(this.board));
    this.chessCalculations.calculateLegalMoves(this.colorToMove);
    this.checkForGameOver();
  }

  private changeColorToMove() {
    if (this.colorToMove === Colors.WHITE) {
      this.colorToMove = Colors.BLACK;
      return;
    }

    this.colorToMove = Colors.WHITE;
  }

  private castle(from: string, to: string) {
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

    if (!this.board) {
      throw BoardIsNotInitializedErorr();
    }

    const toSquareInfo = getSquareInfo(to);
    const fromSquareInfo = getSquareInfo(from);
    const toContent = <PieceOnBoard>this.board[to];

    const direction =
      toSquareInfo.columnNumber > fromSquareInfo.columnNumber ? -1 : 1;

    const rookColumn = direction === -1 ? "h" : "a";
    const rookRow = fromSquareInfo.row;

    const movedKing = <PieceOnBoard>this.board[to];

    movedKing.moved = true;

    const nearestRook = this.board[rookColumn + rookRow];

    if (
      nearestRook === undefined ||
      nearestRook === null ||
      nearestRook.piece !== Pieces.ROOK ||
      nearestRook.color !== toContent.color
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
      color: toContent.color,
      from: from,
      to: to,
      piece: toContent.piece,
    };

    this.eventEmitter.emit("move", from, to, toContent.piece, toContent.color);

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
    if (!this.eventEmitter) {
      throw Error("No event emitter");
    }

    if (!this.board) {
      throw BoardIsNotInitializedErorr();
    }

    const direction = this.colorToMove === Colors.BLACK ? -1 : 1;

    const { columnName, row } = getSquareInfo(to);

    const squareToEmpty = columnName + (row - direction);

    this.board[squareToEmpty] = null;

    this.eventEmitter.emit("emptySquare", squareToEmpty);

    this.eventEmitter.emit("move", from, to, Pieces.PAWN, this.colorToMove);

    this.board.lastMove = {
      color: this.colorToMove,
      from: from,
      to: to,
      piece: Pieces.PAWN,
    };

    return;
  }
}
