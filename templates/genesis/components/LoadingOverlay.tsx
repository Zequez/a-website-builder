import { useEffect, useState } from 'preact/hooks';
import useStore from '../lib/useStore';
import ManualConfigurator from './ManualConfigurator';

export function LoadingOverlay() {
  const {
    store: { invalidConfig },
  } = useStore();

  return (
    <div class="h-screen w-screen bg-emerald-500 text-white text-xl tracking-wider font-light p-4">
      {!invalidConfig ? (
        <div>
          Cargando
          <ThreeDots />
        </div>
      ) : (
        <ManualConfigurator config={invalidConfig} />
      )}
    </div>
  );
}

function ThreeDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(
      () =>
        setDots((d) => {
          d += '.';
          return d.length > 3 ? '' : d;
        }),
      500,
    );

    return () => clearInterval(id);
  });

  return <span>{dots}</span>;
}
