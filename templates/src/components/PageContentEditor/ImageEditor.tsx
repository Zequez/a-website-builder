import { upload } from '@vercel/blob/client';
import { cx } from '@shared/utils';
import usePageContentEditorStore from './usePageContentEditorStore';
import { useEffect, useState } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { API_BASE_URL } from '../../lib/api-helper';
import useStore from '../../lib/useStore';
import convertToWebp from '../../lib/convertToWebp';

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
    <div
      class={cx('relative flexcc w-full rounded-md flex-grow', {
        '-mx-6': p.img.displaySize === 'extra',
      })}
    >
      <div
        class={cx('rounded-md overflow-hidden p-1 mb.5 bg-main-950 b b-black/10 shadow-sm', {
          'w-full': p.img.displaySize === 'full' || p.img.displaySize === 'extra',
          'w-1/3': p.img.displaySize === '1/3',
          'w-1/2': p.img.displaySize === '1/2',
          'w-2/3': p.img.displaySize === '2/3',
        })}
      >
        <img
          class="w-full rounded-md"
          srcset={`${p.img.url.large} 1200w, ${p.img.url.medium} 800w, ${p.img.url.small} 400w`}
          sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
          src={p.img.url.large}
          alt="Image"
        />
      </div>
      <div class="absolute right-1 top-1 rounded-md overflow-hidden">
        {displaySizes.map(([label, value]) => (
          <DisplaySizeBtn label={label} onClick={() => p.onSetDisplaySize(value)} />
        ))}
      </div>
    </div>
  );
}

function DisplaySizeBtn(p: { label: string; onClick: () => void }) {
  return (
    <button
      class="p1 bg-black/20 text-white b-r last:b-r-0 b-black/20 hover:bg-black/30"
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
      class={cx('h-40 rounded-md w-full', {
        'bg-blue-500': isDraggingOver && !isUploading,
        'bg-black/10': !isDraggingOver && !isUploading,
        'bg-red-500': isUploading,
        'bg-green-500!': isConverting,
      })}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept="image/*"
        class="h-full w-full bg-red-500 opacity-0"
        onChange={handlePickFile}
      />
    </div>
  );
}
