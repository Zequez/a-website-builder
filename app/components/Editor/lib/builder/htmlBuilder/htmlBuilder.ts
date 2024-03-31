import { BuildContext, BuildFile } from '../types.d';
import evalClosure, { h } from './evalClosure';
import jsxTransform, { preactToString } from './jsxTransform';
import HtmlComponent from './HtmlComponent';
import { matchComponents, matchPages, openingTagMatcher, closingTagMatcher } from './filesMatcher';
import resolveComponentsParsingOrder from './resolveComponentsParsingOrder';

function injectComponents(components: string[], content: string) {
  let contentWithInjectedComponents = content;
  components.forEach((componentName) => {
    contentWithInjectedComponents = contentWithInjectedComponents.replace(
      openingTagMatcher(componentName),
      `<components.$1`,
    );
    contentWithInjectedComponents = contentWithInjectedComponents.replace(
      closingTagMatcher(componentName),
      `</components.$1>`,
    );
  });
  return contentWithInjectedComponents;
}

function addDoctype(content: string) {
  return '<!DOCTYPE html>' + content;
}

export default function htmlBuilder(context: BuildContext) {
  function removeFile(file: BuildFile) {
    context.files.splice(context.files.indexOf(file), 1);
  }

  const nsInjectComponents = (content: string) =>
    injectComponents(Object.keys(components), content);

  const componentsFiles = matchComponents(context.files);
  let componentsParsingOrder: string[];
  try {
    componentsParsingOrder = resolveComponentsParsingOrder(componentsFiles);
  } catch (e) {
    context.errors.push({ e, message: 'Could not resolve components parsing order' });
    return;
  }

  const components: { [key: string]: any } = { Html: HtmlComponent };
  const saferEval = evalClosure.bind(null, components, context.vars);
  componentsParsingOrder.forEach((name) => {
    const componentFile = componentsFiles[name];
    const content = nsInjectComponents(componentFile.content);
    try {
      const jsxCode = jsxTransform(content);
      components[name] = saferEval(jsxCode);
    } catch (e) {
      context.errors.push({
        e,
        message: `Error parsing component ${componentFile.name}`,
        file: componentFile,
      });
    }
    removeFile(componentFile);
  });

  function addPage(pageName: string, pagePreactElement: any) {
    const rootIsHtml =
      pagePreactElement &&
      (pagePreactElement.type === 'html' || pagePreactElement.type === components.Html);

    const finalElement = !rootIsHtml
      ? h(components.Html, { children: pagePreactElement })
      : pagePreactElement;
    const rendered = addDoctype(preactToString(finalElement));

    context.files.push({ name: pageName, content: rendered });
  }

  Object.entries(matchPages(context.files)).forEach(([name, file]) => {
    let content = nsInjectComponents(file.content);
    try {
      const jsxCode = jsxTransform(content);
      const probablyPreactComponent = saferEval(jsxCode);
      const result = probablyPreactComponent();
      if (Array.isArray(result)) {
        for (let pageDef of result) {
          if (typeof pageDef[0] !== 'string') {
            context.errors.push({ message: 'Page path must be a string', file });
            continue;
          }
          if (typeof pageDef[1] !== 'object') {
            context.errors.push({ message: 'Page element must be a JSX object', file });
            continue;
          }
          const pagePath = pageDef[0];
          const pagePreactElement = pageDef[1];
          const pageName = pagePath.startsWith('/')
            ? `${pagePath.slice(1)}.html`
            : `${name}/${pagePath}.html`;
          addPage(pageName, pagePreactElement);
        }
      } else {
        addPage(`${name}.html`, result);
      }
    } catch (e) {
      context.errors.push({ e, message: 'Error parsing file ', file });
    }
    removeFile(file);
  });
}
