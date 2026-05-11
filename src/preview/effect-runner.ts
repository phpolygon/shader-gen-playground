import {
  defaultValuesOf,
  type EffectSpec,
  type ParameterValues,
} from "@phpolygon/shader-gen-core";
import type { PreviewHandle } from "./scene.ts";
import type { ParameterPanel } from "../ui/parameter-panel.ts";
import { writeHash } from "../share/hash-sync.ts";

export interface EffectRunnerOptions {
  spec: EffectSpec;
  preview: PreviewHandle;
  panel: ParameterPanel;
  initialValues?: ParameterValues;
}

export interface EffectRunner {
  getValues: () => ParameterValues;
  getSpec: () => EffectSpec;
  dispose: () => void;
}

export function mountEffect({
  spec,
  preview,
  panel,
  initialValues,
}: EffectRunnerOptions): EffectRunner {
  let values: ParameterValues = { ...defaultValuesOf(spec.parameters), ...initialValues };

  preview.setShader(spec.preview.vertex, spec.preview.fragment, spec.toUniforms(values));
  panel.setParameters(spec.parameters, values);

  const onChange = (event: Event) => {
    const next = (event as CustomEvent<ParameterValues>).detail;
    values = next;
    preview.updateUniforms(spec.toUniforms(values));
    writeHash({ effectId: spec.id, parameters: values }, { replace: true });
  };

  panel.addEventListener("parameter-change", onChange);

  writeHash({ effectId: spec.id, parameters: values }, { replace: true });

  return {
    getValues: () => ({ ...values }),
    getSpec: () => spec,
    dispose: () => {
      panel.removeEventListener("parameter-change", onChange);
    },
  };
}
