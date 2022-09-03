import { Colors, Pieces } from "./utils";
import TypedEmitter from "typed-emitter";
import { PromotionEvents } from "./chessEventEmitter";
import Piece from "./piece";

interface PromotionProps {
  from: string;
  to: string;
  color: Colors;
  eventEmitter: TypedEmitter<PromotionEvents>;
}

// TODO: Button close, background, make it over the board (add prop for classNames)

export default function PromotionComponent(props: PromotionProps) {
  const pieces = [Pieces.BISHOP, Pieces.KNIGHT, Pieces.QUEEN, Pieces.ROOK];
  const piecesToRender: JSX.Element[] = [];

  for (const piece of pieces) {
    piecesToRender.push(
      <div
        className="mr-3"
        onClick={() => {
          props.eventEmitter.emit("promote", props.from, props.to, piece);
          props.eventEmitter.emit("closePromotion");
        }}
        key={piece}
      >
        <Piece color={props.color} piece={piece} square=""></Piece>
      </div>
    );
  }

  return <div className="flex">{piecesToRender}</div>;
}
