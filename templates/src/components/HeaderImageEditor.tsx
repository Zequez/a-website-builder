import TrashCanIcon from '~icons/fa6-solid/trash-can';
import useStore from '../lib/useStore';
import { Button } from './ui';
import { useState } from 'preact/hooks';
import { TargetedEvent } from 'preact/compat';
import ThreeDots from './ui/ThreeDots';
import convertToWebp from '../lib/convertToWebp';
import uploader from '../lib/uploader';

export function HeaderImageEditor(p: { imageUrl: string; onChange: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const {
    store: { siteId, accessToken },
  } = useStore();

  async function handleFileUpload(ev: TargetedEvent<HTMLInputElement, Event>) {
    const files = ev.currentTarget.files as FileList;
    if (files.length) {
      setIsUploading(true);
      const { files: newFiles } = await convertToWebp(files[0], [300]);
      const uploadedUrls = await uploader(newFiles, siteId!, accessToken!);
      p.onChange(uploadedUrls[0]);
      setIsUploading(false);
    }
  }
  return (
    <div class="text-center">
      <div class="mb2">Imagen encabezado</div>
      {p.imageUrl ? (
        <div class="flexcc">
          <img src={p.imageUrl} class="max-w-w32 max-h16 rounded-md" />
          <Button tint="red" class="p1 ml2" customSize onClick={() => p.onChange('')}>
            <TrashCanIcon />
          </Button>
        </div>
      ) : isUploading ? (
        <div>
          Subiendo
          <ThreeDots />
        </div>
      ) : (
        <input type="file" accept={'image/*'} onChange={handleFileUpload} />
      )}
    </div>
  );
}
