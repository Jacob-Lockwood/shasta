import { readdir, readFile } from "fs/promises";
import { resolve } from "path";
import { compile } from "../src/compiler/compile";

const testDir = resolve(__dirname, "../test");

async function runTests() {
  const paths = await readdir(testDir);
  const files = await Promise.all(
    paths.map(
      async (path) =>
        [path, await readFile(resolve(testDir, path), "utf8")] as const
    )
  );
  for (const [path, file] of files) {
    try {
      compile(file);
      console.log("✅ Test passed:", path);
    } catch (e) {
      console.log("❌ Test failed:", file);
      console.log(e);
    }
  }
}

runTests();
