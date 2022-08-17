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
  return (
    <div
      id={`square_` + props.square}
      className={
        `w-24 h-24 ` +
        (props.color == Colors.BLACK ? `bg-blue-400` : "bg-blue-300")
      }
      onClick={() => {
        if (props.children !== undefined) {
          return;
        }

        props.eventEmitter.emit("squareClicked", {
          color: props.color,
          square: props.square,
        });
      }}
    >
      {props.children}
    </div>
  );
}
