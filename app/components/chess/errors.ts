export const InvalidFenError = (fen: string) => Error(`Invalid FEN: ${fen}`);

export const BoardIsNotInitializedErorr = () =>
  Error("Board is not initialized yet");

export const BadInputError = () => Error("Bad input");

export const BadSquareNameError = () => Error("Invalid square name");

export const SquareIsEmptyError = () => Error("Square is empty");
