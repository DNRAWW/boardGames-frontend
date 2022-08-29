import { Colors, columnNames, Pieces } from "./utils";
import Square from "./square";
import Piece from "./piece";
import { ChessEvents, getChessEventEmitter } from "./chessEventEmitter";
import TypedEmitter from "typed-emitter";
import { BadInputError, BadSquareNameError, InvalidFenError } from "./errors";
import { Board } from "./chessMovement";
import { ChessRules } from "./rules";
import { formatColumns, fenToPiece, fenToColor } from "./fenFunctions";
import { useEffect, useState } from "react";

interface BoardProps {
  fen: string;
  perspective: Colors;
  rules: ChessRules;
}

function renderSquares(
  fen: string,
  perspective: Colors,
  eventEmitter: TypedEmitter<ChessEvents>
) {
  const fenSections = fen.split(" ");

  let startRow = 0;
  let startColumn = 0;
  let endRow = 0;
  let endColumn = 0;
  let loopIncremet = 0;

  if (perspective === Colors.WHITE) {
    startRow = 8;
    startColumn = 1;
    endRow = 1;
    endColumn = 8;
    loopIncremet = -1;
  } else if (perspective === Colors.BLACK) {
    startRow = 1;
    startColumn = 8;
    endRow = 8;
    endColumn = 1;
    loopIncremet = 1;
  } else {
    throw BadInputError();
  }

  if (fenSections.length != 6) {
    throw InvalidFenError(fen);
  }

  const rows = fenSections[0].split("/").reverse();

  const squares: { [key: string]: JSX.Element } = {};
  const board: Board = { lastMove: null };

  const renderDone = (row: number) => {
    if (perspective === Colors.WHITE) {
      return row >= endRow;
    }

    return row <= endRow;
  };

  const columnsLeft = (column: number) => {
    if (perspective === Colors.WHITE) {
      return column <= endColumn;
    }

    return column >= endColumn;
  };

  for (let row = startRow; renderDone(row); row += loopIncremet) {
    const currentRow = rows[row - 1].split("");

    let columns: string[] | null = formatColumns(currentRow);

    if (columns === null) {
      throw InvalidFenError(fen);
    }

    for (
      let column = startColumn;
      columnsLeft(column);
      column -= loopIncremet
    ) {
      const columnContent = columns[column - 1];

      let piece: Pieces | undefined = undefined;
      let pieceColor: Colors | undefined = undefined;

      if (columnContent !== "" && columnContent !== "1") {
        piece = fenToPiece(columnContent);
        pieceColor = fenToColor(columnContent);

        if (!piece || !pieceColor) {
          throw InvalidFenError(fen);
        }
      }
      const squareName = columnNames[column] + row;

      squares[squareName] = (
        <Square
          square={squareName}
          color={(column + row) % 2 !== 0 ? Colors.WHITE : Colors.BLACK}
          key={squareName}
          eventEmitter={eventEmitter}
          avaliable={false}
        >
          {piece && pieceColor ? (
            <Piece
              piece={piece}
              color={pieceColor}
              square={squareName}
              eventEmitter={eventEmitter}
            ></Piece>
          ) : undefined}
        </Square>
      );

      board[squareName] =
        piece && pieceColor
          ? {
              piece: piece,
              color: pieceColor,
            }
          : null;
    }
  }

  return { squares, board };
}

export default function BoardComponent(props: BoardProps) {
  const [squaresState, setSquares] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const chessEventEmitter = getChessEventEmitter();

    const { squares, board } = renderSquares(
      props.fen,
      props.perspective,
      chessEventEmitter
    );

    setSquares(Object.values(squares));

    chessEventEmitter.on("move", (from, to, piece, color) => {
      const fromSquare = squares[from];
      const toSquare = squares[to];

      if (fromSquare === undefined || toSquare === undefined) {
        console.error("fromSquare:", fromSquare, "\ntoSquare:", toSquare);
        throw BadSquareNameError();
      }

      squares[from] = (
        <Square
          color={fromSquare.props.color}
          eventEmitter={chessEventEmitter}
          square={from}
          key={from}
          avaliable={false}
        ></Square>
      );

      squares[to] = (
        <Square
          color={toSquare.props.color}
          eventEmitter={chessEventEmitter}
          square={to}
          key={to}
          avaliable={false}
        >
          <Piece
            color={color}
            eventEmitter={chessEventEmitter}
            piece={piece}
            square={to}
          ></Piece>
        </Square>
      );

      setSquares(Object.values(squares));
    });

    chessEventEmitter.emit("initChessMovement", board, props.rules);

    chessEventEmitter.on("emptySquare", (square) => {
      const squareContent = squares[square];

      squares[square] = (
        <Square
          color={squareContent.props.color}
          eventEmitter={chessEventEmitter}
          square={square}
          key={square}
          avaliable={false}
        ></Square>
      );

      setSquares(Object.values(squares));
    });

    chessEventEmitter.on("avaliableMoves", (avaliableSquares) => {
      for (const square of avaliableSquares) {
        const squareContent = squares[square];

        squares[square] = (
          <Square
            children={squareContent.props.children}
            key={square}
            square={square}
            eventEmitter={chessEventEmitter}
            color={squareContent.props.color}
            avaliable={true}
          ></Square>
        );
      }

      setSquares(Object.values(squares));
    });

    chessEventEmitter.on("cleanAvaliable", () => {
      for (const square in squares) {
        const copy = squares[square];

        squares[square] = (
          <Square
            avaliable={false}
            color={copy.props.color}
            eventEmitter={chessEventEmitter}
            square={square}
            children={copy.props.children}
            key={square}
          ></Square>
        );
      }

      setSquares(Object.values(squares));
    });
  }, []);

  return <div className="grid grid-cols-chess gap-0">{squaresState}</div>;
}
