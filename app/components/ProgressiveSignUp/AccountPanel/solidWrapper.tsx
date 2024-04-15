import { useEffect, useRef, useState } from 'preact/hooks';
import { render as solidRender } from 'solid-js/web';
import h from 'solid-js/h';

export default function solidWrapper(initialComponent: any) {
  let el: HTMLDivElement;
  let dispose = () => {};

  function render(component: any) {
    console.log(el);
    // if (!el) {
    //   debugger;
    // }
    dispose();
    dispose = solidRender(h(component, {}), el);
  }

  return {
    render,
    Component: () => {
      const ref = useRef<HTMLDivElement>(null);
      console.log('Running component');

      useEffect(() => {
        console.log('EFFECT');
        if (ref.current) {
          el = ref.current;
          render(initialComponent);
        }
      }, [ref.current]);

      return <div ref={ref}></div>;
    },
  };
}

// export default function wrapper(component: any) {
//   function remount(newComponent: any) {
//     return newComponent
//   }
//   return [remount]
// }
