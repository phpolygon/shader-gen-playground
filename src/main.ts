import { createPreview } from "./preview/scene.ts";
import { ParameterPanel } from "./ui/parameter-panel.ts";
import { readHash, writeHash } from "./share/hash-sync.ts";

ParameterPanel.register();

const canvas = document.getElementById("preview-canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Preview canvas missing");
}

const preview = createPreview(canvas);
preview.start();

const initial = readHash();
if (initial) {
  console.info("[share] loaded state", initial);
}

window.addEventListener("hashchange", () => {
  const next = readHash();
  if (next) console.info("[share] hash changed", next);
});

void writeHash;
