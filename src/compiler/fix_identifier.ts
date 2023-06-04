export function fixIdentifier(name: string): string {
  // list of names that are not legal JavaScript identifiers
  const invalidNames = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "enum",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "get",
    "if",
    "import",
    "in",
    "instanceof",
    "let",
    "new",
    "return",
    "set",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
  ];
  if (invalidNames.includes(name)) return "$" + name;
  const invalidCharacters = {
    "*": "$star",
    "+": "$plus",
    "!": "$bang",
    "-": "$dash",
    "%": "$percent",
    "/": "$slash",
    "<": "$lt",
    ">": "$gt",
  };
  return name.replace(
    /[*+!%-/<>]/g,
    (char) => invalidCharacters[char as keyof typeof invalidCharacters]
  );
}
