export default function Link(p: { href: string; children: any; openNewPage?: boolean }) {
  const target = p.openNewPage ? '_blank' : '';
  return (
    <a
      class="underline text-sky-500 hover:text-sky-600 hover:underline-sky-500 underline-offset-3 underline-sky-500/60"
      href={p.href}
      target={target}
    >
      {p.children}
    </a>
  );
}
