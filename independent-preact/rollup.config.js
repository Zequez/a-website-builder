import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'independent-preact/index.js', // Replace 'your-entry-file.js' with the path to your entry file
  output: {
    file: 'independent-preact/bundle.js', // Output file name
    format: 'es', // ESM format
  },
  plugins: [
    resolve(), // Resolve modules from node_modules
    babel({ babelHelpers: 'bundled' }), // Transpile with Babel
    terser(),
  ],
};
