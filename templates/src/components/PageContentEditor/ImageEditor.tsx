import UploadIcon from '~icons/fa6-solid/upload';
import { upload } from '@vercel/blob/client';
import { cx } from '@shared/utils';
import usePageContentEditorStore from './usePageContentEditorStore';
import { useEffect, useState } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { API_BASE_URL } from '../../lib/api-helper';
import useStore from '../../lib/useStore';
import convertToWebp from '../../lib/convertToWebp';
import ImageRenderer from './ImageRenderer';
import ThreeDots from '../ui/ThreeDots';

export default function ImageEditor(p: { element: ImageElementConfig }) {
  const {
    actions: { patchImageElement },
  } = usePageContentEditorStore();

  function handleUploadDone(partialConfig: Pick<ImageElementConfig, 'url' | 'originalSize'>) {
    patchImageElement(p.element.uuid, {
      ...partialConfig,
      displaySize: 'original',
    });
  }

  function handleChangeDisplaySize(newDisplaySize: ImageElementConfig['displaySize']) {
    patchImageElement(p.element.uuid, {
      displaySize: newDisplaySize,
    });
  }

  return p.element.url.medium ? (
    <ImageViewer img={p.element} onSetDisplaySize={handleChangeDisplaySize} />
  ) : (
    <ImageUploader onDone={handleUploadDone} />
  );
}

function ImageViewer(p: {
  img: ImageElementConfig;
  onSetDisplaySize: (size: ImageElementConfig['displaySize']) => void;
}) {
  const displaySizes: [string, ImageElementConfig['displaySize']][] = [
    ['Default', 'original'],
    ['1/3', '1/3'],
    ['1/2', '1/2'],
    ['2/3', '2/3'],
    ['100%', 'full'],
    ['110%', 'extra'],
  ];

  return (
    <div class="relative w-full flexcc flex-grow">
      <ImageRenderer img={p.img} />
      <div class="absolute right-1 top-1 rounded-md overflow-hidden">
        {displaySizes.map(([label, value]) => (
          <DisplaySizeBtn
            label={label}
            onClick={() => p.onSetDisplaySize(value)}
            active={p.img.displaySize === value}
          />
        ))}
      </div>
    </div>
  );
}

function DisplaySizeBtn(p: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      class={cx('p1 bg-black/20 text-white b-r last:b-r-0 b-black/20 hover:bg-black/30', {
        'bg-black/30': p.active,
      })}
      onClick={p.onClick}
    >
      {p.label}
    </button>
  );
}

function ImageUploader(p: {
  onDone: (url: Pick<ImageElementConfig, 'url' | 'originalSize'>) => void;
}) {
  const {
    store: { accessToken, siteId },
  } = useStore();

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  async function handlePickFile(ev: TargetedEvent<HTMLInputElement, Event>) {
    setIsDraggingOver(false);
    const files = ev.currentTarget.files as FileList;
    if (files.length) {
      setIsConverting(true);
      const { files: newFiles, originalSize } = await convertToWebp(files[0], [400, 800, 1200]);
      setIsConverting(false);
      setIsUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of newFiles) {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: API_BASE_URL + 'pipe/handleUpload',
          clientPayload: JSON.stringify({
            token: accessToken,
            siteId,
          }),
        });
        uploadedUrls.push(blob.url);
      }
      setIsUploading(false);

      p.onDone({
        url: {
          small: uploadedUrls[0],
          medium: uploadedUrls[1] || uploadedUrls[0],
          large: uploadedUrls[2] || uploadedUrls[1] || uploadedUrls[0],
        },
        originalSize,
      });
    }
  }

  useEffect(() => {
    if (isDraggingOver) {
      function windowDragOver() {
        setIsDraggingOver(false);
      }
      document.body.addEventListener('dragover', windowDragOver);
      return () => document.body.removeEventListener('dragover', windowDragOver);
    }
  }, [isDraggingOver]);

  function handleDragOver(ev: DragEvent) {
    ev.stopPropagation();
    if (isDraggingOver) return;
    setIsDraggingOver(true);
  }

  return (
    <div
      class={cx('h-40 rounded-md w-full relative shadow-sm shadow-inset', {
        'bg-main-800': isDraggingOver,
        'bg-black/10': !isDraggingOver,
      })}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="image/*"
        class="h-full w-full bg-red-500 opacity-0 cursor-pointer"
        onChange={handlePickFile}
      />
      {!isUploading ? (
        <div class="w-full h-full absolute top-0 left-0 flexcc flex-col text-black/30 pointer-events-none">
          <UploadIcon class="text-5xl mb-2" />
          <div>Seleccionar archivo</div>
        </div>
      ) : null}
      {isUploading || isConverting ? (
        <div class="w-full h-full absolute top-0 left-0 flexcc flex-col text-black/30 pointer-events-none">
          <div>
            Subiendo
            <ThreeDots />
          </div>
        </div>
      ) : null}
    </div>
  );
}
