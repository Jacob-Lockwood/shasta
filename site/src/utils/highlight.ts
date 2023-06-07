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
  other: "text-gray-400",
};

export function highlight(source: string) {
  const {
    tokens,
    groups: { comments },
  } = lexer.tokenize(source);
  tokens.push(...comments);
  const allTokens: typeof tokens = [];
  for (let i = 0; i < source.length; i++) {
    const token = tokens.find((t) => t.startOffset === i);
    if (token) allTokens.push(token);
  }
  let result = "";
  let amountAdded = 0;
  let previousTokenType: string = "";
  for (const token of allTokens) {
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
    const className = theme[tokType as keyof typeof theme] ?? theme.other;
    result += `<span class="${className}">${image}</span>`;
    amountAdded = endOffset!;
    previousTokenType = tokenType.name;
  }
  return result;
}
