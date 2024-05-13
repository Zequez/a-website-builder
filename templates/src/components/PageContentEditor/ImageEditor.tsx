import usePageContentEditorStore from './usePageContentEditorStore';
import { useEffect, useRef } from 'preact/hooks';

export default function ImageEditor(p: { element: ImageElementConfig }) {
  const {
    actions: { patchImageElement },
  } = usePageContentEditorStore();

  return <div>{JSON.stringify(p.element)}</div>;
}
