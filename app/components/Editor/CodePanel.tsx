import { EditorFile, Site } from './types';

export default function CodePanel({
  site,
  file,
  onChange,
}: {
  site: Site | null;
  file: EditorFile | null;
  onChange: (content: string) => void;
}) {
  {
    return file ? (
      <textarea
        class={'flex-grow p-4 bg-gray-700 text-white font-mono'}
        value={file.content}
        onChange={({ currentTarget }) => onChange(currentTarget.value)}
      ></textarea>
    ) : (
      <div class="flex flex-grow items-center justify-center text-2xl text-gray-200 opacity-50">
        {site ? 'No file open' : 'No site selected'}
      </div>
    );
  }
}
