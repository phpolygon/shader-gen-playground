import {
  fresnelRim,
  getEffect,
  listEffects,
  type EffectSpec,
  type ParameterValues,
} from "@phpolygon/shader-gen-core";
import { createPreview } from "./preview/scene.ts";
import { mountEffect, type EffectRunner } from "./preview/effect-runner.ts";
import { ParameterPanel } from "./ui/parameter-panel.ts";
import { mountExportButton } from "./ui/export-button.ts";
import { readHash } from "./share/hash-sync.ts";

ParameterPanel.register();

const canvas = document.getElementById("preview-canvas");
const panel = document.querySelector("parameter-panel");
const exportHost = document.getElementById("export-host");
const titleEl = document.getElementById("effect-title");
const descEl = document.getElementById("effect-desc");
const select = document.getElementById("effect-select");

if (!(canvas instanceof HTMLCanvasElement)) throw new Error("preview-canvas missing");
if (!(panel instanceof ParameterPanel)) throw new Error("parameter-panel missing");
if (!exportHost) throw new Error("export-host missing");
if (!(select instanceof HTMLSelectElement)) throw new Error("effect-select missing");

const preview = createPreview(canvas);
preview.start();

for (const e of listEffects()) {
  const opt = document.createElement("option");
  opt.value = e.id;
  opt.textContent = e.name;
  select.appendChild(opt);
}

const shared = readHash();
const initialSpec = (shared && getEffect(shared.effectId)) ?? fresnelRim;
const initialValues: ParameterValues | undefined =
  shared && shared.effectId === initialSpec.id ? shared.parameters : undefined;

let runner: EffectRunner = mountEffect({
  spec: initialSpec,
  preview,
  panel,
  ...(initialValues ? { initialValues } : {}),
});
select.value = initialSpec.id;
applyMeta(initialSpec);

select.addEventListener("change", () => {
  const next = getEffect(select.value);
  if (!next) return;
  runner.dispose();
  runner = mountEffect({ spec: next, preview, panel });
  applyMeta(next);
});

mountExportButton(exportHost, () => ({
  spec: runner.getSpec(),
  values: runner.getValues(),
  shaderName: "MyEffect",
}));

function applyMeta(spec: EffectSpec): void {
  if (titleEl) titleEl.textContent = spec.name;
  if (descEl) descEl.textContent = spec.description;
}
