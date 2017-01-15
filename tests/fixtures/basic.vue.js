module.exports = {
    data: function () {
      return {
        greeting: "Hello"
      };
    }
  };

module.exports.template = "<p>{{ greeting }} World!</p>";

var insertCss = require('insert-css');
var originalOnExports = typeof(module.exports.mounted) === "function" ? module.exports.mounted : () => {};
module.exports.mounted = () => {
	insertCss("p {\n  font-size: 2em;\n  text-align: center;\n}");
	originalOnExports();
};
