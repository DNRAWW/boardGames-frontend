import { Board, Colors, rules } from "@components/chess";
import { useState } from "react";

export default function Chess() {
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  const [playAgain, setPlayAgain] = useState<number>(0);

  const handlePlayAgain = () => {
    localStorage.removeItem("board");
    localStorage.removeItem("colorToMove");

    setPlayAgain((prevState) => {
      return (prevState += 1);
    });
  };

  return (
    <main>
      <h1>Play chess</h1>

      <Board
        fen={fen}
        perspective={Colors.WHITE}
        rules={rules.regularRules}
        key={playAgain}
      ></Board>

      <button onClick={handlePlayAgain} className="block mt-5 w-20 h-20">
        Play again
      </button>
    </main>
  );
}
