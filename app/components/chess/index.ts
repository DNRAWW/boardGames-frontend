import BoardComponent from "./board";
import { Colors, Pieces } from "./utils";
import rules from "./rules/index";
import Square from "./square";
import { getChessEventEmitter } from "./chessEventEmitter";
import RightPanel from "./rightPanel";

export {
  BoardComponent as Board,
  RightPanel,
  Square,
  Colors,
  Pieces,
  rules,
  getChessEventEmitter,
};
