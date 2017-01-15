module.exports = {
    data: function () {
      return {
        greeting: "Hello"
      };
    }
  };

module.exports.template = "<p _v-HyfxIg3_Ll=\"\">{{ greeting }} World!</p>";

var insertCss = require('insert-css-scoped');
var originalOnExports = typeof(module.exports.mounted) === "function" ? module.exports.mounted : () => {};
module.exports.mounted = () => {
	insertCss("p[_v-HyfxIg3_Ll] {\n  font-size: 2em;\n  text-align: center;\n}", {container: document.querySelector('[_v-HyfxIg3_Ll]')});
	originalOnExports();
};
