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

export default function PromotionComponent(props: PromotionProps) {
  const pieces = [Pieces.BISHOP, Pieces.KNIGHT, Pieces.QUEEN, Pieces.ROOK];
  const piecesToRender: JSX.Element[] = [];

  for (const piece of pieces) {
    piecesToRender.push(
      <div
        className={
          "px-4 cursor-pointer " +
          (piece !== Pieces.ROOK
            ? "border-x-0 border-y-0 border-r-2 border-solid"
            : "pr-0")
        }
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

  return (
    <div className="flex bg-emerald-300 rounded-2xl">
      <div className="flex">{piecesToRender}</div>
      <button
        className="h-5 mt-1 mr-1 rounded-md border-none"
        onClick={() => {
          props.eventEmitter.emit("closePromotion");
        }}
      >
        x
      </button>
    </div>
  );
}
