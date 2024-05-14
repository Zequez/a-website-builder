export default function PageElementsRenderer(p: { elements: PageElementConfig[] }) {
  return p.elements.length ? (
    <div class="py4 space-y-2 max-w-full break-all">
      {p.elements.map((pageEl) =>
        pageEl.type === 'Text' ? (
          <div
            class="prose"
            key={pageEl.uuid}
            dangerouslySetInnerHTML={{ __html: pageEl.compiledValue }}
          ></div>
        ) : (
          <div key={pageEl.uuid}>{JSON.stringify(pageEl)}</div>
        ),
      )}
    </div>
  ) : (
    <div class="py4"></div>
  );
}
