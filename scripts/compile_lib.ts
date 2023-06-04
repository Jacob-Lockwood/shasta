import { compile } from "../src/compiler/compile";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const libDir = resolve(__dirname, "../src/lib");
const outDir = resolve(__dirname, "../dist/lib");
const paths = readdir(libDir);
const sources = paths.then((arr) =>
  Promise.all(
    arr.map(
      async (path) =>
        [path, await readFile(resolve(libDir, path), "utf8")] as const
    )
  )
);
sources
  .then((arr) =>
    arr.map(([path, source]) =>
      writeFile(
        resolve(outDir, path.replace(".shasta", ".js")),
        compile(source),
        "utf8"
      )
    )
  )
  .catch(() => console.error("Could not compile lib - Panic: Kablooey!"));
