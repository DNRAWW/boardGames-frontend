import { Pieces, Colors } from "./utils";

const fenPiecesNames: { [key: string]: Pieces } = {
  b: Pieces.BISHOP,
  k: Pieces.KING,
  n: Pieces.KNIGHT,
  p: Pieces.PAWN,
  q: Pieces.QUEEN,
  r: Pieces.ROOK,
};

export function fenToPiece(stringPiece: string): Pieces | undefined {
  const piece = fenPiecesNames[stringPiece.toLowerCase()];

  if (piece) {
    return piece;
  }

  return undefined;
}

export function fenToColor(stringPiece: string): Colors {
  if (stringPiece === stringPiece.toUpperCase()) {
    return Colors.WHITE;
  }

  return Colors.BLACK;
}

export function formatColumns(row: string[]): string[] | null {
  let columns: string[] = [];

  if (row.length < 8) {
    row.forEach((column) => {
      const emptySpaces = parseInt(column);

      if (emptySpaces != NaN && emptySpaces > 0) {
        for (let c = 0; c < emptySpaces; c++) {
          columns.push("");
        }
      } else if (emptySpaces <= 0) {
        return null;
      } else {
        columns.push(column);
      }
    });

    return columns;
  }

  return row.length > 8 ? null : row;
}
