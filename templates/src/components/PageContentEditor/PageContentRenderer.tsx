import ImageRenderer from './elements/ImageRenderer';
import TextRenderer from './elements/TextRenderer';

export default function PageContentRenderer(p: { elements: PageElementConfig[] }) {
  return p.elements.length ? (
    <div class="py4 space-y-2 max-w-full break-words">
      {p.elements.map((pageEl) =>
        pageEl.type === 'Text' ? (
          <TextRenderer key={pageEl.uuid} el={pageEl} />
        ) : (
          <ImageRenderer key={pageEl.uuid} img={pageEl} />
        ),
      )}
    </div>
  ) : (
    <div class="py4"></div>
  );
}
