import { createSignal } from "solid-js";

export const [rawCode, setRawCode] = createSignal(
  new URLSearchParams(location.search).get("c") ?? ""
);
