import { it, describe, expect } from 'vitest';
import htmlBuilder from '../htmlBuilder';
import { parse } from 'node-html-parser';

function createContext(files: { name: string; content: string }[], vars = {}) {
  return { files, vars, errors: [] };
}

function getBody(html: string) {
  const root = parse(html);
  return root.querySelector('body')!.innerHTML;
}

describe('CustomHtmlBuilder', () => {
  it('should add DOCTYPE, and some basic HTML tags', () => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: '<div>Hello world</div>',
      },
    ]);
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('index.html');
    expect(context.files[0].content).toMatch(/<html/);
    expect(context.files[0].content).toMatch(/^<!DOCTYPE/);
    expect(context.files[0].content).toMatch(/<body/);
    expect(context.files[0].content).toMatch(/<title/);
  });
  it.each([
    ['Hello world', 'Hello world'],
    ['<div>Hello world</div>', '<div>Hello world</div>'],
    [`<div>Hello {"123"} world</div>`, '<div>Hello 123 world</div>'],
    [`{[1,2,3].map((n) => <div>{n}</div>)}`, '<div>1</div><div>2</div><div>3</div>'],
  ])('should convert single page %s HTML to page', (content, result) => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: content,
      },
    ]);
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('index.html');
    expect(getBody(context.files[0].content)).toEqual(result);
  });

  it('should not fail with an empty string', () => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: '',
      },
    ]);
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('index.html');
    expect(getBody(context.files[0].content)).toEqual(``);
  });

  it('should be empty with a function that does not return a valid element', () => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: '() => {}',
      },
    ]);
    htmlBuilder(context);
    expect(getBody(context.files[0].content)).toEqual(``);
  });

  it('should return an error with some strange code', () => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: '() => }',
      },
    ]);
    htmlBuilder(context);
    expect(context.files.length).toEqual(0);
    expect(context.errors.length).toEqual(1);
  });

  it('should automatically inject components', () => {
    const context = createContext([
      {
        name: 'pages/index.html',
        content: '<Html title="Wololo"><span>Hello world</span></Html>',
      },
      {
        name: 'components/Html.jsx',
        content: '({title, children}) => <><title>{title}</title><div>{children}</div></>',
      },
    ]);
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('index.html');
    expect(context.files[0].content).toEqual(
      '<!DOCTYPE html><title>Wololo</title><div><span>Hello world</span></div>',
    );
  });

  it('should make variables available', () => {
    const context = createContext(
      [
        {
          name: 'pages/index.html',
          content: '<div>{data.title}</div>',
        },
      ],
      {
        title: 'Wololo',
      },
    );
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('index.html');
    expect(getBody(context.files[0].content)).toEqual('<div>Wololo</div>');
  });

  it('should convert one page to many', () => {
    const context = createContext(
      [
        {
          name: 'pages/items.jsx',
          content: '() => data.items.map(({id, name}) => [id, <div>{name}</div>])',
        },
      ],
      {
        items: [
          { id: 'one', name: '1 ONE' },
          { id: 'two', name: '2 TWO' },
          { id: 'three', name: '3 THREE' },
        ],
      },
    );
    htmlBuilder(context);
    expect(context.files.length).toEqual(3);
    expect(context.files[0].name).toEqual('items/one.html');
    expect(getBody(context.files[0].content)).toEqual('<div>1 ONE</div>');
    expect(context.files[1].name).toEqual('items/two.html');
    expect(getBody(context.files[1].content)).toEqual('<div>2 TWO</div>');
    expect(context.files[2].name).toEqual('items/three.html');
    expect(getBody(context.files[2].content)).toEqual('<div>3 THREE</div>');
  });

  it('should convert one page to many with layout components', () => {
    const context = createContext(
      [
        {
          name: 'pages/items.jsx',
          content: '() => data.items.map(({id, name}) => [id, <Html title={name}>{name}</Html>])',
        },
        {
          name: 'components/Html.jsx',
          content:
            '({title, children}) => <body><title>{title}</title><div>{children}</div></body>',
        },
      ],
      {
        items: [
          { id: 'one', name: '1 ONE' },
          { id: 'two', name: '2 TWO' },
          { id: 'three', name: '3 THREE' },
        ],
      },
    );
    htmlBuilder(context);
    expect(context.files.length).toEqual(3);
    expect(context.files[0].name).toEqual('items/one.html');
    expect(getBody(context.files[0].content)).toEqual('<title>1 ONE</title><div>1 ONE</div>');
    expect(context.files[1].name).toEqual('items/two.html');
    expect(getBody(context.files[1].content)).toEqual('<title>2 TWO</title><div>2 TWO</div>');
    expect(context.files[2].name).toEqual('items/three.html');
    expect(getBody(context.files[2].content)).toEqual('<title>3 THREE</title><div>3 THREE</div>');
  });

  it('should allow to programatically definepages', () => {
    const context = createContext([
      {
        name: 'pages/items.jsx',
        content: 'function pages() { return [["potato", <div>a</div>]] }',
      },
    ]);
    htmlBuilder(context);
    expect(context.files[0].name).toEqual('items/potato.html');
    expect(getBody(context.files[0].content)).toEqual('<div>a</div>');
  });

  describe('components', () => {
    it('should allow to import a component from another; resolving dependencies', () => {
      const context = createContext([
        {
          name: 'pages/index.html',
          content: '<Item name="Potato" url="/potato"/>',
        },
        {
          name: 'components/Item.jsx',
          content: '({name, url}) => <Link href={url}>{name}</Link>',
        },
        {
          name: 'components/Link.jsx',
          content: '({href, children}) => <a href={href}>{children}</a>',
        },
      ]);
      htmlBuilder(context);
      expect(context.files[0].name).toEqual('index.html');
      expect(getBody(context.files[0].content)).toEqual('<a href="/potato">Potato</a>');
    });
  });
});
