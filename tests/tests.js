const fs = require("fs"),
    path = require("path"),
    jsdom = require("jsdom"),
    VueSingleFileComponentCompiler = require("../index"),
    mockDocument = require("./mockDocument");

document = mockDocument.document;

(function compileOfBasicDotVue_ReturnsAValidCommonJsFile() {
    // arrange
    try { fs.unlinkSync(path.resolve("./fixtures/basic.vue.js")); }
    catch (err) { } // ignored
    var basicDotVueFile = path.resolve("./fixtures/basic.vue");

    // act
    var compiledComponentFilename = (new VueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile();
    var loadedComponent = require(compiledComponentFilename);

    // assert
    console.assert(compiledComponentFilename.match(/\.js$/)); // ends in .js
    console.assert(fs.existsSync(compiledComponentFilename)); // file exists
    console.assert(typeof (loadedComponent.data) === "function");
    console.assert(loadedComponent.data().greeting === "Hello");
    console.assert(loadedComponent.template === "<p>{{ greeting }} World!</p>");
})();

(function compileOfBasicDotVue_WithCachingEnabledReturnsNewlyCachedFile() {
    // arrange
    var basicDotVueFile = path.resolve("./fixtures/basic.vue");
    var basicDocVueDotJsFile = basicDotVueFile + ".js";
    fs.writeFileSync(basicDocVueDotJsFile, "passed"); // newly created cached file with the content "passed"

    // act
    var compiledComponentFilename = (new VueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile();
    var compiledComponentContent = fs.readFileSync(compiledComponentFilename, { encoding: "utf8" });

    // assert
    console.assert(basicDocVueDotJsFile === compiledComponentFilename);
    console.assert(compiledComponentContent === "passed");
})();

(function compileOfBasicDotVue_WithCachingEnabledReturnsFreshCopyIfCachedFileIsStale() {
    // arrange
    var earlierDate = new Date(2000, 1, 1);
    var basicDotVueFile = path.resolve("./fixtures/basic.vue");
    var basicDocVueDotJsFile = basicDotVueFile + ".js";
    var fd = fs.openSync(basicDocVueDotJsFile, "w+");

    // act
    fs.futimesSync(fd, earlierDate, earlierDate);  // set the date of the .js file to date prior to basic.vue modified date
    fs.closeSync(fd);
    var compiledComponentFilename = (new VueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile(); // compilation should see the .js as stale and recreate the file
    
    // assert
    console.assert(fs.statSync(basicDocVueDotJsFile).mtime > earlierDate);
})();