import babel from '@rollup/plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import pkg from './package.json';
// rollup.config.js
export default {
    input: 'src/index.js',
    output: {
      file: 'dist/js-web-uploader.js',
      name:'JSWebUploader',
      format: 'umd'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  };