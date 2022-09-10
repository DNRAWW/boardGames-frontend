import { Colors, columnNames, TPromotion } from "./utils";
import Square from "./square";
import Piece from "./piece";
import { ChessEvents } from "./chessEventEmitter";
import TypedEmitter from "typed-emitter";
import { BadSquareNameError } from "./errors";
import { ChessRules } from "./rules";
import { useEffect, useState } from "react";
import PromotionComponent from "./promotionComponent";

interface BoardProps {
  squares: {
    [key: string]: JSX.Element;
  };
  perspective: Colors;
  rules: ChessRules;
  eventEmitter?: TypedEmitter<ChessEvents>;
}

export default function BoardComponent(props: BoardProps) {
  const [squaresState, setSquares] = useState<JSX.Element[]>(
    Object.values(props.squares)
  );

  const [gameOverMessage, setGameOverMessage] = useState<string | null>(null);

  const [promotionState, setPromoitionState] = useState<TPromotion | null>(
    null
  );

  useEffect(() => {
    if (!props.eventEmitter) {
      return;
    }
    let squaresObject: {
      [key: string]: JSX.Element;
    } = props.squares;

    props.eventEmitter.on("move", (from, to, piece, color) => {
      const fromSquare = squaresObject[from];
      const toSquare = squaresObject[to];

      if (fromSquare === undefined || toSquare === undefined) {
        console.error("fromSquare:", fromSquare, "\ntoSquare:", toSquare);
        throw BadSquareNameError();
      }

      squaresObject[from] = (
        <Square
          color={fromSquare.props.color}
          eventEmitter={props.eventEmitter}
          square={from}
          key={from}
          avaliable={false}
        ></Square>
      );

      squaresObject[to] = (
        <Square
          color={toSquare.props.color}
          eventEmitter={props.eventEmitter}
          square={to}
          key={to}
          avaliable={false}
        >
          <Piece
            color={color}
            eventEmitter={props.eventEmitter}
            piece={piece}
            square={to}
          ></Piece>
        </Square>
      );

      setSquares(Object.values(squaresObject));
    });

    props.eventEmitter.on("emptySquare", (square) => {
      const squareContent = squaresObject[square];

      squaresObject[square] = (
        <Square
          color={squareContent.props.color}
          eventEmitter={props.eventEmitter}
          square={square}
          key={square}
          avaliable={false}
        ></Square>
      );

      setSquares(Object.values(squaresObject));
    });

    props.eventEmitter.on("placePiece", (piece, color, square) => {
      const squareContent = squaresObject[square];

      squaresObject[square] = (
        <Square
          color={squareContent.props.color}
          eventEmitter={props.eventEmitter}
          square={square}
          key={square}
          avaliable={false}
        >
          <Piece
            color={color}
            piece={piece}
            eventEmitter={props.eventEmitter}
            square={square}
          ></Piece>
        </Square>
      );

      setSquares(Object.values(squaresObject));
    });

    props.eventEmitter.on("avaliableMoves", (avaliableSquares) => {
      for (const square of avaliableSquares) {
        const squareContent = squaresObject[square];

        squaresObject[square] = (
          <Square
            children={squareContent.props.children}
            key={square}
            square={square}
            eventEmitter={props.eventEmitter}
            color={squareContent.props.color}
            avaliable={true}
          ></Square>
        );
      }

      setSquares(Object.values(squaresObject));
    });

    props.eventEmitter.on("cleanAvaliable", (squaresToClean) => {
      for (const square of squaresToClean) {
        const copy = squaresObject[square];

        squaresObject[square] = (
          <Square
            avaliable={false}
            color={copy.props.color}
            eventEmitter={props.eventEmitter}
            square={square}
            children={copy.props.children}
            key={square}
          ></Square>
        );
      }

      setSquares(Object.values(squaresObject));
    });

    props.eventEmitter.on("gameOver", (message) => {
      setGameOverMessage(message);
    });

    props.eventEmitter.on("closePromotion", () => {
      setPromoitionState(null);
    });

    props.eventEmitter.on("askForPromotionPiece", (from, to, color) => {
      setPromoitionState({
        color: color,
        from: from,
        to: to,
      });
    });

    props.eventEmitter.emit("checkGameOver");
  }, []);

  return (
    <div>
      <div className="relative">
        <div
          style={{
            transform: "translateY(-150%)" + " translate(-50%, 0)",
          }}
          className={
            "block absolute left-1/2 " +
            "transition-opacity ease-in-out duration-300 " +
            "top-1/4 " +
            (promotionState && props.eventEmitter
              ? "z-10 opacity-100"
              : "opacity-0")
          }
        >
          {promotionState && props.eventEmitter ? (
            <PromotionComponent
              color={promotionState.color}
              eventEmitter={props.eventEmitter}
              from={promotionState.from}
              to={promotionState.to}
            ></PromotionComponent>
          ) : null}
        </div>
        <div
          className={
            "block h-full absolute text-white text-center " +
            "left-0 right-0 mx-auto " +
            (gameOverMessage ? "z-10" : "")
          }
        >
          <h2
            style={{
              transform: "translateY(-50%)",
            }}
            className={
              "transition-opacity ease-in-out duration-300 inline-block " +
              "relative top-1/2 m-0 p-4 rounded-3xl bg-red-800 " +
              (gameOverMessage ? "opacity-100" : "opacity-0")
            }
          >
            {gameOverMessage ? gameOverMessage : ""}
          </h2>
        </div>
        <div className="border-solid border-emerald-600 grid grid-cols-chessSM sm:grid-cols-chessMD lg:grid-cols-chess md:grid-cols-chessMD gap-0">
          {squaresState}
        </div>
      </div>
    </div>
  );
}
