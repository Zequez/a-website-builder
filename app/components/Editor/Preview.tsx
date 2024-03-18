import { createPortal } from 'preact/compat';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import MobileIcon from '~icons/fa6-solid/mobile';
import DesktopIcon from '~icons/fa6-solid/desktop';
import FullScreenIcon from '~icons/fa6-solid/expand';
import { generateIframeEncodedUrl } from './lib/iframeTools';
import { LocalSite } from './types';
import { cx, useLocalStorageState } from '@app/lib/utils';
import { FC } from '../FC';

const FULLSCREEN_PORTAL_EL = document.getElementById('fullscreen-preview');

export default function Preview({
  site,
  currentFileName,
}: {
  currentFileName: string | null;
  site: LocalSite;
  onSwitchPosition: () => void;
}) {
  const [mode, setMode] = useLocalStorageState<'mobile' | 'desktop' | 'fullscreen'>(
    'preferred_preview_mode',
    'desktop',
  );
  const previewSpaceRef = useRef<HTMLDivElement>(null);
  const [previewAvailableSpace, setPreviewAvailableSpace] = useState([0, 0]);
  const [desktopScale, setDesktopScale] = useState(1);
  const [mobileScale, setMobileScale] = useState(1);
  const [fullscreenScale, setFullscreenScale] = useState(1);
  const [lastEntrypointUsed, setLastEntrypointUsed] = useState<string | null>(null);

  const files = site.generatedFiles || {};
  let adjustedCurrentFileName = currentFileName;
  if (adjustedCurrentFileName?.endsWith('.njk')) {
    const htmlName = adjustedCurrentFileName.replace(/\.njk$/, '.html');
    if (files[htmlName]) {
      adjustedCurrentFileName = htmlName;
    }
  }
  const currentFile = adjustedCurrentFileName ? files[adjustedCurrentFileName] : null;

  const mobileAspectRatio = 9 / 16;
  const mobileWidth = 360;
  const mobileHeight = mobileWidth / mobileAspectRatio;

  function recalculateAutomaticScaling(el: HTMLDivElement) {
    const { width, height } = el.getBoundingClientRect();
    setPreviewAvailableSpace([width, height]);

    const scaleToAdjustWidth = width < mobileWidth ? width / mobileWidth : 1;
    const scaleToAdjustHeight = height < mobileHeight ? height / mobileHeight : 1;

    setMobileScale(Math.min(scaleToAdjustWidth, scaleToAdjustHeight));
  }

  const getEntrypointFileName = useCallback(
    function () {
      if (currentFile && currentFile.name.endsWith('.html')) {
        return currentFile.name;
      } else if (lastEntrypointUsed && site.files[lastEntrypointUsed]) {
        return lastEntrypointUsed;
      } else if (site.files['index.html']) {
        return 'index.html';
      } else {
        return null;
      }
    },
    [currentFile, lastEntrypointUsed, site],
  );

  useEffect(() => {
    setLastEntrypointUsed(getEntrypointFileName());
  }, [currentFile]);

  const recommendedEntrypoint = getEntrypointFileName();
  const iframeEncodedUrl = recommendedEntrypoint
    ? generateIframeEncodedUrl(files, recommendedEntrypoint)
    : null;

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        recalculateAutomaticScaling(entry.target as HTMLDivElement);
      }
    });

    if (previewSpaceRef.current) {
      resizeObserver.observe(previewSpaceRef.current);
      recalculateAutomaticScaling(previewSpaceRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [previewSpaceRef.current, site]);

  const [availableX, availableY] = previewAvailableSpace;

  const scale = {
    mobile: mobileScale,
    desktop: desktopScale,
    fullscreen: fullscreenScale,
  }[mode];

  const fullScreenPortalEl =
    mode === 'fullscreen' ? document.getElementById('fullscreen-preview') : null;

  const componentRender = (
    <div
      class={cx('flex flex-col items-center justify-center w-full h-full bg-gray-700', {
        'fixed z-90': fullScreenPortalEl,
      })}
    >
      <div class="h-8 flex items-center text-gray-500 bg-white/80 w-full flex-shrink-0">
        <div class="px-2">Preview</div>
        <div class="px-2 text-center flex-grow">{recommendedEntrypoint}</div>
        <div class="flex items-center h-full">
          <ViewModeButton isActive={mode === 'mobile'} onClick={() => setMode('mobile')}>
            <MobileIcon />
          </ViewModeButton>
          <ViewModeButton isActive={mode === 'desktop'} onClick={() => setMode('desktop')}>
            <DesktopIcon />
          </ViewModeButton>
          <ViewModeButton isActive={mode === 'fullscreen'} onClick={() => setMode('fullscreen')}>
            <FullScreenIcon />
          </ViewModeButton>
        </div>
        <div class="px-2 text-sm w-14 text-center">{Math.round(scale * 100)}%</div>
      </div>
      <div
        class="flex items-center justify-center flex-grow w-full overflow-hidden"
        ref={previewSpaceRef}
      >
        {availableX && availableY && iframeEncodedUrl ? (
          <iframe
            class="bg-white shadow-lg"
            src={iframeEncodedUrl}
            style={{
              transform: `scale(${scale})`,
              ...(mode === 'desktop' || mode === 'fullscreen'
                ? { width: '100%', height: '100%' }
                : { width: mobileWidth, height: mobileHeight }),
            }}
          ></iframe>
        ) : null}
      </div>
    </div>
  );

  return mode === 'fullscreen'
    ? createPortal(componentRender, FULLSCREEN_PORTAL_EL!)
    : componentRender;
}

const ViewModeButton: FC<{ isActive: boolean; onClick: () => void }> = ({
  isActive,
  onClick,
  children,
}) => (
  <button
    onClick={() => onClick()}
    class={cx('h-full py-1 px-2', {
      'bg-black/60 text-white/60': isActive,
      'hover:bg-black/20': !isActive,
    })}
  >
    {children}
  </button>
);
