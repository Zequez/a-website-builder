import { html as preactHtml } from 'htm/preact';
import { render as preactRenderToString } from 'preact-render-to-string';
import { BuildContext, BuildFile } from '../types.d';
import evalClosure from './evalClosure';

// @ts-ignore
window.html = preactHtml;

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
      `<\$\{components.$1\}`,
    );
    contentWithInjectedComponents = contentWithInjectedComponents.replace(
      closingTagMatcher(componentName),
      `</\$\{components.$1\}>`,
    );
  });
  return contentWithInjectedComponents;
}

const MATCH_COMPONENTS_FILES = /^components\/(.*)\.jsx$/;
const MATCH_BASIC_PAGES = /^pages\/(.*)\.html$/;
const MATCH_ADVANCED_PAGES = /^pages\/(.*)\.jsx$/;

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
const matchAdvancedPages = matchFiles.bind(null, MATCH_ADVANCED_PAGES);

export default function htmlBuilder(context: BuildContext) {
  function removeFile(file: BuildFile) {
    context.files.splice(context.files.indexOf(file), 1);
  }

  const nsInjectComponents = (content: string) =>
    injectComponents(Object.keys(components), content);

  const componentsFiles = matchComponents(context.files);
  const componentsParsingOrder = resolveComponentsParsingOrder(componentsFiles);

  const components: { [key: string]: any } = {};
  const saferEval = evalClosure.bind(null, preactHtml, components, context.vars);
  componentsParsingOrder.forEach((name) => {
    const componentFile = componentsFiles[name];
    const injectedContent = nsInjectComponents(componentFile.content);
    components[name] = saferEval(injectedContent);
    removeFile(componentFile);
  });

  Object.entries(matchBasicPages(context.files)).forEach(([name, file]) => {
    const injectedContent = nsInjectComponents(file.content);
    const evalString = `html\`${injectedContent}\``;
    const preactProplessComponent = saferEval(evalString);
    const rendered = `<!DOCTYPE html>` + preactRenderToString(preactProplessComponent);
    context.files.push({ name: `${name}.html`, content: rendered });
    removeFile(file);
  });

  Object.entries(matchAdvancedPages(context.files)).forEach(([name, file]) => {
    if (file.content.startsWith('function pages()')) {
      const injectedContent = nsInjectComponents(file.content);
      const pagesFunction = saferEval(`(${injectedContent})`);
      const pages = pagesFunction();
      for (let [pagePath, pagePreactElement] of pages) {
        const rendered = `<!DOCTYPE html>` + preactRenderToString(pagePreactElement);
        const pageName = pagePath.startsWith('/') ? `${pagePath}.html` : `${name}/${pagePath}.html`;
        context.files.push({ name: pageName, content: rendered });
      }
    }
    removeFile(file);
  });
}
