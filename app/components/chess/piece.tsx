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
  eventEmitter: TypedEmitter<PieceEvents>;
}

export default function Piece(props: PieceProps) {
  return (
    <div id={`piece_` + props.square}>
      <img
        draggable="false"
        onClick={() => {
          props.eventEmitter.emit("pieceClicked", {
            color: props.color,
            square: props.square,
            piece: props.piece,
          });
        }}
        style={pieceStyle}
        src={`./images/${props.color}_${props.piece}.svg`}
      ></img>
    </div>
  );
}
