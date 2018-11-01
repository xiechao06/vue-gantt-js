import vue from 'rollup-plugin-vue'
import buble from 'rollup-plugin-buble'
import pkg from './package.json'

export default {
  input: 'src/index.js', // Path relative to package.json
  output: [
    {
      format: 'esm',
      file: pkg.module
    }, {
      name: 'Gantt',
      exports: 'named',
      format: 'cjs',
      file: pkg.main
    }
  ],
  plugins: [
    vue({
      css: true, // Dynamically inject css as a <style> tag
      compileTemplate: true // Explicitly convert template to render function
    }),
    buble({
      transforms: {
        forOf: false
      }
    }) // Transpile to ES5
  ]
}
