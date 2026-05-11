import type { EffectSpec, EngineId, ParameterValues } from "@phpolygon/shader-gen-core";

export interface ExportContext {
  spec: EffectSpec;
  values: ParameterValues;
  shaderName: string;
}

export function mountExportButton(host: HTMLElement, contextProvider: () => ExportContext): void {
  host.innerHTML = "";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "shader-name";
  nameInput.placeholder = "Shader name";
  nameInput.value = "MyEffect";

  const engineSelect = document.createElement("select");
  engineSelect.className = "engine-select";
  const optUnity = document.createElement("option");
  optUnity.value = "unity-urp";
  optUnity.textContent = "Unity URP";
  engineSelect.appendChild(optUnity);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "export-btn";
  button.textContent = "Download .shader";

  const status = document.createElement("p");
  status.className = "export-status";

  button.addEventListener("click", () => {
    const ctx = contextProvider();
    const engine = engineSelect.value as EngineId;
    const emitter = ctx.spec.targets[engine];
    if (!emitter) {
      status.textContent = `No emitter for ${engine}`;
      return;
    }
    const name = nameInput.value.trim() || ctx.shaderName;
    const out = emitter({ shaderName: name, parameters: ctx.values });
    downloadText(out.filename, out.contents);
    status.textContent = `Saved ${out.filename}`;
  });

  host.appendChild(nameInput);
  host.appendChild(engineSelect);
  host.appendChild(button);
  host.appendChild(status);
}

function downloadText(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
