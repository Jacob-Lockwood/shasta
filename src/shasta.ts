import { stdin } from "node:process";
import { readFileSync } from "node:fs";
import { compile } from "./compiler/compile";

const file = readFileSync(stdin.fd, "utf8");
const lib = readFileSync(
  new URL("../dist/lib/standard.js", import.meta.url),
  "utf8"
);

try {
  const compiled = lib + "\n// END LIB\n" + compile(file);
  console.log(compiled);
} catch (e) {
  console.error("Panic: Kablooey!", e);
}
