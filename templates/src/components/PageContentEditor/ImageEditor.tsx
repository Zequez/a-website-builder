import { upload } from '@vercel/blob/client';
import { cx } from '@shared/utils';
import usePageContentEditorStore from './usePageContentEditorStore';
import { useEffect, useRef, useState } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { API_BASE_URL } from '../../lib/api-helper';
import useStore from '../../lib/useStore';
import { ImageElementConfig } from '../../schemas';

export default function ImageEditor(p: { element: ImageElementConfig }) {
  const {
    actions: { patchImageElement },
  } = usePageContentEditorStore();

  function handleUploadDone(url: ImageElementConfig['url']) {
    patchImageElement(p.element.uuid, {
      url,
    });
  }

  return p.element.url.medium ? (
    <ImageViewer url={p.element.url} />
  ) : (
    <ImageUploader onDone={handleUploadDone} />
  );
}

function ImageViewer(p: { url: { small: string; medium: string; large: string } }) {
  return (
    <div class="flexcc w-full">
      <img
        srcset={`${p.url.large} 1200w, ${p.url.medium} 800w, ${p.url.small} 400w`}
        sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
        src={p.url.large}
        alt="Image"
      />
    </div>
  );
}

function convertToWebp(file: File, sizes: [number, number, number], quality = 80): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const conversions: { w: number; h: number }[] = [];

      for (const size of sizes) {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions to fit into a square of the specified size
        if (width > height) {
          if (width > size) {
            height *= size / width;
            width = size;
          }
        } else {
          if (height > size) {
            width *= size / height;
            height = size;
          }
        }

        if (width !== img.width || height !== img.height) {
          conversions.push({ w: width, h: height });
        }
      }

      if (conversions.length === 0) {
        conversions.push({ w: img.width, h: img.height });
      }

      let files: File[] = [];
      for (const { w, h } of conversions) {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const newFile = await new Promise<File>((resolveToBlob, rejectToBlob) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newName = file.name.replace(/\.(jpg|png|gif|webp)$/, '.webp');
                  resolveToBlob(new File([blob], newName, { type: 'image/webp' }));
                } else {
                  console.log('No blob!');
                  reject();
                }
              },
              'image/webp',
              quality / 100,
            );
          });
          files.push(newFile);
        } catch (e) {
          console.error('Some conversion error', e);
          reject();
        }
      }

      resolve(files);
    };
    img.src = URL.createObjectURL(file);
  });
}

function ImageUploader(p: { onDone: (url: ImageElementConfig['url']) => void }) {
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
      const newFiles = await convertToWebp(files[0], [400, 800, 1200]);
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
        small: uploadedUrls[0],
        medium: uploadedUrls[1] || uploadedUrls[0],
        large: uploadedUrls[2] || uploadedUrls[1] || uploadedUrls[0],
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
