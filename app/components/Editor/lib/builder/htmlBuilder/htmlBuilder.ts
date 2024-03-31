import { BuildContext, BuildFile } from '../types.d';
import evalClosure, { h } from './evalClosure';
import jsxTransform, { preactToString } from './jsxTransform';
import HtmlComponent from './HtmlComponent';

const openingTagMatcher = (name: string) => new RegExp(`<(${name})`, 'g');
const closingTagMatcher = (name: string) => new RegExp(`</(${name})>`, 'g');

function resolveComponentsParsingOrder(componentsFilesByName: { [key: string]: BuildFile }) {
  const availableComponents = Object.keys(componentsFilesByName);

  function extractComponentDependencies(content: string) {
    return availableComponents.filter((name) => content.match(openingTagMatcher(name)));
  }

  const componentsDependencies: { [key: string]: string[] } = {};

  for (let name in componentsFilesByName) {
    componentsDependencies[name] = extractComponentDependencies(
      componentsFilesByName[name].content,
    );
  }

  const componentsParsingOrder: string[] = [];
  function extractNoDepsLeft() {
    for (let componentName in componentsDependencies) {
      if (componentsDependencies[componentName].length === 0) {
        componentsParsingOrder.push(componentName);
        delete componentsDependencies[componentName];
      }
    }
  }
  function removeDeps() {
    for (let componentName in componentsDependencies) {
      componentsDependencies[componentName] = componentsDependencies[componentName].filter(
        (dep) => !componentsParsingOrder.includes(dep),
      );
    }
  }
  let rounds = 0;
  do {
    extractNoDepsLeft();
    removeDeps();
    extractNoDepsLeft();
    rounds++;
  } while (Object.keys(componentsDependencies).length > 0 || rounds > 5);

  if (Object.keys(componentsDependencies).length > 0) {
    throw `Could not resolve dependecies; maybe there is a circular dependecy?\n
          ${Object.entries(componentsDependencies)
            .map(([name, deps]) => `- ${name} <- ${deps.join(', ')}`)
            .join('\n')}
        `;
  }

  return componentsParsingOrder;
}

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

const MATCH_COMPONENTS_FILES = /^components\/(.*)\.jsx$/;
const MATCH_BASIC_PAGES = /^pages\/(.*)\.(html|jsx|tsx)$/;

function matchFiles(matcher: RegExp, files: BuildFile[]) {
  const filesByName: { [key: string]: BuildFile } = {};
  files.forEach((file) => {
    const m = file.name.match(matcher);
    if (m) {
      filesByName[m[1]] = file;
    }
  });
  return filesByName;
}

const matchComponents = matchFiles.bind(null, MATCH_COMPONENTS_FILES);
const matchBasicPages = matchFiles.bind(null, MATCH_BASIC_PAGES);

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
      pagePreactElement.type === 'html' || pagePreactElement.type === components.Html;
    const finalElement = !rootIsHtml
      ? h(components.Html, { children: pagePreactElement })
      : pagePreactElement;
    const rendered = addDoctype(preactToString(finalElement));
    context.files.push({ name: pageName, content: rendered });
  }

  Object.entries(matchBasicPages(context.files)).forEach(([name, file]) => {
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
