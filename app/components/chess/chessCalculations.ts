import { Board } from "./chessMovement";
import { BadSquareNameError, SquareIsEmptyError } from "./errors";
import { ChessRules } from "./rules";
import { Colors, columnNames, getSquareInfo, Pieces } from "./utils";

// TODO: tie logic

export class ChessCalculations {
  private readonly rules: ChessRules;
  private board: Board;

  private threatMap: {
    [key: string]: {
      controlledBy: string[];
    };
  } = {};

  private protectedSquares: {
    [key: string]: boolean;
  } = {};

  private legalMoves: { [key: string]: string[] } = {};
  private previousBoard: Board | null = null;

  private kingLocation: string = "";
  private previousKingLocation: string | null = null;
  private kingInCheck = false;

  constructor(rules: ChessRules, board: Board) {
    this.rules = rules;
    this.board = board;
  }

  calculateLegalMoves(color: Colors) {
    this.threatMap = {};
    this.legalMoves = {};
    this.protectedSquares = {};
    this.kingLocation = "";
    this.kingInCheck = false;

    this.calculateAllPossibleMoves(color);

    this.rejectDangerousMoves();
  }

  getLegalMovesCount() {
    let count = 0;
    for (const pieceSquare in this.legalMoves) {
      count += this.legalMoves[pieceSquare].length;
    }
    return count;
  }

  getLegalMovesForPiece(square: string) {
    return this.legalMoves[square];
  }

  updateBoard(board: Board) {
    this.board = board;
  }

  isKingInCheck() {
    return this.kingInCheck;
  }

  private calculateAllPossibleMoves(color: Colors) {
    for (const square in this.board) {
      const squareContent = this.board[square];

      if (!squareContent) {
        continue;
      }

      const avaliableAndControlledSquares = this.rules[
        squareContent.piece
      ].getAvaliableAndControlledMoves(this.board, square);

      const avaliableMoves = avaliableAndControlledSquares.avaliable;
      const controlledSquares = avaliableAndControlledSquares.controlled;

      if (squareContent.color === color) {
        this.legalMoves[square] = avaliableMoves;
      } else {
        avaliableMoves.forEach((controlledSquare: string) => {
          if (squareContent.piece !== Pieces.PAWN) {
            this.addSquareToThreatMap(controlledSquare, square);
          } else {
            const pieceSquareInfo = getSquareInfo(square);
            const controlledSquareInfo = getSquareInfo(controlledSquare);

            if (controlledSquareInfo.columnName != pieceSquareInfo.columnName) {
              this.addSquareToThreatMap(controlledSquare, square);
            }
          }
        });

        controlledSquares.forEach((square) => {
          this.protectedSquares[square] = true;
        });
      }

      if (
        squareContent.piece === Pieces.KING &&
        squareContent.color === color
      ) {
        this.kingLocation = square;
      }
    }
  }

  private rejectDangerousMoves() {
    let isKingInDanger = false;

    for (const threat in this.threatMap) {
      if (threat === this.kingLocation) {
        isKingInDanger = true;
        this.kingInCheck = true;
        break;
      }
    }

    if (!isKingInDanger) {
      this.rejectMovesLoop();
    } else {
      const attackers = this.threatMap[this.kingLocation].controlledBy;

      if (attackers.length > 1) {
        const kingMoves = this.legalMoves[this.kingLocation];

        this.legalMoves = {};

        this.legalMoves[this.kingLocation] = kingMoves;
      } else {
        const attacker = this.board[attackers[0]];

        if (!attacker) {
          throw Error("Attacker is empty");
        }

        const allowedSquares = this.rules[
          attacker.piece
        ].getAvaliableAndControlledMoves(this.board, attackers[0]).avaliable;

        allowedSquares.push(attackers[0]);

        for (const pieceSquare in this.legalMoves) {
          const piece = this.board[pieceSquare]?.piece;
          if (piece === Pieces.KING) {
            continue;
          }

          const pieceMoves = this.legalMoves[pieceSquare];
          const movesToDelete = [];

          for (const index in pieceMoves) {
            if (
              !allowedSquares.find((square) => square === pieceMoves[index])
            ) {
              movesToDelete.push(Number(index));
              continue;
            }

            this.makeTempMove(pieceSquare, pieceMoves[index]);

            const attackerMoves = this.rules[
              attacker.piece
            ].getAvaliableAndControlledMoves(
              this.board,
              attackers[0]
            ).avaliable;

            if (attackerMoves.find((square) => square === this.kingLocation)) {
              movesToDelete.push(Number(index));
            }

            this.undoTempMove();
          }

          for (var i = movesToDelete.length - 1; i >= 0; i--) {
            pieceMoves.splice(movesToDelete[i], 1);
          }
        }
      }
      this.rejectMovesLoop();
    }
  }

  private rejectMovesLoop() {
    for (const threat in this.threatMap) {
      const moves = this.legalMoves[threat];

      if (!moves) {
        continue;
      }

      const controlledBy = this.threatMap[threat].controlledBy;

      const movesToDelete = [];

      for (const index in moves) {
        this.makeTempMove(threat, moves[index]);

        for (const attackerSquare of controlledBy) {
          const piece = this.board[attackerSquare]?.piece;

          if (!piece) {
            throw Error(`Something went wrong, ${attackerSquare} is empty`);
          }

          const avaliableMoves = this.rules[
            piece
          ].getAvaliableAndControlledMoves(
            this.board,
            attackerSquare
          ).avaliable;

          if (avaliableMoves.find((square) => square === this.kingLocation)) {
            movesToDelete.push(Number(index));
          }
        }

        this.undoTempMove();
      }

      for (var i = movesToDelete.length - 1; i >= 0; i--) {
        moves.splice(movesToDelete[i], 1);
      }
    }

    const kingMoves = this.legalMoves[this.kingLocation];
    const kingMovesToDelete: number[] = [];

    for (const index in kingMoves) {
      if (
        this.threatMap[kingMoves[index]] ||
        this.protectedSquares[kingMoves[index]]
      ) {
        kingMovesToDelete.push(Number(index));
        continue;
      }
    }

    for (var i = kingMovesToDelete.length - 1; i >= 0; i--) {
      kingMoves.splice(kingMovesToDelete[i], 1);
    }

    this.runCastlingChecks();
  }

  private runCastlingChecks() {
    if (this.board[this.kingLocation]?.moved === true) {
      return;
    }

    const kingMoves = this.legalMoves[this.kingLocation];

    const { columnNumber, row } = getSquareInfo(this.kingLocation);

    const kingSideSquare = columnNames[columnNumber + 1] + row;

    const queenSideSquare = columnNames[columnNumber - 1] + row;

    const kingSideCastlingSquare = columnNames[columnNumber + 2] + row;
    const queenSideCastlingSquare = columnNames[columnNumber - 2] + row;

    let kingSideCastlingAvaliable = false;
    let queenSideCastlingAvaliable = false;

    let kingSideCastlingIndex = -1;
    let queenSideCastlingIndex = -1;

    // Checking if castling is avaliable
    // and getting indexes for castling squares
    // to delete them if not avaliable
    for (const index in kingMoves) {
      if (kingMoves[index] === kingSideSquare) {
        kingSideCastlingAvaliable = true;
      }

      if (kingMoves[index] === queenSideSquare) {
        queenSideCastlingAvaliable = true;
      }

      if (kingMoves[index] === kingSideCastlingSquare) {
        kingSideCastlingIndex = Number(index);
      }

      if (kingMoves[index] === queenSideCastlingSquare) {
        queenSideCastlingIndex = Number(index);
      }
    }

    const movesToDelete = [];

    if (!kingSideCastlingAvaliable && kingSideCastlingIndex !== -1) {
      movesToDelete.push(kingSideCastlingIndex);
    }

    if (!queenSideCastlingAvaliable && queenSideCastlingIndex !== -1) {
      movesToDelete.push(queenSideCastlingIndex);
    }

    for (var i = movesToDelete.length - 1; i >= 0; i--) {
      kingMoves.splice(movesToDelete[i], 1);
    }
  }

  private makeTempMove(from: string, to: string) {
    const fromContent = this.board[from];

    if (!fromContent) {
      throw SquareIsEmptyError();
    }

    if (fromContent.piece === Pieces.KING) {
      this.previousKingLocation = this.kingLocation;
      this.kingLocation = to;
    }

    if (this.board[to] === undefined) {
      throw BadSquareNameError();
    }

    this.previousBoard = structuredClone(this.board);

    this.board[from] = null;
    this.board[to] = fromContent;
  }

  private undoTempMove() {
    if (!this.previousBoard) {
      throw Error("Something went wrong, previous board is empty");
    }

    this.board = this.previousBoard;

    if (this.previousKingLocation) {
      this.kingLocation = this.previousKingLocation;
      this.previousKingLocation = null;
    }

    this.previousBoard = null;
  }

  private addSquareToThreatMap(controlledSquare: string, controlledBy: string) {
    if (!this.threatMap[controlledSquare]) {
      this.threatMap[controlledSquare] = {
        controlledBy: [controlledBy],
      };
      return;
    }
    this.threatMap[controlledSquare].controlledBy.push(controlledBy);
  }
}
