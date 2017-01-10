require('insert-css')("p {\n  font-size: 2em;\n  text-align: center;\n}");

module.exports = {
    data: function () {
      return {
        greeting: "Hello"
      };
    }
  };

module.exports.template = "<p>{{ greeting }} World!</p>";

