export default function ModuleSelector() {
  return (
    <div class="min-h-screen flexcc flex-col">
      <h1 class="text-[120px] text-black/70 @dark:text-white/80 font-black mb8 tracking-wider">
        <a href="/">Hoja</a>
      </h1>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-screen-sm px4">
        <ModuleButton icon="⚙️" text="Administrador" href="/app/admin" />
        <ModuleButton icon="🖋" text="Editor" href="/app/editor" />
        <ModuleButton icon="👀" text="Previsualizador" href="/app/preview" />
      </div>
    </div>
  );
}

function ModuleButton(p: { icon: string; text: string; href: string }) {
  return (
    <a
      class="flexcc flex-col p4 bg-black/10 hover:bg-black/20 text-black/40 @dark:(bg-white/10 hover:bg-white/20 text-white/70) rounded-md hover:scale-105 focus:scale-105 transition-transform outline-emerald-500"
      href={p.href}
    >
      <span class="block text-4xl mb2 text-black/100">{p.icon}</span>
      <span class="block text-center text-lg font-semibold tracking-wider">{p.text}</span>
    </a>
  );
}
