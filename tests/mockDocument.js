
module.exports.document = { // mock document
    querySelector: (node) => { 
        return {
            appendChild: (childNode) => {}
        };
    },
    clear: () => { },
    createElement: (elementName) => {
        return {
            name: elementName,
            setAttribute: (attributeName, attributeValue) => {},
            textContent: "",
            styleSheet: {
                cssText: ""
            }
        };
    }
};