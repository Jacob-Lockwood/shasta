import { parse } from "./parse.js";
import { fixIdentifier } from "./fix_identifier.js";
import type { CstNode, IToken } from "chevrotain";

type ShastaNode =
  | { type: "program"; statements: ShastaNode[] }
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "null"; value: null }
  | { type: "boolean"; value: boolean }
  | { type: "array"; value: ShastaNode[] }
  | { type: "assignment"; name: string; value: ShastaNode }
  | { type: "identifier"; name: string }
  | { type: "fnApply"; fn: ShastaNode; args: ShastaNode[] }
  | {
      type: "fnDefinition";
      args: string[];
      statements: ShastaNode[];
      id: number;
    }
  | {
      type: "ifExpression";
      if: ShastaNode;
      then: ShastaNode;
      else: ShastaNode;
    }
  | Record<string, never>;

function ifExpressionToShastaNode(expressions: CstNode[]): ShastaNode {
  if (expressions.length === 1) return cstNodeToShastaNode(expressions[0]);
  const [cond, then, ...rest] = expressions;
  const else_ =
    rest.length > 1
      ? {
          type: "ifExpression" as const,
          if: cstNodeToShastaNode(rest[0]),
          then: cstNodeToShastaNode(rest[1]),
          else: ifExpressionToShastaNode(rest.slice(2)),
        }
      : cstNodeToShastaNode(rest[0]);
  return {
    type: "ifExpression",
    if: cstNodeToShastaNode(cond),
    then: cstNodeToShastaNode(then),
    else: else_,
  };
}

interface Ctx {
  args?: string[];
  argsUsed?: number;
  fns: (ShastaNode & { type: "fnDefinition" })[];
}

function cstNodeToShastaNode(
  { children, name }: CstNode,
  ctx: Ctx = { fns: [] }
): ShastaNode {
  const down = (node: CstNode) => cstNodeToShastaNode(node, ctx);
  if (name === "program") {
    if (!children.statement) return { type: "program", statements: [] };
    return {
      type: "program",
      statements: (children.statement as CstNode[]).map(down),
    };
  }
  if (name === "statement") {
    if ("assignment" in children) {
      const assignment = (children.assignment[0] as CstNode).children;
      const ident = assignment.Identifier[0] as IToken;
      const expression = assignment.expression[0] as CstNode;
      return {
        type: "assignment",
        name: fixIdentifier(ident.image),
        value: down(expression),
      };
    }
    if ("expression" in children) {
      return down(children.expression[0] as CstNode);
    }
  }
  if ("StringLiteral" in children) {
    return {
      type: "string",
      value: (children.StringLiteral[0] as IToken).image,
    };
  }
  if ("NumberLiteral" in children) {
    return {
      type: "number",
      value: +(children.NumberLiteral[0] as IToken).image.replace("_", "-"),
    };
  }
  if ("BooleanLiteral" in children) {
    return {
      type: "boolean",
      value: Boolean((children.BooleanLiteral[0] as IToken).image),
    };
  }
  if ("Null" in children) {
    return {
      type: "null",
      value: null,
    };
  }
  if ("array" in children) {
    const arr = (children.array[0] as CstNode).children.expression as
      | CstNode[]
      | undefined;
    return { type: "array", value: (arr ?? []).map(down) };
  }
  if ("propertyAccess" in children) {
    return {
      type: "identifier",
      name: (
        (children.propertyAccess[0] as CstNode).children.Identifier as IToken[]
      )
        .map((node) => fixIdentifier(node.image))
        .join("."),
    };
  }
  if ("fnApply" in children) {
    const fnApply = (children.fnApply[0] as CstNode).children;
    const [fn, ...args] = fnApply.expression as CstNode[];
    return {
      type: "fnApply",
      fn: down(fn),
      args: args.map((arg) => down(arg)),
    };
  }
  if ("fnDefinition" in children) {
    const fnDefinition = (children.fnDefinition[0] as CstNode).children;
    const args =
      "Identifier" in fnDefinition
        ? (fnDefinition.Identifier as IToken[]).map((ident) =>
            fixIdentifier(ident.image)
          )
        : "Arity" in fnDefinition
        ? [
            ...Array(
              +(fnDefinition.Arity as IToken[])[0].image.slice(1, -1)
            ).keys(),
          ].map((i) => `$${i || ""}`)
        : ["$"];
    const id = ctx.fns.length;
    const statements = (fnDefinition.statement as CstNode[]).map((node) =>
      cstNodeToShastaNode(node, { ...ctx, args })
    );
    return { type: "fnDefinition", args, statements, id };
  }
  if ("ifExpression" in children) {
    const expressions = (children.ifExpression[0] as CstNode).children
      .expression as CstNode[];
    return ifExpressionToShastaNode(expressions);
  }
  return {};
}

function ShastaNodeToJS(node: ShastaNode): string {
  switch (node.type) {
    case "program":
      return node.statements
        .map((expr) => ShastaNodeToJS(expr) + ";")
        .join("\n");
    case "string":
      return node.value;
    case "number":
      return node.value.toString();
    case "boolean":
      return node.value + "";
    case "null":
      return node.value + "";
    case "array":
      return `[${node.value.map(ShastaNodeToJS).join(", ")}]`;
    case "assignment":
      return `const ${node.name} = ${ShastaNodeToJS(node.value)}`;
    case "identifier":
      return node.name;
    case "fnApply":
      return `${ShastaNodeToJS(node.fn)}(${node.args
        .map(ShastaNodeToJS)
        .join(", ")})`;
    case "fnDefinition": {
      const [final, ...rest] = node.statements.map(ShastaNodeToJS).reverse();
      return `((${node.args.join(", ")}) => {${rest.join(
        ";\n"
      )};return ${final}})`;
    }
    case "ifExpression":
      return `${ShastaNodeToJS(node.if)} ? ${ShastaNodeToJS(
        node.then
      )} : ${ShastaNodeToJS(node.else)}`;
    default:
      return "";
  }
}

export function compile(source: string) {
  const { cst, parseErrors } = parse(source);
  if (!cst && parseErrors.length)
    throw new Error(JSON.stringify(parseErrors, null, 2));
  const intermediate = cstNodeToShastaNode(cst);
  const js = ShastaNodeToJS(intermediate);
  return js;
}
