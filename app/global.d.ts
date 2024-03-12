import * as preact from 'preact';
import { JSXInternal as JSXI } from 'preact/src/jsx';

declare module 'preact/src/jsx' {
  namespace JSXInternal {
    interface HTMLAttributes<T> extends JSXI.HTMLAttributes<T> {
      class?: any;
    }
  }
}
