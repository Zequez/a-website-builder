import { JSX, Fragment } from 'preact';

export type FC<T> = (
  props: { children?: JSX.Element | string | typeof Fragment } & T,
) => JSX.Element;
