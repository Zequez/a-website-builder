import { upload } from '@vercel/blob/client';
import { cx } from '@shared/utils';
import usePageContentEditorStore from './usePageContentEditorStore';
import { useEffect, useRef, useState } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import { API_BASE_URL } from '../../lib/api-helper';
import useStore from '../../lib/useStore';

export default function ImageEditor(p: { element: ImageElementConfig }) {
  const {
    actions: { patchImageElement },
  } = usePageContentEditorStore();

  const {
    store: { accessToken, siteId },
  } = useStore();

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handlePickFile(ev: TargetedEvent<HTMLInputElement, Event>) {
    setIsDraggingOver(false);
    console.log(ev);
    const files = ev.currentTarget.files as FileList;
    console.log(files);
    if (files.length) {
      const file = files[0];
      setIsUploading(true);
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: API_BASE_URL + 'pipe/handleUpload',
        clientPayload: JSON.stringify({
          token: accessToken,
          siteId,
        }),
      });
      setIsUploading(false);
      patchImageElement(p.element.uuid, {
        url: {
          large: blob.url,
          medium: blob.url,
          small: blob.url,
        },
      });

      console.log(blob.url);
    }
    // ev.currentTarget.files?.[0] && patchImageElement(p.element, ev.currentTarget.files[0]);
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

  return p.element.url.medium ? (
    <img src={p.element.url.medium} />
  ) : (
    <div
      class={cx('h-40 rounded-md w-full', {
        'bg-blue-500': isDraggingOver && !isUploading,
        'bg-black/10': !isDraggingOver && !isUploading,
        'bg-red-500': isUploading,
      })}
      onDragOver={handleDragOver}
      // onDrop={(e) => {
      //   e.preventDefault();
      //   console.log(e);
      // }}
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
