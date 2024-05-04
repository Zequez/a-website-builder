const configDefault: Config = {
  title: 'Your Website',
  subdomain: 'your-website',
  domain: 'hoja.ar',
  description: 'This is my website',
  themeColor: 'hsl(90, 50%, 50%)',
  foo: true,
  pages: [
    {
      uuid: 'a',
      title: 'Inicio',
      icon: '🏠',
      path: '/',
      onNav: true,
      content: '#Hello there\nPotato',
    },
    {
      uuid: 'b',
      title: 'Sobre mí',
      icon: '👤',
      path: '/sobre-mi',
      onNav: true,
      content: '#Hello there\nPotato',
    },
    {
      uuid: 'c',
      title: 'Dónde estoy',
      icon: '🌎',
      path: '/donde-estoy',
      onNav: true,
      content: '#Hello foo\nBar',
    },
    {
      uuid: 'd',
      title: 'Consultas',
      icon: '💬',
      path: '/consultas',
      onNav: true,
      content: '#Hello foo\nBar',
    },
    {
      uuid: 'e',
      title: 'Secreto',
      icon: '🔒',
      path: '/secreto',
      onNav: false,
      content: '#Hello foo\nBar',
    },
  ],
};

export default configDefault;
