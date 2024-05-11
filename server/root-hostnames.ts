const rootHostnames =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? ['hoja.localhost', 'hojaweb.localhost', 'localhost']
    : ['hoja.ar', 'hojaweb.xyz', 'a-website-builder-zequez.vercel.app'];

export { rootHostnames };
