import useStore from '../../lib/useEditorStore';

import HuePicker from './HuePicker';
import IntenstityPicker from './IntensityPicker';
import PatternPicker from './PatternPicker';

export default function ThemePicker() {
  const {
    store: {
      config: { theme },
    },
    actions: { setThemeVal },
  } = useStore();

  return (
    <div class="mb2 flex flex-col space-y-2">
      <HuePicker value={theme.hue} onChange={(v) => setThemeVal('hue', v)} />
      <IntenstityPicker value={theme.saturation} onChange={(v) => setThemeVal('saturation', v)} />
      <PatternPicker
        pattern={theme.pattern}
        intensity={theme.patternIntensity}
        onChangePattern={(v) => setThemeVal('pattern', v)}
        onChangeIntensity={(v) => setThemeVal('patternIntensity', v)}
      />
    </div>
  );
}
