import { highlight } from "../../utils/highlight";
import { writeClipboard } from "@solid-primitives/clipboard";
import { rawCode, setRawCode } from "./code-store";
import { createSignal } from "solid-js";

const shared =
  "m-0 p-5 pt-10 text-sm w-full h-full border-none font-mono leading-relaxed absolute top-0 left-0 overflow-y-scroll ";
const byteCount = (s: string) => new TextEncoder().encode(s).length;
function shareLink(code: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("c", code);
  return writeClipboard(url.href);
}

export default function CodeEditor() {
  const [buttonActive, setButtonActive] = createSignal(false);
  const highlighted = () => highlight(rawCode());
  const onInput = (e: InputEvent) =>
    setRawCode((e.target as HTMLTextAreaElement).value);
  function onShare(e: MouseEvent) {
    shareLink(rawCode());
    setButtonActive(true);
    return new Promise<void>((resolve) =>
      setTimeout(() => resolve(void setButtonActive(false)), 1000)
    );
  }
  return (
    <div class="relative h-full">
      <div class="absolute w-full top-0 left-0 px-5 pt-2 opacity-75 z-20 font-mono text-md flex gap-6 overflow-scroll whitespace-nowrap ">
        <span>shasta</span>
        <span class="ml-auto">{byteCount(rawCode())} bytes</span>
        <button onClick={onShare}>
          {buttonActive() ? "Copied!" : "Copy link"}
        </button>
      </div>
      <textarea
        value={rawCode()}
        spellcheck={false}
        class={
          shared +
          "z-10 text-transparent bg-transparent caret-black dark:caret-white resize-none whitespace-nowrap"
        }
        onInput={onInput}
      />
      <pre
        class={shared + "bg-white dark:bg-slate-900 bg-opacity-75 rounded-xl"}
      >
        <code innerHTML={highlighted()} />
      </pre>
    </div>
  );
}
