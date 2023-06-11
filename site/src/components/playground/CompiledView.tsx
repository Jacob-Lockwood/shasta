import { compile } from "shasta-lang";
import { rawCode } from "./code-store";

export default function CompiledView() {
  const compiled = () => {
    try {
      return compile(rawCode());
    } catch (e) {
      return "Syntax Error!";
    }
  };
  return (
    <div class="relative w-full h-full">
      <p class="absolute top-2 left-5 opacity-75 z-10 font-mono text-md">
        compiled JavaScript
      </p>
      <pre
        class={
          "m-0 p-5 pt-10 text-sm w-full h-full leading-relaxed overflow-y-scroll whitespace-pre-line bg-white dark:bg-slate-900 bg-opacity-75 rounded-xl"
        }
      >
        <code>{compiled()}</code>
      </pre>
    </div>
  );
}
