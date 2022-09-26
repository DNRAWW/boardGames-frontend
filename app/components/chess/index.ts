import BoardComponent from "./board";
import { Colors, Pieces } from "./utils";
import rules from "./rules/index";
import Square from "./square";
import { ChessEvents, getChessEventEmitter } from "./chessEventEmitter";
import RightPanel from "./rightPanel";
import { placeholderBoard, renderSquaresWithFen } from "./renderFunctions";
import { BoardPersistence } from "./presistence/presistence";
import { ChessMovement } from "./chessMovement";

export {
  BoardComponent as Board,
  RightPanel,
  Square,
  Colors,
  Pieces,
  rules,
  getChessEventEmitter,
  placeholderBoard,
  renderSquaresWithFen,
  BoardPersistence,
  ChessMovement,
};
export type { ChessEvents };
