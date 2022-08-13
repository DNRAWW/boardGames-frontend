import { Board, Colors, rules } from "@components/chess";

export default function Chess() {
  const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  return (
    <main>
      <h1>Play chess</h1>

      <div>
        <Board
          fen={fen}
          perspective={Colors.WHITE}
          rules={rules.regularRules}
        ></Board>
      </div>
    </main>
  );
}
