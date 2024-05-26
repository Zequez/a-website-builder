import App from './components/App';
import { StoreContextWrapper } from './lib/useEditorStore';
import { render } from 'preact-render-to-string';

export default function publicRender(
  siteId: string,
  config: Config,
  path: string,
  htmlBase: string,
) {
  const preRendered = render(
    <StoreContextWrapper init={{ config, siteId, editing: false, initialPath: path }}>
      <App />
    </StoreContextWrapper>,
  );

  const preRenderedIndex = htmlBase
    .replace('{{TITLE}}', config.title)
    .replace('{{DESCRIPTION}}', config.description)
    .replace('{{THEME_COLOR}}', `hsl(${config.theme.hue}, ${config.theme.saturation}%, 50%)`)
    .replace('<!--{{PRE_RENDERED}}-->', preRendered)
    .replace('{{SITE_ID}}', siteId)
    .replace('{{ICON}}', config.icon.value)
    .replace('{{CONFIG}}', JSON.stringify(config));

  return preRenderedIndex;
}
