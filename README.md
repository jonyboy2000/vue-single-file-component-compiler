# vue-single-file-component-compiler
Just-in-time compilation of single file Vue components for projects that don't require a bundler such as Webpack or Browserify.  Useful for Electron apps and only supports plain old HTML, JS and CSS.

## Example Single File Component

``` html
// app.vue
<style>
  .red {
    color: #f00;
  }
</style>

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
```

## Usage

``` bash
npm install vue-single-file-component-compiler --save
```

``` js
var vsfcCompiler = require('vue-single-file-component-compiler')


new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})
```