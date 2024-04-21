const rootHostnames = [
  'localhost',
  'hoja.ar',
  'hoja.localhost',
  'hojaweb.localhost',
  'hojaweb.xyz',
  'a-website-builder-zequez.vercel.app',
];
const allLocales = ['en', 'es'];
const defaultLocale = 'en';
const locales: { [key: string]: string } = {
  'hoja.ar': 'es',
  'hoja.localhost': 'es',
};

export { rootHostnames, locales, defaultLocale, allLocales };
