import { it, describe, expect } from 'vitest';
import jsxTransform, { evalWithPreactContext, preactToString } from './jsxTransform';

describe('jsxTransform', () => {
  it('should convert simple JSX', () => {
    const content = `<div>hello</div>`;
    const result = jsxTransform(content);
    expect(result).equal(`((props) => h('div', null, "hello"))`);
    const maybeComponent = evalWithPreactContext(result!);
    expect(preactToString(maybeComponent())).toEqual('<div>hello</div>');
  });

  it('should work with plain text', () => {
    const content = 'hello';
    const result = jsxTransform(content);
    expect(result).equal(`((props) => h(Fragment, null, "hello"))`);
    const maybeComponent = evalWithPreactContext(result!);
    expect(preactToString(maybeComponent())).toEqual('hello');
  });

  it('should work with a function', () => {
    const content = `() => <div>hello</div>`;
    const result = jsxTransform(content);
    expect(result).equal(`(() => h('div', null, "hello"))`);
    const maybeComponent = evalWithPreactContext(result!);
    expect(preactToString(maybeComponent())).toEqual('<div>hello</div>');
  });

  it('should work with arrow function with arguments', () => {
    const content = `(props) => <div>{props.foo}</div>`;
    const result = jsxTransform(content);
    expect(result).equal(`((props) => h('div', null, props.foo))`);
  });

  it('should work with arrow function with deconstructing arguments', () => {
    const content = `({foo}) => <div>{foo}</div>`;
    const result = jsxTransform(content);
    expect(result).equal(`(({foo}) => h('div', null, foo))`);
  });

  it('should work with multiple elements', () => {
    const content = `<div>hello</div><div>world</div>`;
    const result = jsxTransform(content);
    expect(result).equal(
      `((props) => h(Fragment, null, h('div', null, "hello"), h('div', null, "world")))`,
    );
    const component = evalWithPreactContext(result!);
    expect(preactToString(component())).toEqual('<div>hello</div><div>world</div>');
  });

  it('should work with custom HTML components tags', () => {
    const content = `<Item name="Potato" url="/potato"/>`;
    const result = jsxTransform(content);
    expect(result).equal(`((props) => h(Item, { name: "Potato", url: "/potato",}))`);
  });

  it('should work with custom HTML components tags with dot notation', () => {
    const content = `<components.Item name="Potato" url="/potato"/>`;
    const result = jsxTransform(content);
    expect(result).equal(`((props) => h(components.Item, { name: "Potato", url: "/potato",}))`);
  });
});
