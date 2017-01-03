const path = require('path'),
    jsdom = require('jsdom'),
    vsfcCompiler = require('../index');

(function compileOfBasicDotVueReturnsAScript() {
    // arrange
    var basicDotVueFile = path.resolve('./fixtures/basic.vue');

    // act
    var result = vsfcCompiler.compile(basicDotVueFile);

    // assert

})();