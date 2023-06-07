import { lexer } from "shasta-lang";

const theme = {
  Function: "text-fuchsia-400 font-bold",
  Identifier: "text-teal-200",
  If: "text-purple-500 italic",
  Then: "text-purple-500 italic",
  Else: "text-purple-500 italic",
  StringLiteral: "text-green-600 dark:text-green-200",
  NumberLiteral: "text-amber-600 dark:text-amber-300",
  BooleanLiteral: "text-orange-600 italic",
  Null: "text-purple-600",
  Comment: "text-gray-600 dark:text-gray-400 italic",
};

export function highlight(source: string) {
  const { tokens } = lexer.tokenize(source);
  let result = "";
  let amountAdded = 0;
  let previousTokenType: string = "";
  for (const token of tokens) {
    const { startOffset, endOffset, tokenType, image } = token;
    if (amountAdded < startOffset) {
      result += `<span>${source.slice(amountAdded + 1, startOffset)}</span>`;
    }
    const tokType =
      tokenType.name === "Identifier"
        ? previousTokenType === "LParen"
          ? "Function"
          : tokenType.name
        : tokenType.name;
    const className = theme[tokType as keyof typeof theme];
    result += `<span ${
      className ? `class="${className}"` : ""
    }>${image}</span>`;
    amountAdded = endOffset!;
    previousTokenType = tokenType.name;
  }
  return result;
}
