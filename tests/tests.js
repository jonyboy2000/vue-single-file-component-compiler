const fs = require("fs"),
    path = require("path"),
    jsdom = require("jsdom"),
    vueSingleFileComponentCompiler = require("../index"),
    mockDocument = require("./mockDocument");

document = mockDocument.document;

function compileOfBasicDotVue_ReturnsAValidCommonJsFile() {
    // arrange
    try { fs.unlinkSync(path.resolve("./cases/basic.vue.js")); }
    catch (err) { } // ignored
    let basicDotVueFile = path.resolve("./cases/basic.vue");

    // act
    let compiledComponentFilename = (new vueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile();
    let loadedComponent = require(compiledComponentFilename);

    // assert
    console.assert(compiledComponentFilename.match(/\.js$/), "compiledComponentFilename should end in .js");
    console.assert(fs.existsSync(compiledComponentFilename), "compiledComponentFilename should exist");
    console.assert(typeof (loadedComponent.data) === "function", "loadedComponent should be a function");
    console.assert(loadedComponent.data().greeting === "Hello", "Component greeting should be hello");
    console.assert(loadedComponent.template === "<p>{{ greeting }} World!</p>", "Template does not match expected");
}

function compileOfBasicDotVue_WithCachingEnabledReturnsNewlyCachedFile() {
    // arrange
    let basicDotVueFile = path.resolve("./cases/basic.vue");
    let basicDocVueDotJsFile = basicDotVueFile + ".js";
    fs.writeFileSync(basicDocVueDotJsFile, "passed"); // newly created cached file with the content "passed"

    // act
    let compiledComponentFilename = (new vueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile();
    let compiledComponentContent = fs.readFileSync(compiledComponentFilename, { encoding: "utf8" });

    // assert
    console.assert(basicDocVueDotJsFile === compiledComponentFilename, "Compiled component filename incorrect");
    console.assert(compiledComponentContent === "passed", "The content of compiled should be \"passed\"");
}

function compileOfBasicDotVue_WithCachingEnabledReturnsFreshCopyIfCachedFileIsStale() {
    // arrange
    let earlierDate = new Date(2000, 1, 1);
    let basicDotVueFile = path.resolve("./cases/basic.vue");
    let basicDocVueDotJsFile = basicDotVueFile + ".js";
    let fd = fs.openSync(basicDocVueDotJsFile, "w+");

    // act
    fs.futimesSync(fd, earlierDate, earlierDate);  // set the date of the .js file to date prior to basic.vue modified date
    fs.closeSync(fd);
    let compiledComponentFilename = (new vueSingleFileComponentCompiler({ fileName: basicDotVueFile, enableCaching: true })).compile(); // compilation should see the .js as stale and recreate the file
    
    // assert
    console.assert(fs.statSync(basicDocVueDotJsFile).mtime > earlierDate, "Compile did not create new " + basicDocVueDotJsFile);
}

function compileOfScopedDotVue_CreatesAndScopesToIdentifier() {
    // arrange
    let scopedDotVueFile = path.resolve("./cases/scoped.vue");
    let basicDocVueDotJsFile = scopedDotVueFile + ".js";

    // act
    let compiledComponentFilename = (new vueSingleFileComponentCompiler({ fileName: scopedDotVueFile, enableCaching: false })).compile();
    let loadedComponent = require(compiledComponentFilename);
    
    // assert
    let identifier = loadedComponent.template.replace(/<p (_v-[^=]+).*/ig, "$1");
    console.assert(identifier.length > 0, "The template should contain an identifier");
    console.assert(typeof(loadedComponent.mounted) === "function", "Mounted function missing");
    let mountedFunction = String(loadedComponent.mounted);
    console.assert(mountedFunction.indexOf("p[" + identifier +"]") > -1, "mountedFunction should have scoped css selector"); // has scoped css selector
    console.assert(mountedFunction.indexOf(", {container: document.querySelector('[" + identifier + "]')}") > -1, "InsertCSS options for container incorrect or missing");

}

compileOfBasicDotVue_ReturnsAValidCommonJsFile();
compileOfBasicDotVue_WithCachingEnabledReturnsNewlyCachedFile();
compileOfBasicDotVue_WithCachingEnabledReturnsFreshCopyIfCachedFileIsStale();
compileOfScopedDotVue_CreatesAndScopesToIdentifier();