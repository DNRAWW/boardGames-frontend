import { PieceEvents } from "./chessEventEmitter";
import { Colors, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";

const pieceStyle = {
  width: "6rem",
  height: "6rem",
};

interface PieceProps {
  color: Colors;
  piece: Pieces;
  square: string;
  eventEmitter?: TypedEmitter<PieceEvents>;
}

export default function Piece(props: PieceProps) {
  const handleClick = () => {
    if (props.eventEmitter) {
      props.eventEmitter.emit("pieceClicked", {
        color: props.color,
        square: props.square,
        piece: props.piece,
      });
    }
  };

  return (
    <div id={`piece_` + props.square}>
      <img
        draggable="false"
        onClick={handleClick}
        className="block w-10 h-10 lg:w-24 lg:h-24 md:w-20 md:h-20 sm:w-20 sm:h-20 relative cursor-pointer"
        src={`${props.color}_${props.piece}.svg`}
      ></img>
    </div>
  );
}
