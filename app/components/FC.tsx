import { JSX } from 'preact';

export type FC<T> = (props: { children?: JSX.Element | string } & T) => JSX.Element;
