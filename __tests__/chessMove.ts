import { Colors, Pieces } from "../app/components/chess/utils";
import { Board, ChessMovement } from "../app/components/chess/chessMovement";
import { regularRules } from "../app/components/chess/rules/regularRules";
import { SquareIsEmptyError } from "../app/components/chess/errors";
import TypedEmitter from "typed-emitter";
import { ChessEvents } from "../app/components/chess/chessEventEmitter";
import EventEmitter from "events";

const initChessMovement = (board: Board) => {
  const chessEventEmitter = new EventEmitter() as TypedEmitter<ChessEvents>;
  const chessMovement = new ChessMovement(chessEventEmitter);

  chessMovement.init(board, regularRules);

  return chessMovement;
};

describe("Сhess movement class", () => {
  test("Make right chess move", () => {
    const board: Board = {
      a3: null,
      a2: {
        piece: Pieces.PAWN,
        color: Colors.WHITE,
      },
      lastMove: null,
    };

    const chessMovement = initChessMovement(board);

    chessMovement.move("a2", "a3");

    expect(JSON.stringify(chessMovement.getSquarePiece("a3"))).toBe(
      JSON.stringify({
        piece: Pieces.PAWN,
        color: Colors.WHITE,
      })
    );
  });

  test("Make wrong chess move", () => {
    const board: Board = {
      a3: null,
      a2: {
        piece: Pieces.PAWN,
        color: Colors.WHITE,
      },
      lastMove: null,
    };

    const chessMovement = initChessMovement(board);

    expect(() => chessMovement.move("a3", "a2")).toThrowError(
      SquareIsEmptyError()
    );
  });
});

export {};
