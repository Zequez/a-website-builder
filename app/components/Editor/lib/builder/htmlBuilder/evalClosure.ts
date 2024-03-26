import { createElement, Fragment } from 'preact';
import classnames from 'classnames';

export const h = createElement;
export { Fragment };
export const cx = classnames;

export default function (
  components: { [key: string]: any },
  data: { [key: string]: any },
  content: string,
) {
  try {
    return eval(content);
  } catch (e) {
    console.error('Code evaluation error; dumping data', e);
    console.log('Components: ', components);
    console.log('Data: ', data);
    console.log(content);
    throw e;
  }
}
