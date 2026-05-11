import { fresnelRim, getEffect, type ParameterValues } from "@phpolygon/shader-gen-core";
import { createPreview } from "./preview/scene.ts";
import { mountEffect } from "./preview/effect-runner.ts";
import { ParameterPanel } from "./ui/parameter-panel.ts";
import { mountExportButton } from "./ui/export-button.ts";
import { readHash } from "./share/hash-sync.ts";

ParameterPanel.register();

const canvas = document.getElementById("preview-canvas");
const panel = document.querySelector("parameter-panel");
const exportHost = document.getElementById("export-host");

if (!(canvas instanceof HTMLCanvasElement)) throw new Error("preview-canvas missing");
if (!(panel instanceof ParameterPanel)) throw new Error("parameter-panel missing");
if (!exportHost) throw new Error("export-host missing");

const preview = createPreview(canvas);
preview.start();

const shared = readHash();
const spec = (shared && getEffect(shared.effectId)) ?? fresnelRim;
const initialValues: ParameterValues | undefined =
  shared && shared.effectId === spec.id ? shared.parameters : undefined;

const runner = mountEffect({
  spec,
  preview,
  panel,
  ...(initialValues ? { initialValues } : {}),
});

const titleEl = document.getElementById("effect-title");
const descEl = document.getElementById("effect-desc");
if (titleEl) titleEl.textContent = spec.name;
if (descEl) descEl.textContent = spec.description;

mountExportButton(exportHost, () => ({
  spec: runner.getSpec(),
  values: runner.getValues(),
  shaderName: "MyEffect",
}));
