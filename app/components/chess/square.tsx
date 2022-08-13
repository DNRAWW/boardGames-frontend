import { Colors, Pieces } from "./utils";
import Piece from "./piece";
import TypedEmitter from "typed-emitter";
import { SquareEvents } from "./chessEventEmitter";
import { useEffect, useState } from "react";

interface SquareProps {
  color: Colors;
  children?: JSX.Element | undefined;
  square: string;
  eventEmitter: TypedEmitter<SquareEvents>;
}

export default function Square(props: SquareProps) {
  const [currentPiece, setPiece] = useState<JSX.Element | undefined>(
    props.children
  );

  useEffect(() => {
    // Очень некрасиво, очень страшно, нужно думать как исправить
    props.eventEmitter.on("move", (from, to, piece, color) => {
      if (from !== props.square && to !== props.square) {
        return;
      }

      if (from == to) {
        return;
      }

      if (props.square == from) {
        setPiece(undefined);
      } else {
        setPiece(
          <Piece
            piece={piece}
            color={color}
            square={props.square}
            eventEmitter={props.eventEmitter}
          ></Piece>
        );
      }
    });
  }, []);

  return (
    <div
      id={`square_` + props.square}
      className={
        `w-24 h-24 ` +
        (props.color == Colors.BLACK ? `bg-blue-400` : "bg-blue-300")
      }
      onClick={() => {
        if (currentPiece !== undefined) {
          return;
        }

        props.eventEmitter.emit("squareClicked", {
          color: props.color,
          square: props.square,
        });
      }}
    >
      {currentPiece}
    </div>
  );
}
