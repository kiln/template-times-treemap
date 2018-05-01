var nodeResolve = require("rollup-plugin-node-resolve"),
    commonjs = require("rollup-plugin-commonjs"),
    babel = require('rollup-plugin-babel'),
    uglify = require("rollup-plugin-uglify");

export default {
  input: "src/index.js",
  output:  {
    file: "template.js",
    name: "template",
    sourcemap: true,
    format: "iife"
  },
  plugins: [
    babel(),
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    uglify()
  ]
};
