const fs = require('fs'),
    vueLoader = require('vue-loader')

module.exports.compile = (file, _options = {}) => {
    var content = fs.readFileSync(file, 'utf8');

    // mock webpack features
    cacheable = () => {};
    options = _options;
    resourcePath = file;

    var result = vueLoader(content);

    return eval(result);
}
