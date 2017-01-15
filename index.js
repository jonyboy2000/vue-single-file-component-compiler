const fs = require("fs"),
    parse5 = require("parse5"),
    shortid = require("shortid");

module.exports = class VueCompiler {
    constructor(options) {
        console.assert(options.fileName, "options.fileName is required");

        this._fileName = options.fileName;
        this._vueContent = fs.readFileSync(this._fileName, 'utf8');
        this._enableCaching = options.enableCaching === true;
        this._compiledFileName = options.fileName + ".js";
        this._template = { identifier: "", nodeContent: {} };
        this._script = "";
        this._styles = [];
        this._templateIdentifier = "_v-" + shortid.generate();
        this._templateNode = null;
        this._scriptNode = null;
        this._styleNodes = [];
    }

    compile() {
        if (this._enableCaching) {
            if (this.isVueCachedAndFresh()) { return this._compiledFileName; }
        }

        this.parse();

        var compiled = "",
            hasScopedStyle = false;

        // script
        compiled += parse5.serialize(this._scriptNode).trim() + "\n\n";

        // template
        if (this._hasScopedStyle) {
            var firstChild = this._templateNode.content.childNodes.find((element) => { return element.nodeName !== "#text"; });
            firstChild.attrs.push({ name: this._templateIdentifier, value: "" });
        }

        var templateHTML = parse5.serialize(this._templateNode.content).trim();
        compiled += "module.exports.template = " + JSON.stringify(templateHTML) + ";\n\n";

        // styles
        for (var i = 0; i < this._styleNodes.length; i++) {
            var styleNode = this._styleNodes[i];
            if (i === 0) { 
                compiled += "var insertCss = require('insert-css');\n" +
                    "var originalOnExports = typeof(module.exports.mounted) === \"function\" ? module.exports.mounted : () => {};\n" +
                    "module.exports.mounted = () => {\n";
            }

            var isScoped = styleNode.attrs.some((currentValue, index, array) => { return currentValue.name === "scoped"; });
            compiled += "\tinsertCss(" + JSON.stringify(parse5.serialize(styleNode).trim()) + (isScoped ? ", {container: document.querySelector('[" + this._templateIdentifier + "]')}" : "") + ");\n";

            if (i === this._styleNodes.length - 1) {                 
                compiled += "\toriginalOnExports();\n" + 
                    "};\n";
            }
        }

        fs.writeFileSync(this._compiledFileName, compiled);

        return this._compiledFileName;
    }

    parse() {
        var vueContent = fs.readFileSync(this._fileName, 'utf8');
        var vueParsed = parse5.parseFragment(vueContent);

        for (var i = 0; i < vueParsed.childNodes.length; i++) {
            var node = vueParsed.childNodes[i];

            switch (node.nodeName) {
                case "template":
                    console.assert(this._templateNode === null, "Each *.vue file can contain at most one <template> block at a time.");
                    this._templateNode = node;
                    console.assert(this._templateNode.content.childNodes.find((element) => { return element.nodeName !== "#text"; }) !== null, "A template with content is required.");
                    break;
                case "script":
                    console.assert(this._scriptNode === null, "Each *.vue file can contain at most one <script> block at a time.");
                    this._scriptNode = node;
                    break;
                case "style":
                    if (!this._hasScopedStyle) {
                        this._hasScopedStyle = node.attrs.some((currentValue, index, array) => { return currentValue.name === "scoped"; });
                    }

                    this._styleNodes.push(node);
                    break;
                default:
                    continue;
            }
        }

        console.assert(this._scriptNode !== null, "A script is required.");
    }

    isVueCachedAndFresh() {
        if (fs.existsSync(this._compiledFileName)) {
            var vueStats = fs.statSync(this._fileName);
            var cachedStats = fs.statSync(this._compiledFileName);

            if (vueStats.mtime <= cachedStats.mtime) { // source is older than the cached destination - no recompile needed
                return true;
            }
        }

        return false;
    }
};
