# vue-single-file-component-compiler
Just-in-time compilation of single file Vue components for projects that don't require a bundler.  Useful for Electron apps and only supports plain old HTML, JS and CSS.

## Example Single File Component

``` html
// component.vue
<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
  module.exports = {
    data: function () {
      return {
        msg: 'Hello world!'
      }
    }
  }
</script>

<style scoped>
  .red {
    color: #f00;
  }
</style>
```

## Usage
Bash:
``` bash
npm install vue-single-file-component-compiler --save
```

Render Script:
``` js
var vueSingleFileComponentCompiler = require('vue-single-file-component-compiler');
var compiledVue = vueSingleFileComponentCompiler({fileName: path.resolve("component.vue"), enableCaching: true}).compile();
var component = require(compiledVue);
```

## Notes
1. Only supports native HTML, CSS and JS.
2. Caching support with enableCaching flag.  When set to true, the file will be cached to disk as filename.vue.js.  If the filename.vue file is updated with a newer modified date, the cache is invalidated and a new filename.vue.js is created.
3. Style scoping support has been added but may be buggy.
4. This project is intended for rapid development of Electron apps where a bundling step is unnecessary.
5. Please report any bugs as a Github issue.  Feedback is appreciated!

## Further Reading
https://vue-loader.vuejs.org/en/start/spec.html
