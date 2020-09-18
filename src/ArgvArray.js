/**
 * @module @alexeyp0708/argv_patterns
 */
import {ArgvElement} from './export.js';

/**
 *  Class ArgvArray create array containing [object .ArgvElement]
 *  @namespace
 */

export class ArgvArray extends Array {
    /**
     * Creates an array of [object .ArgvElement] elements based on the command line, or an array of Argv parameters
     * @param {string|object} args args[0] string|Array - command line or Array from argv params, or arvs - argv array
     * @returns {ArgvElement[]}
     * @example
     * 
     * var result=new ArgvArray('command --option -o=value');
     * var result=new ArgvArray(['command','--option','-o=value']);
     * var result= new ArgvArray('command','--option','-o=value');
     * 
     * ```
     * //result
     * [
     *    "[object ArgvElement]",
     *    "[object ArgvElement]",
     *    "[object ArgvElement]"
     * ]
     * ```
     * var result= new ArgvArray([['command','--option'],[['command2','--option2'],['command3','--option3']]]);
     * //equivalent to
     * var result= new ArgvArray('command','--option','command2','--option2','command3','--option3');
     */
    constructor(...args) {
        if (args.length === 1) {
            if (typeof args[0] === 'string') {
                let first = ArgvArray.parseCommand(args[0]);
                args.splice(0, 1, ...first);
            } else if (args[0] instanceof Array) {
                args.splice(0, 1, ...args[0]);
            }
        }
        if (args.length > 1 || args.length === 1 && typeof args[0] !== 'number') {
            try {
                args = ArgvArray.parse(args);
                for(let key=0; key<args.length;key++){
                    args[key]=new ArgvArray.elementClass(args[key]);
                }
            } catch (e) {
                if (/^Bad parameters:/.test(e.message)) {
                    let message = e.message +
                        "Parameters format should be for command line:\n" +
                        "   command\n" +
                        "   -k\n" +
                        "   -k=value\n" +
                        "   -k:value\n" +
                        "   -k value (if the pattern for the key \"k\" has a value. Otherwise, the value will be perceived as a command)\n" +
                        "   --key\n" +
                        "   --key=value\n" +
                        "   --key:value\n" +
                        "   --key value (if the pattern for the key \"key\" has a value. Otherwise, the value will be perceived as a command)\n" +
                        "\n";

                    let ne = new Error(message);
                    ne.old_message = e.message;
                    throw ne;
                }
                throw e;
            }
        }
        super(...args);
    }

    /**
     * Converts [array .ArgvArray] to [object .ArgvObject]
     * @returns {ArgvObject}
     * @example
     * let argv=new ArgvArray('command --option -o=value');
     * argv.toObject();
     * //result
     * ```js
     * {
     *     commands:[
     *         "[object ArgvElement]"
     *     ],
     *     options:{
     *         option:"[object ArgvElement]",
     *         o:"[object ArgvElement]"
     *     }
     * }
     * ```
     */
    /*toObject() {
        return ArgvArray.elementsToObject(this);
    }*/

    /**
     * converts ArgvArray to Array
     * @returns {string[]}
     */
    toArray() {
        return ArgvArray.elementsToArray(this);
    }

    /**
     * Converts ArgvArray to command line
     * @returns {string} Command line
     * @example
     * let argv=new ArgvArray(['command', '--option', '-o value']);
     * argv.toString();
     * //result
     * //'command --option -o=value'
     */
    toString() {
        return ArgvArray.elementsToString(this);
    }

    /**
     * search ArgvElement in ArgvArray by keys and/or value
     * @param {ArgvElement|object|string} element  Sets the dataset to search
     * ```js
     * {
     *     type, // 
     *     key, // Data type =>  * | string | [object RegExp]
     *     value, // for {type:'option'}. data type =>  * | string | [object RegExp]
     *     order // for {type:'command'} 
     * }
     * ```
     * or pattern string for element Example:"/command1|command2/", "[--option=value]"
     * @param {boolean} isFirst - one result in array
     * @returns {ArgvElement[]}
     *
     * @examples
     * let argv=new ArgvArray('command1','command1','command2','--option1=value1','--option2=value2','-a=value2','-b=value1');
     * let result=argv.searchElement({order:1});// [argv[0]]
     * result=argv.searchElement({key:'command1'});// [argv[0],argv[1]]
     * result=argv.searchElement({key:'command2'},true);// [argv[2]]
     * result=argv.searchElement({key:/command[\d]/});// [argv[0],argv[1],argv[2]]
     * result=argv.searchElement({key:/command[\d]/,order:2});// [argv[1]]
     * result=argv.searchElement({key:'command6'});// []
     * result=argv.searchElement({type:'option',key:'option1'});// [argv[3]]
     * result=argv.searchElement({type:'option',key:'option1',value:'value1'});//[argv[3]]
     * result=argv.searchElement({type:'option',key:'option1',value:/value[\d]/});// [argv[3]]
     * result=argv.searchElement({type:'option',key:/option[\d]/,value:/value[\d]/});// [argv[3],argv[4]]
     * result=argv.searchElement({type:'option',shortKey:/[ab]/,value:/value[\d]/});// [argv[5],argv[6]]
     * result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/value[\d]/});// [argv[3],argv[4],argv[5],argv[6]]
     * result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/^[\d]$/});// []
     * result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/^value[\d]$/},true);// [argv[3]]
     */
    searchElement(element, isFirst = false) {
        if (!(element instanceof ArgvArray.elementClass)) {
            element = new ArgvArray.elementClass(element);
        }
        let order = 0, check = false;
        let result = new ArgvArray();
        try {
            this.forEach((value, key) => {
                if (value.type === 'command') {
                    order++;
                }
                if (element.type === 'option' && element.type === value.type) {
                    if (value.key !== undefined && (element.key instanceof RegExp && element.key.test(value.key) || value.key === element.key) ||
                        value.shortKey !== undefined && (element.shortKey instanceof RegExp && element.shortKey.test(value.shortKey) || value.shortKey === element.shortKey)
                    ) {
                        if (![undefined, true].includes(element.value)) {
                            if (
                                element.value instanceof RegExp && element.value.test(value.value) ||
                                value.value instanceof RegExp && element.value.toString() === value.value.toString() ||
                                element.value === value.value
                            ) {
                                result.push(this[key]);
                            }
                        } else {
                            result.push(this[key]);
                        }
                        if (isFirst && result.length > 0) {
                            throw new Error('break;');
                        }
                    }
                } else if (element.type === 'command' && element.type === value.type) {
                    if (element.order !== undefined) {
                        if (element.order === order) {
                            if (element.key !== undefined) {
                                if (
                                    element.key instanceof RegExp && element.key.test(value.key) ||
                                    value.key instanceof RegExp && element.key.toString() === value.key.toString() ||
                                    element.key === value.key
                                ) {
                                    result.push(this[key]);
                                }
                            } else {
                                result.push(this[key]);
                            }
                            throw new Error('break;');
                        }
                    } else {
                        if (
                            element.key instanceof RegExp && element.key.test(value.key) ||
                            value.key instanceof RegExp && element.key.toString() === value.key.toString() ||
                            element.key === value.key
                        ) {
                            result.push(this[key]);
                            if (isFirst) {
                                throw new Error('break;');
                            }
                        }
                    }
                }
            });
        } catch (e) {
            if (e.message !== 'break;') {
                throw e;
            }
        }
        //delete element.order;
        return result;
    }

    /**
     * search ArgvElements 
     * @param {string|string[]|ArgvArray|ArgvElement[]|object[]} elements  
     * string or strings array - commandline or parametrs set command line 
     * objects array - ArgvElement templates set 
     * ```js
     * [
     *  {
     *       type, // 
     *       key, // Data type =>  * | string | [object RegExp]
     *       value, // for {type:'option'}. data type =>  * | string | [object RegExp]
     *      order // for {type:'command'} 
     *  },
     *  ...     *
     * ]
     * ```
     * @param {boolean} isFirst isFirst - one result in array
     * @param {boolean} isCommand  if isCommand===true then returns [array .ArgvArray]
     * @returns {Array|ArgvArray}
     * Array - if isFirst equal true, then return argvElement array.   
     * If isFirst equal false, then return [[ArgvElement....],[...],[...]].
     * If isCommand===true then returns [array .ArgvArray]
     */
    searchElements(elements = [], isFirst = false, isCommand = false) {
        let results = [];
        elements.forEach((element, key) => {
            if (!(element instanceof ArgvArray.elementClass)) {
                element = new ArgvArray.elementClass(element);
            }
            let result = this.searchElement(element, isFirst);
            if (result.length === 0) {
                result = undefined;
            } else if (isFirst) {
                result = result[0];
            }
            results.push(result);
        });
        if (isCommand) {
            results = new ArgvArray(...results);
        }
        return results;
    }

    /**
     * search argv element
     * @param {string|object|ArgvElement} element  where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for ArgvElement).
     * Properties for  element search
     * ```js
     *  {
     *       type, // 
     *       key, // Data type =>  * | string | [object RegExp]
     *       value, // for {type:'option'}. data type =>  * | string | [object RegExp]
     *      order // for {type:'command'} 
     *  }
     * ```
     * 
     * @param {object|ArgvElement} params If 1 argument is string, this is set of element parameters (template for ArgvElement)
     * @returns {ArgvElement|boolean}  If false, then the item was not found. If found, it returns  [object .ArgvElement]
     *
     * @example
     *  let argv=new ArgvArray('command1 command2 --option1=value');
     *  argv.get('command2'); // result =>[object ArgvElement]
     *  argv.get('command2',{order:2});//result => [object ArgvElement]
     *  argv.get('command2',{order:1});//result => false
     *  argv.get('--option'); // result=>[object ArgvElement]
     *  argv.get('--option=value');// result=>[object ArgvElement]
     *  argv.get('--option=val');// result=>false
     */
    get(element, params = undefined) {
        if (!(element instanceof ArgvArray.elementClass)) {
            element = new ArgvArray.elementClass(element, params);
        } else if (params instanceof Object) {
            element.setParams(params);
        }
        let result = this.searchElement(element, true);
        if (result.length > 0) {
            result = result[0];
        } else {
            result = false;
        }
        return result;
    }

    /**
     * Sets a new parameter or overwrites the properties of the specified parameter
     * @param {string|object|ArgvElement} element where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for [object .ArgvElement])
     * Properties for  element search
     *```js
     *  {
     *       type, // 
     *       key, // Data type =>  * | string | [object RegExp]
     *       value, // for {type:'option'}. data type =>  * | string | [object RegExp]
     *      order // for {type:'command'} 
     *  }
     * ```
     * Other used properties will be set to the element
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for [object .ArgvElement])
     * @returns {this}
     * @exemple
     *
     * let argv=new ArgvArray();
     * argv
     *      .set('command',{order:1,description:'test command'})
     *
     *      // if the element type is "command" and you specify an order (command position),
     *      //then the parameters of the command element at the corresponding position will be overwritten
     *      // If such a position does not exist, then the command will be added to the end of the array.
     *      // Warning: the order is intended to overwrite or set the next command.
     *      .set({
     *          type:'command'
     *          order:1, // command position. Example  command  order -`order1 --option order2 -o order3`
     *          key:'new_command',
     *      })
     *      // search for command new_command and set description
     *      .set({
     *          type:'command',
     *          key:'new_command',
     *          description:'Overwrite description for command'     *
     *      })
     *      // search for option "option" and set parameter "required"
     *      .set('--option',{required:true})
     *      .set('-o=value'); // search for option "o" and set value
     */
    set(element, params = undefined) {
        if (!(element instanceof ArgvArray.elementClass)) {
            element = new ArgvArray.elementClass(element, params);
        } else if (params instanceof Object) {
            element.setParams(params);
        }
        let find = Object.assign({}, element);
        if (find.type === 'command' && find.order !== undefined) {
            find.key = undefined;
        } else if (find.type === 'option') {
            find.value = undefined;
        }
        let check = this.get(find);
        //delete element.order;
        if (check === false) {
            this.push(element);
        } else {
            check.setParams(element);
        }
        return this;
    }

    /**
     * Add a new parameter
     * @param {string|object|ArgvElement} element  Where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for ArgvElement)
     *Properties for  element search
     *```js
     *  {
     *       type, // 
     *       key, // Data type =>  * | string | [object RegExp]
     *       value, // for {type:'option'}. data type =>  * | string | [object RegExp]
     *      order // for {type:'command'} 
     *  }
     * ```
     * Other used properties will be set to  the added element 
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameters setting for the element (template for [object .ArgvElement])
     * @returns {this}
     * @example
     *
     * let argv=new ArgvArray();
     * argv
     *      .add('command',{description:'test command'})
     *      .add('--option',{required:true})
     *      .add('-o=value');
     *
     */
    add(element, params = undefined) {
        if (!(element instanceof ArgvArray.elementClass)) {
            element = new ArgvArray.elementClass(element, params);
        } else if (params instanceof Object) {
            element.setParams(params);
        }
        let find = Object.assign({}, element);
        if (find.type === 'command') {
            find.key = undefined;
        } else if (find.type === 'option') {
            find.value = undefined;
        }
        let check = this.get(find);
        //delete element.order;
        if (check === false) {
            this.push(element);
        }
        return this;
    }

    /**
     * convert string or Array to [object .ArgvElement]
     * @param {string} element
     * @returns {ArgvElement}
     * @example
     * let argv=new ArgvArray();
     * let result= argv.toElement('command --option -o=value'); //[object ArgvElement]
     */
    toElement(element) {
        if (!(element instanceof ArgvArray.elementClass)) {
            element = new ArgvArray.elementClass(element);
        }
        return element;
    }

    /**
     * Same as Array.prototype.push, but converts arguments to [object .ArgvElement]
     * @param args converted to ArgvElement
     * @returns {number}
     */
    push(...args) {
        args.forEach((value, key, array) => {
            array[key] = this.toElement(value)
        });
        return super.push(...args);
    }

    /**
     * Same as Array.prototype.push, but converts the elements of the arguments (arrays) to  [object .ArgvElement]
     * @param {Array[]} args converted to  [object .ArgvElement]
     * @returns {ArgvArray}
     */
    concat(...args) {
        args.forEach((value, key, array) => {
            value.forEach((v, k, a) => {
                a[k] = this.toElement(v);
            });
        });
        return super.concat(...args);
    }

    /**
     * Same as Array.prototype.unshift, but converts arguments to  [object .ArgvElement]
     * @param args converted to ArgvElement
     * @returns {number}
     */
    unshift(...args) {
        args.forEach((value, key, array) => {
            array[key] = this.toElement(value)
        });
        return super.unshift(...args);
    }

    /**
     * Same as Array.prototype.fill, but converts argument 1 to  [object .ArgvElement]
     * @param value converted to  [object .ArgvElement]
     * @param start
     * @param end
     * @returns {Array}
     */
    fill(value, start, end) {
        value = this.toElement(value);
        return super.fill(value, start, end);
    }

    /**
     * ame as Array.prototype.fill, but converts rest arguments to  [object .ArgvElement]
     * @param start
     * @param deleteCount
     * @param items converted to  [object .ArgvElement]
     * @returns {any[]}
     */
    splice(start, deleteCount, ...items) {
        items.forEach((value, key, array) => {
            array[key] = this.toElement(value)
        });
        return super.splice(start, deleteCount, ...items);
    }

    /**
     * sorting items by order
     * @param call
     */
    sort(call) {
        if (call === undefined) {
            call = (a, b) => {
                if (a.type === 'option' && b.type === 'command') {
                    return 1;
                } else if (a.type === 'command' && b.type === 'option') {
                    return -1;
                } else {
                    return 0;
                }
            };
        }
        return super.sort(call);
    }

    /**
     * Command line parse. Breaks the command line into argv parameters.
     * @param {string} str Command line.
     * Warning: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * @returns {string[]}  Returns an argv-style array of parameters
     * @example
     * Argv.parseCommand('command1 --option -o=value "command2" --option2="value string"');
     * //result
     * [
     *      'command1',
     *      '--option',
     *      '-o=value',
     *      'command2',
     *      '--option2=value string'
     * ];
     */
    static parseCommand(str) {
        str = str.replace(/[\s]+\=[\s]+/g, '=');
        str = str.replace(/[\s]{2,}/g, ' ');
        let pull = [];
        let space = '@@';
        str = str.replace(/(\[[\s\S]*?\])|[\s]*([\=|:])[\s]*|"([\s\S]*?)"|([\s]+)/g, function (m, p1, p2, p3, p4) {
            if (p1 !== undefined) {
                pull.push(p1);
                return '@@pull_' + (pull.length - 1);
            }
            if (p2 !== undefined) {
                return p2;
            }
            if (p3 !== undefined) {
                pull.push(p3);
                return '@@pull_' + (pull.length - 1);
            }
            if (p4 !== undefined) {
                return space;
            }
        });
        str = str.replace(/@@pull_([\d]+)/g, function (m, p1) {
            p1 = Number(p1);
            if (pull[p1] !== undefined) {
                return pull[p1];
            }
            return m;
        });
        str = str.split(space);
        return str;
    }


    /**
     * Parses the command line or argv parameter array and returns an [array .ArgvArray].
     * @param {string[]|array[]|string} argv  Array type- argv parameters set. String type -parameters command line.
     * If an array element is an array, then this array is considered to be a set of command parameters and all its elements will be embedded in the existing array set.
     * Warning: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * @returns {Array}   A collection of [object .ArgvElement]
     * @throws
     * Error: Bad parameters - syntactically bad parameter or poorly constructed command line
     */
    static parse(argv) {
        if (typeof argv === 'string') {
            argv = this.parseCommand(argv);
        }
        let result =[];// new ArgvArray();
        let errors = [];
        let order = 0;
        for (let key = 0; key < argv.length; key++) {
            let arg = argv[key];
            if (arg instanceof Array) {
                argv.splice(key, 1, ...arg);
                key--;
                continue;
            }
            if (typeof arg === 'string') {
                try {
                    arg = ArgvElement.parseElement(arg);
                    arg.forEach((value) => {
                        if (value.type === 'command') {
                            order++;
                            value.order=order;
                        }
                        result.push(value);
                    });
                } catch (e) {
                    errors.push(e.message);
                }
            } else {
                if (arg.type === 'command' && arg.order === undefined) {
                    order++;
                    arg.order={
                        enumerable: true,
                        value: order
                    };
                }
                result.push(arg);
            }
        }
        if (errors.length > 0) {
            throw new Error("Bad parameters:\n" + errors.join(" "));
        }
        return result;
    }
    
    /**
     * Converting [object .ArgvElement] elements from [array .ArgvArray] to string parameters  array
     * @param {ArgvArray} argv
     * @returns {string[]}
     * @throws
     * Error: Bad argument - Invalid argument
     */
    static elementsToArray(argv) {
        let result = [];
        if (!(argv instanceof ArgvArray)) {
            throw new Error('Bad argument. Must be [object ArgvArray]');
        }
        for (let param of argv) {
            if (param.type === 'command') {
                if (/[\s]/.test(param.key)) {
                    result.push(`"${param.key}"`);
                } else {
                    result.push(param.key);
                }
            } else {
                let value = param.value;

                let key;
                let prefix = '';
                if (param.key !== undefined) {
                    key = param.key;
                    prefix = '--';
                } else if (param.shortKey !== undefined) {
                    key = param.shortKey;
                    prefix = '-';
                }
                let str = prefix + key;
                if (typeof value !== "boolean") {
                    str += '="' + value + '"';
                } else if (value === false) {
                    str = undefined;
                }
                if (str !== undefined) {
                    result.push(str);
                }
            }
        }
        return result;
    }

    /**
     * Converting [object .ArgvElement]  elements from [array .ArgvArray] to command line
     * @param {ArgvArray} argv
     * @returns {string}
     * @throws
     * Error: Bad argument - Invalid argument
     */
    static elementsToString(argv) {
        if (!(argv instanceof ArgvArray)) {
            throw new Error('Bad argument. Must be [object ArgvArray]');
        }
        return this.elementsToArray(argv).join(' ');
    }
}

/**
 * Using this property, you can replace the class [object .ArgvElement] the advanced class
 * If ArgvArray.elementClass = null, then  [class .ArgvElement] will be set by default
 * @type {ArgvElement}
 * @throws
 * Error: Class does not belong to [class .ArgvElement]
 * @example
 * class ExtArgvElement extends ArgvElement {}
 * ArgvArray.elementClass=ExtArgvElement;
 * let argv=new ArgvArray('command --option');
 * argv[0] instanceof ExtArgvElement // true
 */
ArgvArray.elementClass = ArgvElement;
{
    let element = ArgvElement;
    Object.defineProperty(ArgvArray, 'elementClass', {
        enumerable: false,
        configurable: true,
        get() {
            return element;
        },
        set(v) {
            if (typeof v === 'function' && ArgvElement.isPrototypeOf(v)) {
                element = v;
            } else if (v === null) {
                element = ArgvElement;
            } else {
                throw new Error('The value does not belong to the ArgvElement class');
            }
        }
    });
}