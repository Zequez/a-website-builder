export default function TextRenderer(p: { el: TextElementConfig }) {
  return <div class="prose" dangerouslySetInnerHTML={{ __html: p.el.compiledValue }}></div>;
}
