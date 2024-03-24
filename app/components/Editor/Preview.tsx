import { createPortal } from 'preact/compat';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import MobileIcon from '~icons/fa6-solid/mobile';
import DesktopIcon from '~icons/fa6-solid/desktop';
import FullScreenIcon from '~icons/fa6-solid/expand';
import { generateIframeEncodedUrl } from './lib/iframeTools';
import { LocalFile, LocalSite } from './types';
import { cx, useLocalStorageState } from '@app/lib/utils';
import { FC } from '../FC';
import { keyBy } from '@shared/utils';

const FULLSCREEN_PORTAL_EL = document.getElementById('fullscreen-preview');

export default function Preview({
  site,
  buildFiles,
  currentFileId,
}: {
  currentFileId: string | null;
  site: LocalSite;
  buildFiles: { name: string; content: string }[] | null;
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

  let [currentFileName, setCurrentFileName] = useState<string | null>(null);

  const filesByName = buildFiles ? keyBy(buildFiles, 'name') : null;

  if (currentFileName && (!filesByName || !filesByName[currentFileName])) {
    currentFileName = null;
  }
  if (currentFileName === null && filesByName && Object.keys(filesByName).length > 0) {
    currentFileName = Object.keys(filesByName)[0];
  }

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

  const iframeEncodedUrl =
    buildFiles && currentFileName ? generateIframeEncodedUrl(buildFiles, currentFileName) : null;

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
        <div class="px-2 text-center flex-grow flex items-center justify-center space-x-1">
          {buildFiles
            ? buildFiles.map((file) => (
                <button
                  class={cx('text-white px-1 rounded', {
                    'bg-black/60 text-white/60': file.name === currentFileName,
                    'bg-black/20 text-white/60 hover:bg-black/20': file.name !== currentFileName,
                  })}
                  onClick={() => setCurrentFileName(file.name)}
                >
                  {file.name.replace(/\.html$/, '')}
                </button>
              ))
            : null}
        </div>
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
