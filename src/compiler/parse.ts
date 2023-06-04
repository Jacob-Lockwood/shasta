import { createToken, Lexer, CstParser } from "chevrotain";

const Identifier = createToken({
  name: "Identifier",
  pattern: /\$(?:[1-9]\d*)?|[a-zA-Z*+!_%\-\/<>]+/,
});

const tokens = {
  WhiteSpace: createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
  }),
  LCurly: createToken({ name: "LCurly", pattern: /{/ }),
  RCurly: createToken({ name: "RCurly", pattern: /}/ }),
  LBracket: createToken({ name: "LBracket", pattern: /\[/ }),
  RBracket: createToken({ name: "RBracket", pattern: /]/ }),
  LParen: createToken({ name: "LParen", pattern: /\(/ }),
  RParen: createToken({ name: "RParen", pattern: /\)/ }),
  Period: createToken({ name: "Period", pattern: /\./ }),
  Comma: createToken({ name: "Comma", pattern: /,/ }),
  If: createToken({ name: "If", pattern: /if/, longer_alt: Identifier }),
  Then: createToken({ name: "Then", pattern: /then/, longer_alt: Identifier }),
  Else: createToken({ name: "Else", pattern: /else/, longer_alt: Identifier }),
  Arity: createToken({ name: "Arity", pattern: /\|[1-9]\d*\|/ }),
  Pipe: createToken({ name: "Pipe", pattern: /\|/ }),
  StringLiteral: createToken({
    name: "StringLiteral",
    pattern: /"(?:[^\\"]|\\.)*"|'(?:[^\\']|\\.)*'/,
  }),
  NumberLiteral: createToken({
    name: "NumberLiteral",
    pattern: /_?(?:0|[1-9]\d*)(?:\.\d+)?/,
  }),
  BooleanLiteral: createToken({
    name: "BooleanLiteral",
    pattern: /true|false/,
  }),
  Null: createToken({ name: "Null", pattern: /null/ }),
  EqualSign: createToken({
    name: "EqualSign",
    pattern: /=/,
  }),
  Identifier,
  Comment: createToken({
    name: "Comment",
    pattern: /; .+/,
    group: "comments",
  }),
};
const lexer = new Lexer(Object.values(tokens));

export class ShastaParser extends CstParser {
  constructor() {
    super(tokens);
    this.performSelfAnalysis();
  }
  public program = this.RULE("program", () => {
    this.MANY({ DEF: () => this.SUBRULE(this.statement) });
  });
  public statement = this.RULE("statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.assignment) },
      { ALT: () => this.SUBRULE(this.expression) },
    ]);
  });
  public expression = this.RULE("expression", () => {
    // this.OPTION({ DEF: () => this.CONSUME(tokens.FnModifier)})
    this.OR([
      { ALT: () => this.SUBRULE(this.fnApplication) },
      { ALT: () => this.SUBRULE(this.fnDefinition) },
      { ALT: () => this.SUBRULE(this.ifExpression) },
      { ALT: () => this.SUBRULE(this.propertyAccess) },
      { ALT: () => this.SUBRULE(this.array) },
      { ALT: () => this.CONSUME(tokens.NumberLiteral) },
      { ALT: () => this.CONSUME(tokens.StringLiteral) },
      { ALT: () => this.CONSUME(tokens.BooleanLiteral) },
      { ALT: () => this.CONSUME(tokens.Null) },
    ]);
  });
  public fnApplication = this.RULE("fnApply", () => {
    this.CONSUME(tokens.LParen);
    this.SUBRULE(this.expression);
    this.MANY({ DEF: () => this.SUBRULE2(this.expression) });
    this.CONSUME(tokens.RParen);
  });
  public fnDefinition = this.RULE("fnDefinition", () => {
    this.CONSUME(tokens.LCurly);
    this.OPTION({
      DEF: () =>
        this.OR([
          { ALT: () => this.CONSUME(tokens.Arity) },
          {
            ALT: () => {
              this.CONSUME(tokens.Pipe);
              this.AT_LEAST_ONE({ DEF: () => this.CONSUME(tokens.Identifier) });
              this.CONSUME2(tokens.Pipe);
            },
          },
        ]),
    });
    this.AT_LEAST_ONE2({ DEF: () => this.SUBRULE(this.statement) });
    this.CONSUME(tokens.RCurly);
  });
  public assignment = this.RULE("assignment", () => {
    this.CONSUME(tokens.Identifier);
    this.CONSUME(tokens.EqualSign);
    this.SUBRULE(this.expression);
  });
  public ifExpression = this.RULE("ifExpression", () => {
    this.CONSUME(tokens.LParen);
    this.CONSUME(tokens.If);
    this.SUBRULE(this.expression);
    this.OPTION({ DEF: () => this.CONSUME(tokens.Then) });
    this.SUBRULE2(this.expression);
    this.MANY({
      DEF: () => {
        this.CONSUME(tokens.Else);
        this.CONSUME2(tokens.If);
        this.SUBRULE3(this.expression);
        this.OPTION3({ DEF: () => this.CONSUME2(tokens.Then) });
        this.SUBRULE4(this.expression);
      },
    });
    this.CONSUME2(tokens.Else);
    this.SUBRULE5(this.expression);
    this.CONSUME(tokens.RParen);
  });
  // TODO change rule name
  public propertyAccess = this.RULE("propertyAccess", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.Period,
      DEF: () => this.CONSUME(tokens.Identifier),
    });
  });
  public array = this.RULE("array", () => {
    this.CONSUME(tokens.LBracket);
    this.MANY_SEP({
      SEP: tokens.Comma,
      DEF: () => this.OPTION({ DEF: () => this.SUBRULE(this.expression) }),
    });
    this.CONSUME(tokens.RBracket);
  });
}

export const parser = new ShastaParser();

export const productions = parser.getGAstProductions();

export function parse(source: string) {
  const lexResult = lexer.tokenize(source);
  parser.input = lexResult.tokens;
  const cst = parser.program();
  return {
    cst,
    lexErrors: lexResult.errors,
    parseErrors: parser.errors,
  };
}
