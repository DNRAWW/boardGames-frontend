import { Colors, Pieces } from "./utils";
import Piece from "./piece";
import TypedEmitter from "typed-emitter";
import { SquareEvents } from "./chessEventEmitter";

interface SquareProps {
  color: Colors;
  children?: JSX.Element | undefined;
  square: string;
  eventEmitter?: TypedEmitter<SquareEvents>;
  avaliable: boolean;
}

export default function Square(props: SquareProps) {
  const handleClick = () => {
    if (props.eventEmitter) {
      if (props.children !== undefined) {
        return;
      }

      props.eventEmitter.emit("squareClicked", {
        color: props.color,
        square: props.square,
      });
    }
  };

  return (
    <div
      id={`square_` + props.square}
      className={
        `relative w-10 h-10 lg:w-24 lg:h-24 md:w-20 md:h-20 sm:w-20 sm:h-20 ` +
        (props.color == Colors.BLACK ? "bg-emerald-500 " : "bg-emerald-200 ") +
        (props.avaliable
          ? "cursor-pointer before:content-[''] before:absolute "
          : "") +
        // TODO: Make it more readable
        (props.children && props.avaliable
          ? "before:border-red-500 before:w-full before:h-full before:box-border before:border-solid before:rounded-3xl"
          : "before:bg-cyan-400 before:m-auto before:left-0 before:right-0 before:bottom-0 before:top-0 before:block before:w-1/3 before:h-1/3 before:rounded-full")
      }
      onClick={handleClick}
    >
      {props.children}
    </div>
  );
}
