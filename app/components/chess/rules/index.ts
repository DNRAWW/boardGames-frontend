import { BoardExtras } from "../chessMovement";
import { Pieces, Colors } from "../utils";
import { regularRules } from "./regularRules";

export type InitailizedBoard = {
  [key: string]: { piece: Pieces; color: Colors; moved?: boolean } | null;
} & BoardExtras;

export type ChessRules = {
  [key in Pieces]: {
    getAvaliableAndControlledMoves: (
      board: Readonly<InitailizedBoard>,
      square: string
    ) => { avaliable: string[]; controlled: string[] };
  };
};

export default {
  regularRules,
};
