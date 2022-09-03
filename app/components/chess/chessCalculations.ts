import { Board } from "./chessMovement";
import { BadSquareNameError, SquareIsEmptyError } from "./errors";
import { ChessRules } from "./rules";
import { Colors, columnNames, getSquareInfo, Pieces } from "./utils";

// TODO: Optimization
// TODO: tie logic

// Если я один раз проверю все ходы это будет быстрее? (Посчитать сложность алгоритма)
export class ChessCalculations {
  private readonly rules: ChessRules;
  private board: Board;

  private threatMap: {
    [key: string]: {
      controlledBy: string[];
    };
  } = {};

  private controlledSquares: {
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

  calculatePossition(color: Colors) {
    this.threatMap = {};
    this.legalMoves = {};
    this.controlledSquares = {};
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
    for (const pieceSquare in this.board) {
      const squareContent = this.board[pieceSquare];

      if (!squareContent) {
        continue;
      }

      const avaliableAndControlledSquares = this.rules[
        squareContent.piece
      ].getAvaliableAndControlledMoves(this.board, pieceSquare);

      const avaliableMoves = avaliableAndControlledSquares.avaliable;
      const controlledSquares = avaliableAndControlledSquares.controlled;

      if (squareContent.color === color) {
        this.legalMoves[pieceSquare] = avaliableMoves;
      } else {
        avaliableMoves.forEach((controlledSquare: string) => {
          if (squareContent.piece !== Pieces.PAWN) {
            this.addSquareToThreatMap(controlledSquare, pieceSquare);
          } else {
            const pieceSquareInfo = getSquareInfo(pieceSquare);
            const controlledSquareInfo = getSquareInfo(controlledSquare);

            if (controlledSquareInfo.columnName != pieceSquareInfo.columnName) {
              this.addSquareToThreatMap(controlledSquare, pieceSquare);
            }
          }
        });

        controlledSquares.forEach((square) => {
          this.controlledSquares[square] = true;
        });
      }

      if (
        squareContent.piece === Pieces.KING &&
        squareContent.color === color
      ) {
        this.kingLocation = pieceSquare;
      }
    }
  }

  //TODO: Refactoring
  private rejectDangerousMoves() {
    let isKingInDanger = false;

    for (const threat in this.threatMap) {
      if (threat === this.kingLocation) {
        isKingInDanger = true;
      }
    }

    if (!isKingInDanger) {
      this.rejectMovesLoop();
    } else {
      this.kingInCheck = true;
      const kingAttackedBy = this.threatMap[this.kingLocation].controlledBy;

      if (kingAttackedBy.length > 1) {
        const kingMoves = this.legalMoves[this.kingLocation];

        this.legalMoves = {};

        this.legalMoves[this.kingLocation] = kingMoves;
      } else {
        const attacker = this.board[kingAttackedBy[0]];

        if (!attacker) {
          throw Error("Attacker is empty");
        }

        const allowedSquares = this.rules[
          attacker.piece
        ].getAvaliableAndControlledMoves(
          this.board,
          kingAttackedBy[0]
        ).avaliable;

        allowedSquares.push(kingAttackedBy[0]);

        for (const pieceSquare in this.legalMoves) {
          const piece = this.board[pieceSquare]?.piece;
          if (piece === Pieces.KING) {
            continue;
          }

          const movesToCheck = this.legalMoves[pieceSquare];
          const movesToDelete = [];

          for (const index in movesToCheck) {
            if (
              !allowedSquares.find((square) => square === movesToCheck[index])
            ) {
              movesToDelete.push(Number(index));
            }
          }

          for (var i = movesToDelete.length - 1; i >= 0; i--) {
            movesToCheck.splice(movesToDelete[i], 1);
          }
        }

        for (const pieceSquare in this.legalMoves) {
          const piece = this.board[pieceSquare]?.piece;
          if (piece === Pieces.KING) {
            continue;
          }

          const movesToCheck = this.legalMoves[pieceSquare];
          const movesToDelete: number[] = [];

          for (const index in movesToCheck) {
            this.makeTempMove(pieceSquare, movesToCheck[index]);

            const attackerMoves = this.rules[
              attacker.piece
            ].getAvaliableAndControlledMoves(
              this.board,
              kingAttackedBy[0]
            ).avaliable;

            if (attackerMoves.find((square) => square === this.kingLocation)) {
              movesToDelete.push(Number(index));
            }

            this.undoTempMove();
          }

          for (var i = movesToDelete.length - 1; i >= 0; i--) {
            movesToCheck.splice(movesToDelete[i], 1);
          }
        }
      }
      this.rejectMovesLoop();
    }
  }

  private rejectMovesLoop() {
    for (const threat in this.threatMap) {
      const moves = this.legalMoves[threat];
      const controlledBy = this.threatMap[threat].controlledBy;

      if (!moves) {
        continue;
      }

      const movesToDelete = [];

      for (const index in moves) {
        this.makeTempMove(threat, moves[index]);

        for (const pieceToCheckSquare of controlledBy) {
          const piece = this.board[pieceToCheckSquare];

          if (!piece) {
            throw Error(`Something went wrong, ${pieceToCheckSquare} is empty`);
          }

          const avaliableMoves = this.rules[
            piece.piece
          ].getAvaliableAndControlledMoves(
            this.board,
            pieceToCheckSquare
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
        this.controlledSquares[kingMoves[index]]
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

  // TODO: Refactoring, make it more readable
  private runCastlingChecks() {
    const kingMoves = this.legalMoves[this.kingLocation];

    if (this.board[this.kingLocation]?.moved !== true) {
      const kingSquareInfo = getSquareInfo(this.kingLocation);

      const kingSideSquare =
        columnNames[kingSquareInfo.columnNumber + 1] + kingSquareInfo.row;

      const queenSideSquare =
        columnNames[kingSquareInfo.columnNumber - 1] + kingSquareInfo.row;

      const kingCastlingSquare =
        columnNames[kingSquareInfo.columnNumber + 2] + kingSquareInfo.row;
      const queenCastlingSquare =
        columnNames[kingSquareInfo.columnNumber - 2] + kingSquareInfo.row;

      let kingSideCastlingAvaliable = false;
      let queenSideCastlingAvaliable = false;

      let kingSideCastlingIndex = -1;
      let queenSideCastlingIndex = -1;

      for (const index in kingMoves) {
        if (kingMoves[index] === kingSideSquare) {
          kingSideCastlingAvaliable = true;
        }

        if (kingMoves[index] === queenSideSquare) {
          queenSideCastlingAvaliable = true;
        }

        if (kingMoves[index] === kingCastlingSquare) {
          kingSideCastlingIndex = Number(index);
        }

        if (kingMoves[index] === queenCastlingSquare) {
          queenSideCastlingIndex = Number(index);
        }
      }

      const movesToDelete = [];

      if (!kingSideCastlingAvaliable) {
        if (kingSideCastlingIndex !== -1) {
          movesToDelete.push(kingSideCastlingIndex);
        }
      }
      if (!queenSideCastlingAvaliable) {
        if (queenSideCastlingIndex !== -1) {
          movesToDelete.push(queenSideCastlingIndex);
        }
      }

      for (var i = movesToDelete.length - 1; i >= 0; i--) {
        kingMoves.splice(movesToDelete[i], 1);
      }
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
