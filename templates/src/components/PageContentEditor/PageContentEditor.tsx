import EyeIcon from '~icons/fa6-regular/eye';
import PenIcon from '~icons/fa6-solid/pen';
import usePageContentEditorStore, { Wrapper } from './lib/usePageContentEditorStore';
import { cx } from '@shared/utils';
import ElementPicker from './ElementPicker';
import { Button } from '../ui';
import PageElementsRenderer from './PageContentRenderer';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import EditorElementsList from './EditorElementsList';

export default function PageContentEditor(p: {
  config: PageConfig;
  onConfigChange: (newConfig: PageConfig) => void;
}) {
  return (
    <Wrapper init={p.config} onChange={p.onConfigChange}>
      <PageContentEditorBase />
    </Wrapper>
  );
}

function PageContentEditorBase() {
  const { state, computed, actions } = usePageContentEditorStore();

  useEffect(() => {
    return () => {
      actions.finishOnChangeAction();
    };
  }, []);

  return (
    <main class="relative max-w-screen-sm mx-auto bg-main-900 rounded-lg px-4 text-black/80">
      <div
        class={cx('py4', {
          hidden: computed.previewing.value,
        })}
      >
        <EditorElementsList />
        <ElementPicker />
      </div>
      {computed.previewing.value && <PageElementsRenderer elements={state.value.config.elements} />}
      <Button
        customSize
        class="absolute -right-1 -top-1 h-8 w-8"
        tint="main"
        onClick={() =>
          actions.patchState({ previewLocked: !state.value.previewLocked, previewPeeking: false })
        }
      >
        {state.value.previewLocked ? <PenIcon /> : <EyeIcon />}
      </Button>
    </main>
  );
}
