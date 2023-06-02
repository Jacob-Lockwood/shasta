import { resolve } from "path";
import { argv, cwd, exit } from "process";
import { readFile } from "fs/promises";
import { compile } from "./compiler/compile";

if (!argv[2]) {
  console.error("❌ No file provided");
  exit(1);
}
const filePath = resolve(cwd(), argv[2]);
const file = readFile(filePath, "utf8").catch(() =>
  console.error("Could not read file")
);
const compiled = file.then((str) => str && compile(str));
compiled.then(console.log).catch(() => console.error("Could not compile"));
