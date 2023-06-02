import { readdir, readFile } from "fs/promises";
import { resolve } from "path";
import { compile } from "../src/compiler/compile";
import { exit } from "process";

const testDir = resolve(__dirname, "../test");

async function runTests() {
  const paths = await readdir(testDir);
  paths.unshift("../src/lib/standard.shasta");
  const files = await Promise.all(
    paths.map(
      async (path) =>
        [path, await readFile(resolve(testDir, path), "utf8")] as const
    )
  );
  let exitCode = 0;
  for (const [path, file] of files) {
    try {
      compile(file);
      console.log("✅ Test passed:", path);
    } catch (e) {
      console.error("❌ Test failed:", path);
      // console.log(file);
      console.error(e);
      exitCode = 1;
    }
  }
  exit(exitCode);
}

runTests();
