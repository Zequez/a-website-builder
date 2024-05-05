import { useEffect, useState } from 'preact/hooks';

export default function Loading() {
  return (
    <div class="text-xl tracking-wider font-light ">
      Cargando
      <ThreeDots />
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
