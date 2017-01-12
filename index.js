const fs = require("fs"),
    parse5 = require("parse5"),
    shortid = require("shortid");

module.exports.compile = (options = {}) => {
    console.assert(options.fileName, "options.fileName is required");
    options.enableCaching = options.enableCaching || true;
    options.destinationFileName = options.fileName + ".js";

    if (options.enableCaching) {
        if (fs.existsSync(options.destinationFileName)) {
            var sourceStats = fs.statSync(options.fileName);
            var destinationStats = fs.statSync(options.destinationFileName);

            if (sourceStats.mtime <= destinationStats.mtime) { // source is older than the cached destination - no recompile needed
                return options.destinationFileName;
            }
        }
    }

    var vueContent = fs.readFileSync(options.fileName, 'utf8'),
        rootFragments = parse5.parseFragment(vueContent),
        vueObject = {
            template: {identifier: "", value: ""},
            script: "",
            styles: [],
            get rendered() {
                var returnValue = "";

                // styles
                for (var i = 0; i < this.styles.length; i++) {
                    if(i === 0) { returnValue += "var insertCss = require('insert-css');\n"; }

                    returnValue += "insertCss(" + JSON.stringify(this.styles[i].value.trim()) + ", {container: " + (this.styles[i].isScoped ? "document.querySelector('[" + this.template.identifier + "]')": "")  + "});\n";
                    
                    if (i === this.styles.length - 1) { returnValue += "\n"; }
                }

                // script
                returnValue += this.script.trim() + "\n\n";

                // template
                returnValue += "module.exports.template = " + JSON.stringify(this.template.value.trim()) + ";\n";

                return returnValue;
            }
        };

    for (var i = 0; i < rootFragments.childNodes.length; i++) {
        var node = rootFragments.childNodes[i];
        if (!(node.nodeName == "template" || node.nodeName == "script" || node.nodeName == "style")) { continue; }
        switch (node.nodeName) {
            case "template":
                console.assert(vueObject.template.value.length === 0, "Each *.vue file can contain at most one <template> block at a time.");
                var nodeIdentifier = "_v-" + shortid.generate();

                var firstChild = node.content.childNodes.find((element) => {return element.nodeName !== "#text";});
                console.assert(firstChild !== null, "Template appears to be empty.");
                firstChild.attrs.push({name: nodeIdentifier, value: ""});

                vueObject.template = {
                    identifier: nodeIdentifier,
                    value: parse5.serialize(node.content)
                };
                break;
            case "script":
                console.assert(vueObject.script.length === 0, "Each *.vue file can contain at most one <script> block at a time.");
                vueObject.script = parse5.serialize(node);
                break;
            case "style":
                var isScoped = node.attrs.some((currentValue, index, array) => { return currentValue.name === "scoped"; });
                vueObject.styles.push({isScoped: isScoped, value: parse5.serialize(node)});
                break;
        }
    }

    console.assert(vueObject.template.value.length > 0, "A template is required.");
    console.assert(vueObject.script.length > 0, "A script is required.");

    fs.writeFileSync(options.destinationFileName, vueObject.rendered);

    return options.destinationFileName;
};
