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
  private valueNodes: Record<string, HTMLElement> = {};

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
    this.valueNodes = {};
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
      if (p.description) label.title = p.description;
      row.appendChild(label);
      row.appendChild(this.buildInput(p));
      this.appendChild(row);
    }
  }

  private buildInput(p: ParameterSpec): HTMLElement {
    if (p.type === "float") {
      const wrap = document.createElement("div");
      wrap.className = "input float";
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(p.min);
      input.max = String(p.max);
      input.step = String(p.step ?? (p.max - p.min) / 100);
      input.value = String(this.values[p.name] ?? p.default);
      const valueLabel = document.createElement("span");
      valueLabel.className = "value";
      valueLabel.textContent = formatFloat(Number(input.value));
      this.valueNodes[p.name] = valueLabel;
      input.addEventListener("input", () => {
        const n = Number(input.value);
        this.values[p.name] = n;
        valueLabel.textContent = formatFloat(n);
        this.emitChange();
      });
      wrap.appendChild(input);
      wrap.appendChild(valueLabel);
      return wrap;
    }
    if (p.type === "bool") {
      const input = document.createElement("input");
      input.className = "input bool";
      input.type = "checkbox";
      input.checked = Boolean(this.values[p.name] ?? p.default);
      input.addEventListener("change", () => {
        this.values[p.name] = input.checked;
        this.emitChange();
      });
      return input;
    }
    if (p.type === "color") {
      const input = document.createElement("input");
      input.className = "input color";
      input.type = "color";
      const initial = (this.values[p.name] as [number, number, number] | undefined) ?? p.default;
      input.value = rgbToHex(initial);
      input.addEventListener("input", () => {
        this.values[p.name] = hexToRgb(input.value);
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

function formatFloat(n: number): string {
  return Number(n.toFixed(3)).toString();
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1]!, 16) / 255, parseInt(m[2]!, 16) / 255, parseInt(m[3]!, 16) / 255];
}

function rgbToHex(rgb: readonly [number, number, number]): string {
  const c = (n: number) =>
    Math.round(Math.max(0, Math.min(1, n)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${c(rgb[0])}${c(rgb[1])}${c(rgb[2])}`;
}
