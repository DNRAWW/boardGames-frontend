import TypedEmitter from "typed-emitter";
import { ChessEvents } from "./chessEventEmitter";
import { Board } from "./chessMovement";
import { BadInputError, InvalidFenError } from "./errors";
import { formatColumns, fenToPiece, fenToColor } from "./fenFunctions";
import Piece from "./piece";
import Square from "./square";
import { Colors, Pieces, columnNames } from "./utils";

export function renderSquaresWithFen(
  fen: string,
  perspective: Colors,
  eventEmitter: TypedEmitter<ChessEvents>
) {
  const fenSections = fen.split(" ");
  const colorToMove = fenSections[1] === "w" ? Colors.WHITE : Colors.BLACK;

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

  return { squares, board, colorToMove };
}

export function placeholderBoard() {
  const placeholderBoard: { [key: string]: JSX.Element } = {};

  for (let row = 1; row <= 8; row++) {
    for (let column = 1; column <= 8; column++) {
      const squareColor =
        (column + row) % 2 === 0 ? Colors.WHITE : Colors.BLACK;
      const square = columnNames[column] + row;

      placeholderBoard[square] = (
        <Square
          avaliable={false}
          color={squareColor}
          square={square}
          key={square}
        ></Square>
      );
    }
  }

  return placeholderBoard;
}
