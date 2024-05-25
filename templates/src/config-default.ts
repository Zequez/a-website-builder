const configDefault: Config = {
  version: 1,
  title: 'Título',
  header: {
    imageUrl: '',
  },
  subdomain: 'your-website',
  domain: 'hoja.ar',
  description: 'Esto es un sitio web',
  theme: {
    hue: 0,
    saturation: 50,
    lightness: 50,
    pattern: 'noise',
    patternIntensity: 10,
  },
  icon: {
    type: 'emoji',
    value: '👋',
  },
  pages: [
    {
      version: 1,
      uuid: crypto.randomUUID(),
      title: 'Inicio',
      path: '/',
      icon: '🏠',
      onNav: true,
      elements: [
        {
          version: 1,
          uuid: crypto.randomUUID(),
          type: 'Text',
          value: '# Hola',
          compiledValue: '<h1>Hola</h1>',
          boxColor: 'none',
        },
      ],
    },
    {
      version: 1,
      uuid: crypto.randomUUID(),
      title: 'Otra página',
      path: '/otra-pagina',
      icon: '🌼',
      onNav: true,
      elements: [
        {
          version: 1,
          uuid: crypto.randomUUID(),
          type: 'Text',
          value: '# Otra página',
          compiledValue: '<h1>Otra página</h1>',
          boxColor: 'none',
        },
      ],
    },
  ],
};

export default configDefault;
