import { Board } from "../chessMovement";
import { Pieces, Colors } from "../utils";
import { regularRules } from "./regularRules";

export type InitailizedBoard = {
  [key: string]: { Piece: Pieces; Color: Colors } | null;
};

export type ChessRules = {
  [key in Pieces]: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => string[];
  };
};

export default {
  regularRules,
};
