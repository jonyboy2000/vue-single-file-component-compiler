var insertCss = require('insert-css');
insertCss("p {\n  font-size: 2em;\n  text-align: center;\n}", {container: document.querySelector('[_v-Syax2FEUg]')});

module.exports = {
    data: function () {
      return {
        greeting: "Hello"
      };
    }
  };

module.exports.template = "<p _v-Syax2FEUg=\"\">{{ greeting }} World!</p>";
