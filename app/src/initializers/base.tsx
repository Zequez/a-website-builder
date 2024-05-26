import { render } from 'preact';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import '../assets/markdown.css';

import UnhandledErrorsDisplay from '../components/UnhandledErrorsDisplay';

render(<UnhandledErrorsDisplay />, document.getElementById('unhandled-errors')!);
