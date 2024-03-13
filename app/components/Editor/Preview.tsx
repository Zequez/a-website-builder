import { useState } from 'preact/hooks';
import { generateIframeEncodedUrl } from './lib/iframeTools';
import { EditorFiles } from './types';

export default function Preview({ files, title }: { files: EditorFiles; title: string }) {
  const [ratio, setRatio] = useState(16 / 9);
  const [width, setWidth] = useState(360);
  const bucketHasIndex = !!files['index.html'];
  const iframeEncodedUrl = bucketHasIndex ? generateIframeEncodedUrl(files) : '';

  return bucketHasIndex ? (
    <div class="fixed bottom-2 right-2 bg-gray-200 rounded-t-md" style={{ width }}>
      <div class="px-2 py-1 flex text-gray-500">
        <div>Preview</div>
        <div class="flex-grow text-center">{title}</div>
        <div>100%</div>
      </div>
      <iframe
        class="bg-white"
        src={iframeEncodedUrl}
        style={{ width: '100%', height: width * ratio }}
      ></iframe>
    </div>
  ) : null;
}
