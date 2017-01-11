const fs = require("fs"),
    path = require("path"),
    jsdom = require("jsdom"),
    vsfcCompiler = require("../index"),
    mockDocument = require("./mockDocument");

document = mockDocument.document;

(function compileOfBasicDotVue_ReturnsAValidCommonJsFile() {
    // arrange
    try { fs.unlinkSync(path.resolve("./fixtures/basic.vue.js")); }
    catch (err) { } // ignored
    var basicDotVueFile = path.resolve("./fixtures/basic.vue");

    // act
    var compiledComponentFilename = vsfcCompiler.compile({ fileName: basicDotVueFile, enableCaching: true });
    var loadedComponent = require(compiledComponentFilename);

    // assert
    console.assert(compiledComponentFilename.match(/\.js$/)); // ends in .js
    console.assert(fs.existsSync(compiledComponentFilename)); // file exists
    console.assert(typeof (loadedComponent.data) === "function");
    console.assert(loadedComponent.data().greeting === "Hello");
    console.assert(loadedComponent.template === "<p>{{ greeting }} World!</p>");
})();

(function compileOfBasicDotVue_WithCachingEnabledReturnsExistingCachedFile() {
    // arrange
    var expectedComponentFilename = path.resolve("./fixtures/basic.vue.js");
    fs.writeFileSync(expectedComponentFilename, "passed");
    var basicDotVueFile = path.resolve("./fixtures/basic.vue");

    // act
    var compiledComponentFilename = vsfcCompiler.compile({ fileName: basicDotVueFile, enableCaching: true });
    var compiledComponentContent = fs.readFileSync(compiledComponentFilename, {encoding: "utf8"});

    // assert
    console.assert(expectedComponentFilename === compiledComponentFilename);
    console.assert(compiledComponentContent === "passed");
})();