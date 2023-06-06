import { parse } from "shasta-lang";

type CstNode = ReturnType<typeof parse>["cst"];
type IToken = Exclude<CstNode["children"][string][number], CstNode>;

const theme = {
  variable: "text-teal-800 dark:text-teal-400 font-bold",
  fnApply: "text-fuchsia-500 font-bold",
  string: "text-green-600 dark:text-green-200",
  number: "text-amber-600 dark:text-amber-300",
};

export function highlight(source: string) {
  const { cst } = parse(source);
  let result = "";
}
