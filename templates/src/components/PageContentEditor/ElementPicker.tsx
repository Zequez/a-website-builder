import FontIcon from '~icons/fa6-solid/font';
import ImageIcon from '~icons/fa6-solid/image';
import usePageContentEditorStore from './usePageContentEditorStore';

export default function ElementPicker(p: {}) {
  const {
    actions: { addElement },
  } = usePageContentEditorStore();
  return (
    <div class="flex space-x-2">
      <ElementPickerButton icon={<FontIcon />} onClick={() => addElement('Text')}>
        Texto
      </ElementPickerButton>
      <ElementPickerButton icon={<ImageIcon />} onClick={() => addElement('Image')}>
        Imagen
      </ElementPickerButton>
    </div>
  );
}

function ElementPickerButton(p: { children: any; icon: any; onClick: () => void }) {
  return (
    <button
      onClick={p.onClick}
      class="group bg-white/50 b b-black/10 b-t-black/5 rounded-md h-20 w1/3 flexcc text-2xl font-light tracking-wider text-black/40 hover:bg-white/80 transition-colors shadow-sm"
    >
      <div class="flexcc flex-col group-hover:scale-110 transition-transform">
        <div class="w-12 h-8 flexcc">{p.icon}</div>
        <div class="text-lg">{p.children}</div>
      </div>
    </button>
  );
}
