import { stdin } from "node:process";
import { readFileSync } from "node:fs";
import { compile } from "./compiler/compile";

const file = readFileSync(stdin.fd, "utf8");
const lib = readFileSync(
  new URL("../src/lib/standard.shasta", import.meta.url),
  "utf8"
);

try {
  const compiled = compile(lib + file);
  console.log(compiled);
} catch (e) {
  console.error("Panic: Kablooey!", e);
}
