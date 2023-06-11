import { lexer } from "shasta-lang";

const theme = {
  Function: "text-fuchsia-500 dark:text-fuchsia-400 font-bold",
  Identifier: "text-red-600 dark:text-teal-200",
  If: "text-purple-500 italic",
  Then: "text-purple-500 italic",
  Else: "text-purple-500 italic",
  StringLiteral: "text-green-600 dark:text-green-200",
  NumberLiteral: "text-amber-600 dark:text-amber-300",
  BooleanLiteral: "text-orange-600 italic",
  Null: "text-purple-600",
  Comment: "text-gray-600 dark:text-gray-400 italic",
  Error: "text-inherit underline decoration-wavy decoration-red-500",
  other: "text-inherit",
};

type Token = Pick<
  ReturnType<typeof lexer.tokenize>["tokens"][number],
  "startOffset" | "endOffset" | "tokenType" | "image"
>;

export function highlight(source: string) {
  const {
    tokens,
    groups: { comments },
    errors,
  } = lexer.tokenize(source);
  if (errors) console.log("ERRORS", errors);
  tokens.push(...comments);
  const allTokens: Token[] = [];
  for (let i = 0; i < source.length; i++) {
    const error = errors.find((e) => e.offset === i);
    const token = tokens.find((t) => t.startOffset === i);
    if (error)
      allTokens.push({
        image: source.slice(i, i + error.length),
        startOffset: i,
        endOffset: i + error.length,
        tokenType: { name: "Error" },
      });
    else if (token) allTokens.push(token);
  }
  console.log(allTokens);
  let amountAdded = 0;
  let previousTokenType: string = "";
  return allTokens
    .map((token) => {
      const { startOffset, endOffset, tokenType, image } = token;
      let result: string = "";
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
      return result;
    })
    .join("");
}
