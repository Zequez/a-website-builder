import { cx } from '@shared/utils';

export default function ImageRenderer(p: { img: ImageElementConfig }) {
  return (
    <div
      class={cx('relative flexcc w-full rounded-md flex-grow', {
        '-mx-6': p.img.displaySize === 'extra',
      })}
    >
      <div
        class={cx('rounded-md overflow-hidden p-1 mb.5 bg-main-950 b b-black/10 shadow-sm', {
          'w-full': p.img.displaySize === 'full' || p.img.displaySize === 'extra',
          'w-1/3': p.img.displaySize === '1/3',
          'w-1/2': p.img.displaySize === '1/2',
          'w-2/3': p.img.displaySize === '2/3',
        })}
      >
        <img
          class="w-full rounded-md"
          srcset={`${p.img.url.large} 1200w, ${p.img.url.medium} 800w, ${p.img.url.small} 400w`}
          sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
          src={p.img.url.large}
          alt="Image"
        />
      </div>
    </div>
  );
}
