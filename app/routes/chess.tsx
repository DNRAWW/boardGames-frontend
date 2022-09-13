import {
  Board,
  Colors,
  rules,
  getChessEventEmitter,
  RightPanel,
} from "@components/chess";
import { MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import TypedEventEmitter from "typed-emitter";
import { ChessEvents } from "~/components/chess/chessEventEmitter";
import { ChessMovement } from "~/components/chess/chessMovement";
import { BoardPersistence } from "~/components/chess/presistence/presistence";
import {
  placeholderBoard,
  renderSquaresWithFen,
} from "~/components/chess/renderFunctions";

export const meta: MetaFunction = () => ({
  title: "Chess",
});

export default function Chess() {
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const [playAgain, setPlayAgain] = useState(0);
  const [eventEmitter, setEventEmitter] =
    useState<TypedEventEmitter<ChessEvents>>();
  const [perspective, setPerspective] = useState(Colors.WHITE);
  const [squares, setSquares] = useState<{ [key: string]: JSX.Element }>(
    placeholderBoard()
  );
  const [renderCount, setRenderCount] = useState(0);
  const [colorToMove, setColorToMove] = useState(Colors.WHITE);

  useEffect(() => {
    const chessMovement = new ChessMovement();
    const eventEmitter = getChessEventEmitter(chessMovement);

    setEventEmitter(eventEmitter);

    const persistence = new BoardPersistence();
    const persistedBoardInfo = persistence.getBoardInfo();
    const persistedUI = persistence.getUI(perspective, eventEmitter);

    if (persistedBoardInfo && persistedUI) {
      chessMovement.init(
        persistedBoardInfo.board,
        persistedBoardInfo.colorToMove,
        rules.regularRules
      );

      setColorToMove(persistedBoardInfo.colorToMove);
      setSquares(persistedUI);
      setRenderCount((prev) => prev + 1);
    } else {
      const { squares, board, colorToMove } = renderSquaresWithFen(
        fen,
        perspective,
        eventEmitter
      );

      chessMovement.init(board, colorToMove, rules.regularRules);

      setColorToMove(colorToMove);
      setSquares(squares);
      setRenderCount((prev) => prev + 1);
    }

    const presistBoard = () => {
      const board = chessMovement.getBoard();
      const colorToMove = chessMovement.getColorToMove();

      persistence.presistBoard(board, colorToMove);
    };

    eventEmitter.on("move", () => {
      presistBoard();
    });
  }, [playAgain]);

  const handlePlayAgain = () => {
    localStorage.removeItem("board");
    localStorage.removeItem("colorToMove");

    setPlayAgain((prev) => {
      return prev + 1;
    });
  };

  return (
    <main key={renderCount}>
      <h1>Play chess</h1>

      <div className="flex justify-center">
        <div className="grid md:grid-cols-chessLayoutMD lg:grid-cols-chessLayout gap-8">
          <div></div>
          <div>
            <Board
              squares={squares}
              perspective={perspective}
              rules={rules.regularRules}
              eventEmitter={eventEmitter}
              key={playAgain}
            ></Board>
          </div>
          <div className="self-center mx-auto lg:mx-0">
            <RightPanel
              eventEmitter={eventEmitter}
              handlePlayAgain={handlePlayAgain}
              colorToMove={colorToMove}
            ></RightPanel>
          </div>
        </div>
      </div>
    </main>
  );
}
