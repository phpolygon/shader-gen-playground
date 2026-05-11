import type { ParameterSpec, ParameterValues } from "@phpolygon/shader-gen-core";

export class ParameterPanel extends HTMLElement {
  static readonly tagName = "parameter-panel";
  static register(): void {
    if (!customElements.get(this.tagName)) {
      customElements.define(this.tagName, ParameterPanel);
    }
  }

  private params: readonly ParameterSpec[] = [];
  private values: ParameterValues = {};

  connectedCallback(): void {
    this.render();
  }

  setParameters(params: readonly ParameterSpec[], initial: ParameterValues = {}): void {
    this.params = params;
    this.values = { ...defaultValues(params), ...initial };
    this.render();
  }

  getValues(): ParameterValues {
    return { ...this.values };
  }

  private emitChange(): void {
    this.dispatchEvent(
      new CustomEvent("parameter-change", { detail: this.getValues(), bubbles: true }),
    );
  }

  private render(): void {
    if (this.params.length === 0) {
      this.innerHTML = `<p class="empty">No effect selected.</p>`;
      return;
    }
    this.innerHTML = "";
    for (const p of this.params) {
      const row = document.createElement("div");
      row.className = "row";
      const label = document.createElement("label");
      label.textContent = p.label;
      row.appendChild(label);
      row.appendChild(this.buildInput(p));
      this.appendChild(row);
    }
  }

  private buildInput(p: ParameterSpec): HTMLElement {
    if (p.type === "float") {
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(p.min);
      input.max = String(p.max);
      input.step = String(p.step ?? (p.max - p.min) / 100);
      input.value = String(this.values[p.name] ?? p.default);
      input.addEventListener("input", () => {
        this.values[p.name] = Number(input.value);
        this.emitChange();
      });
      return input;
    }
    if (p.type === "bool") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(this.values[p.name] ?? p.default);
      input.addEventListener("change", () => {
        this.values[p.name] = input.checked;
        this.emitChange();
      });
      return input;
    }
    const placeholder = document.createElement("span");
    placeholder.className = "stub";
    placeholder.textContent = `[${p.type}]`;
    return placeholder;
  }
}

function defaultValues(params: readonly ParameterSpec[]): ParameterValues {
  const out: ParameterValues = {};
  for (const p of params) {
    out[p.name] = p.default;
  }
  return out;
}
