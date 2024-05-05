import { render } from 'preact';
import App from './components/App';
import createValidator from './config-validator';
import { StoreContextWrapper } from './lib/useStore';

export default async function prerender(siteId: string, config: Config) {
  const validator = createValidator();
  if (!validator(config)) {
    console.log(validator.errors);
    return null;
  }

  const htmlPath = import.meta.env.DEV
    ? 'http://localhost:3000/templates/index.html'
    : '/templates/index.html';

  const response = await fetch(htmlPath);
  const htmlBase = await response.text();
  const renderedPages = config.pages.map((page) => toHtml(siteId, config, page.path, htmlBase));
  return renderedPages;
}

type PrerenderedPage = {
  path: string;
  content: string;
};

function toHtml(siteId: string, config: Config, path: string, htmlBase: string): PrerenderedPage {
  const div = document.createElement('div');
  render(
    <StoreContextWrapper init={{ config, siteId: null, editing: false, initialPath: path }}>
      <App />
    </StoreContextWrapper>,
    div,
  );
  const preRendered = div.innerHTML;

  render(null, div);

  const preRenderedIndex = htmlBase
    .replace('{{TITLE}}', config.title)
    .replace('{{DESCRIPTION}}', config.description)
    .replace('{{THEME_COLOR}}', config.themeColor)
    .replace('<!--{{PRE_RENDERED}}-->', preRendered)
    .replace('{{SITE_ID}}', siteId)
    .replace('{{ICON}}', '🏠')
    .replace('{{CONFIG}}', JSON.stringify(config));

  return { content: preRenderedIndex, path };
}
