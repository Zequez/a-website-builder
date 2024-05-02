const configDefault: Config = {
  title: 'Your Website',
  foo: true,
  pages: [
    {
      title: 'Inicio',
      path: '/',
      content: '#Hello there\nPotato',
    },
    {
      title: 'Sobre mí',
      path: '/sobre-mi',
      content: '#Hello there\nPotato',
    },
    {
      title: 'Dónde estoy',
      path: '/donde-estoy',
      content: '#Hello foo\nBar',
    },
    {
      title: 'Consultas',
      path: '/consultas',
      content: '#Hello foo\nBar',
    },
  ],
};

export default configDefault;
