import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default [
  // Development build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/ui-components.js',
      format: 'umd',
      name: 'UIComponents',
      sourcemap: true
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ]
  },
  // Production build (minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/ui-components.min.js',
      format: 'umd',
      name: 'UIComponents',
      sourcemap: false
    },
    plugins: [
      resolve(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  }
];