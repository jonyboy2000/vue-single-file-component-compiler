const fs = require("fs"),
    parse5 = require("parse5"),
    shortid = require("shortid"),
    css = require("css");

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

        let compiled = "",
            hasScopedStyle = false;

        // script
        compiled += parse5.serialize(this._scriptNode).trim() + "\n\n";

        // template
        if (this._hasScopedStyle) {
            this._templateRoot.attrs.push({ name: this._templateIdentifier, value: "" });
        }

        let templateHTML = parse5.serialize(this._templateNode.content).trim();
        compiled += "module.exports.template = " + JSON.stringify(templateHTML) + ";\n\n";

        // styles
        for (let i = 0; i < this._styleNodes.length; i++) {
            let styleNode = this._styleNodes[i];
            if (i === 0) {
                compiled += "var insertCss = require('insert-css');\n" +
                    "var originalOnExports = typeof(module.exports.mounted) === \"function\" ? module.exports.mounted : () => {};\n" +
                    "module.exports.mounted = () => {\n";
            }

            let isScoped = styleNode.attrs.some((currentValue, index, array) => { return currentValue.name === "scoped"; });

            if (isScoped) {
                let ast = css.parse(parse5.serialize(styleNode).trim());
                ast.stylesheet.rules = this.getRulesAsScoped(ast.stylesheet.rules, this._templateRoot, this._templateIdentifier);
                let scopedCss = css.stringify(ast);
                compiled += "\tinsertCss(" + JSON.stringify(scopedCss) + ", {container: document.querySelector('[" + this._templateIdentifier + "]')});\n";
            }
            else {
                compiled += "\tinsertCss(" + JSON.stringify(parse5.serialize(styleNode).trim()) + ");\n";
            }

            if (i === this._styleNodes.length - 1) {
                compiled += "\toriginalOnExports();\n" +
                    "};\n";
            }
        }

        fs.writeFileSync(this._compiledFileName, compiled);

        return this._compiledFileName;
    }

    parse() {
        let vueContent = fs.readFileSync(this._fileName, 'utf8');
        let vueParsed = parse5.parseFragment(vueContent);

        for (let i = 0; i < vueParsed.childNodes.length; i++) {
            let node = vueParsed.childNodes[i];

            switch (node.nodeName) {
                case "template":
                    console.assert(this._templateNode === null, "Each *.vue file can contain at most one <template> block at a time.");
                    this._templateNode = node;
                    this._templateRoot = node.content.childNodes.find((element) => { return element.nodeName !== "#text"; });
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

    getRulesAsScoped(rules, root, rootIdentifier) {
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].type === "media") { scopedCss += this.getScopedCss(rules[i].rules, root, rootIdentifier); }

            for (let j = 0; j < rules[i].selectors.length; j++) {
                let shouldBeModified = new RegExp("^" + root.nodeName + "[:|\s|\..|\[]?.*$", "ig");

                if (rules[i].selectors[j].match(shouldBeModified)) {
                    let alreadyHasAttributeSelector = new RegExp("^" + root.nodeName + "\\[", "ig");

                    if (!rules[i].selectors[j].match(alreadyHasAttributeSelector)) {
                        let re = new RegExp("^" + root.nodeName + "(.*$)", "ig");
                        rules[i].selectors[j] = rules[i].selectors[j].replace(re, root.nodeName + "[" + rootIdentifier + "]" + "$1");
                    }
                    else {
                        let re = new RegExp("^" + root.nodeName + "\\[([^\]]+)\\](.*$)", "ig");
                        rules[i].selectors[j] = rules[i].selectors[j].replace(re, root.nodeName + "[$1, " + rootIdentifier + "]$2");
                    }
                }
            }
        }

        return rules;
    }

    isVueCachedAndFresh() {
        if (fs.existsSync(this._compiledFileName)) {
            let vueStats = fs.statSync(this._fileName);
            let cachedStats = fs.statSync(this._compiledFileName);

            if (vueStats.mtime <= cachedStats.mtime) { // source is older than the cached destination - no recompile needed
                return true;
            }
        }

        return false;
    }
};
