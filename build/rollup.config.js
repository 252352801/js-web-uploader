import babel from '@rollup/plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import babelrc from 'babelrc-rollup';
//import pkg from './package.json';
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
      babel({babelHelpers:'runtime',plugins:['@babel/plugin-transform-runtime']})
    ]
  };