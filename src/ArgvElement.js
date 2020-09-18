/**
 * @module @alexeyp0708/argv_patterns
 */

/**
 *  Class ArgvElement Creates an object for an argv element
 *  WARNING: "order" and "pattern" are added dynamically to the object when processed by  scripts and are for information.
 *  @prop {string} type  - `command|option`  indicates the type of element
 *  @prop {string} key   - element name (long name).
 *  @prop {string} shortKey - short name of one character for an element of the option type
 *  @prop {string} value - the value for the option type element
 *  @prop {string} default - for an item of the command type, the default key.For an option type element, the default is.
 *  @prop {boolean} required - required element
 *  @prop {string} errorMessage - parsing error message
 *  @prop {string} descriptions - to describe commands with this element. Used in Helper
 *  @prop {string} order - assigned when parsing. for  commands and  determines  command order. 
 *  Intended for informational purposes only.
 *  @prop {string} pattern - assigned when parsing. Added when comparing command line with pattern. 
 *  Indicates, in the result element, the pattern object that was matched.
 *  Intended for informational purposes only.
 */
export class ArgvElement {

    /**
     * @param {string|object} element where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for {@link ArgvElement})
     * @param {object} params
     */
    constructor(element = {}, params = {}) {
        Object.defineProperties(this, {
            type: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: 'command',
            },
            key: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            shortKey: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            value: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            default: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            required: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            errorMessage: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            },
            descriptions: {
                enumerable: true,
                writable: true,
                configurable: false,
                value: undefined,
            }
        });
        let te = typeof element;
        if (te === 'string') {
            element = ArgvElement.parseElement(element,1)[0];
        } else if (!(element instanceof Object)) {
            throw new Error('argument 1 must be [object Object] or string');
        }
        this.setParams(element,params);
    }

    /**
     * Setting parameters for an element
     * @param {object[]|ArgvElement[]} args
     */
    setParams(...args) {
        for(let key=0; key<args.length; key++){
            let params=args[key];
            for (let prop in params) {
                if (params[prop] !== undefined) {// &&keys.includes(prop)
                    this[prop] = params[prop];
                }
            }
        }
        
    }
    /**
     * Argv elements parse. Converts an argv element string to an [object .ArgvElement]
     * @param {string} str Argv element string. Example: `--option value`.
     * @returns {object[]} Since the argv element can contain a set of options (-abcd = value), an array is always returned
     * @example
     * ArgvElement.parseElement('--option=value');
     * //result
     * [
     *      "[object ArgvElement]"
     * ]
     */
    static parseElement(str, length=undefined) {
        let result = [];
        if (str[0] === '[' && str[str.length - 1] === ']') {
            let element = {};//new Argv.elementClass();
            let match = str.match(/^\[[\s]*([!])?[\s]*(-[\w]{1}|--[\w]+|[^'"\s]+|["'][\S\s]+?["'])(?:[\s]+(-[\w]{1}|--[\w]+)|)(?:[\s]+([^"'\s]+|["'][\S\s]+?["'])|)(?:[\s]+([^"'\s]+|["'][\S\s]+?["'])|)[\s]*\]$/);
            if (null === match) {
                throw Error(`Bad parameter "${str}".\n`);
            }
            if (match[1] !== undefined) {
                element.required = true;
            }
            match[2] = match[2].trim();
            if (match[2].slice(0, 2) === '--') {
                element.type = 'option';
                element.key = match[2].slice(2);
            } else if (match[2].slice(0, 1) === '-') {
                element.type = 'option';
                element.shortKey = match[2].slice(1);
            } else {
                element.type = 'command';
                element.key = match[2].replace(/^[\s"']*|[\s"']*$/g, '');
                element.key = element.key === 'true' ? true : (element.key === 'false' ? false : element.key);
            }
            if (match[3] !== undefined && match[3].slice(0, 2) === '--' && element.key === undefined) {
                element.key = match[3].slice(2);
            } else if (match[3] !== undefined && match[3].slice(0, 2) !== '--') {
                element.shortKey = match[3].slice(1);
            }
            if (match[4] !== undefined) {
                match[4] = match[4].replace(/^[\s"']*|[\s"']*$/g, '');
                if (element.type === 'option') {
                    let pattern = match[4].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                    if (pattern !== null) {
                        pattern = new RegExp(pattern[1], pattern[2]);
                    } else {
                        pattern = match[4];
                        pattern = pattern.trim();
                        pattern = pattern === 'true' ? true : (pattern === 'false' ? false : pattern);
                    }
                    element.value = pattern;
                } else if (element.type === 'command') {
                    element.default = match[4];
                    element.default = element.default === 'true' ? true : (element.default === 'false' ? false : element.default);
                }
            } else if (element.type !== 'command') {
                element.value = true;
            }
            if (match[5] !== undefined) {
                match[5] = match[5].replace(/^[\s"']*|[\s"']*$/g, '');
                if (element.type === 'option') {
                    element.default = match[5];
                    element.default = element.default === 'true' ? true : (element.default === 'false' ? false : element.default);
                }
            }
            result.push(element);
        } else {
            let match = str.match(/^(?:-([\w]+)|--([\w]+))(?:[\s]*[=:\s][\s]*|)["|']?(?:([\s\S]+?)|)["|']?[\s]*$|^[\s]*["']?([\S\s]+)["']?$/);
            if (match === null) {
                throw Error(`Bad parameter "${str}".\n`);
            }
            if (match[4] !== undefined) {
                let pattern = match[4].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                if (pattern !== null) {
                    pattern = new RegExp(pattern[1], pattern[2]);
                } else {
                    pattern = match[4].replace(/^[\s"']*|[\s"']*$/g, '');
                    pattern = pattern === 'true' ? true : (pattern === 'false' ? false : pattern);
                }
                let element = {//new Argv.elementClass
                    type: 'command',
                    key: pattern
                };
                result.push(element);
            } else {
                let value = true;
                if (match[3] !== undefined) {
                    let pattern = null;
                    pattern = match[3].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                    if (pattern !== null) {
                        pattern = new RegExp(pattern[1], pattern[2]);
                    } else {
                        pattern = match[3];
                        pattern = pattern === 'true' ? true : (pattern === 'false' ? false : pattern);
                    }
                    value = pattern;
                }
                if (match[1] !== undefined) {
                    length=length===undefined||length>match[1].length?match[1].length:length;
                    for (let key = 0; key <length; key++) {
                        let element = { //new Argv.elementClass
                            type: 'option',
                            shortKey: match[1][key],
                            value: key < match[1].length - 1 ? true : value
                        };
                        result.push(element);
                    }
                } else if (match[2] !== undefined) {
                    let element = {//new Argv.elementClass(
                        type: 'option',
                        key: match[2],
                        value
                    };
                    result.push(element);
                }
            }
        }
        return result;
    }

}