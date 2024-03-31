import { BuildFile } from '../types';
import { openingTagMatcher } from './filesMatcher';

export default function resolveComponentsParsingOrder(componentsFilesByName: {
  [key: string]: BuildFile;
}) {
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
