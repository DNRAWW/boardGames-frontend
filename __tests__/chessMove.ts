import { Colors, Pieces } from "../app/components/chess/utils";
import { Board, ChessMovement } from "../app/components/chess/chessMovement";
import { regularRules } from "../app/components/chess/rules/regularRules";
import { SquareIsEmptyError } from "../app/components/chess/errors";

const initChessMovement = (board: Board) => {
  const chessMovement = new ChessMovement();

  chessMovement.setSquares(board);
  chessMovement.setRules(regularRules);

  return chessMovement;
};

test("Right chess move", () => {
  const board: Board = {
    a3: null,
    a2: {
      piece: Pieces.PAWN,
      color: Colors.WHITE,
    },
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

test("Chess move from null", () => {
  const board: Board = {
    a3: null,
    a2: {
      piece: Pieces.PAWN,
      color: Colors.WHITE,
    },
  };
  const chessMovement = initChessMovement(board);

  expect(() => chessMovement.move("a3", "a2")).toThrowError(
    SquareIsEmptyError()
  );
});

export {};
