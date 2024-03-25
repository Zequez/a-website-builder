import { transform } from 'sucrase';
import * as preact from 'preact';
import { render } from 'preact-render-to-string';

function tryTransform(content: string) {
  return transform(content, {
    transforms: ['typescript', 'jsx'],
    jsxPragma: 'h',
    jsxFragmentPragma: 'Fragment',
    production: true,
  }).code;
}

function removeLastSemicolon(str: string) {
  if (str.endsWith(';')) {
    return str.slice(0, -1);
  } else {
    return str;
  }
}

function wrapFun(code: string) {
  return `((props) => ${removeLastSemicolon(code)})`;
}

function wrapParentheses(code: string) {
  return `(${removeLastSemicolon(code)})`;
}

function wrapFragment(code: string) {
  return `<>${code}</>`;
}

export default function jsxTransform(jsxString: string): string {
  const str = jsxString.trim();

  try {
    if (str.startsWith('function') || str.startsWith('(')) {
      return tryTransform(wrapParentheses(str));
    } else if (str.startsWith('<')) {
      try {
        return wrapFun(tryTransform(str));
      } catch (e) {
        return wrapFun(tryTransform(wrapFragment(str)));
      }
    } else {
      return wrapFun(tryTransform(wrapFragment(str)));
    }
  } catch (e) {
    // console.error(e);
    throw e;
  }
}

export function evalWithPreactContext(code: string) {
  const h = preact.createElement;
  const Fragment = preact.Fragment;
  return eval(code);
}

export function isPreactRenderable(value: any) {
  if (typeof value.props !== 'undefined' && typeof value.div === 'undefined') {
    return true;
  } else {
    return false;
  }
}

export const preactToString = render;