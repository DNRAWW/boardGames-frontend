import { useEffect, useState } from "react";
import TypedEventEmitter from "typed-emitter";
import { ChessEvents } from "./chessEventEmitter";
import { Colors } from "./utils";

interface LeftPanelProps {
  handlePlayAgain: () => void;
  colorToMove: Colors;
  eventEmitter?: TypedEventEmitter<ChessEvents>;
}

export default function RightPanel(props: LeftPanelProps) {
  const [colorToMove, setColorToMove] = useState(props.colorToMove);

  useEffect(() => {
    if (!props.eventEmitter) {
      return;
    }

    props.eventEmitter.on("colorToMoveChanged", (color) => {
      setColorToMove(color);
    });
  }, []);

  return (
    <div className="block p-5 bg-cyan-300 rounded-2xl">
      <div>
        <h2 className="text-center m-0 mb-2">
          {colorToMove[0].toUpperCase() + colorToMove.slice(1)} move
        </h2>
      </div>

      <button
        onClick={props.handlePlayAgain}
        className="block bg-gray-100 border-none rounded-md mx-auto w-36 h-16"
      >
        Play again
      </button>
    </div>
  );
}
