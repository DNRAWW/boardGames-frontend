import BoardComponent from "./board";
import { Colors, Pieces } from "./utils";
import rules from "./rules/index";
import Square from "./square";
import { getChessEventEmitter } from "./chessEventEmitter";

export {
  BoardComponent as Board,
  Square,
  Colors,
  Pieces,
  rules,
  getChessEventEmitter,
};
