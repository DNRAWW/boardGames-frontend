import { Pieces, Colors } from "../utils";
import { regularRules } from "./regularRules";

export type InitailizedBoard = {
  [key: string]: { piece: Pieces; color: Colors } | null;
};

export type ChessRules = {
  [key in Pieces]: {
    getAvaliableMoves: (board: InitailizedBoard, square: string) => string[];
  };
};

export default {
  regularRules,
};
