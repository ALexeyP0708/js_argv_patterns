/**
 * @module @alexeyp0708/argv_patterns
 */

import {Argv, ArgvArray} from './export.js';

/**
 *  Class ArgvObject
 *  @prop {ArgvElement[]} commands - command list
 *  @prop {Object.<string,ArgvElement>} options - set of options
 */

export class ArgvObject {
    /**
     * @param {string|Array|ArgvArray|undefined} params
     * @returns {ArgvObject}
     */
    constructor(param) {
        Object.defineProperties(this, {
            commands: {
                enumerable: true,
                writable: true,
                value: []
            },
            options: {
                enumerable: true,
                writable: true,
                value: {}
            }
        });
        let self = this;
        if (param instanceof ArgvArray) {
            self = param.toObject();
        } else if (param instanceof Array || typeof param === 'string') {
            self = Argv.parse(param).toObject();
        }
        if (self !== this) {
            this.commands.splice(0, 0, ...self.commands);
            Object.assign(this.options, self.options);
        }
    }

    /**
     * Converts this object to [array .ArgvArray]
     * @returns {ArgvArray}
     */
    toArray() {
        return Argv.objectToArray(this);
    }

    /**
     * Converts this object to command line
     * @returns {string}
     */
    toString() {
        return Argv.elementsToString(this.toArray());
    }

    /**
     * search argv element
     * @param {string|object|ArgvElement} element  where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for ArgvElement)
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for  [object .ArgvElement])
     * @returns {ArgvElement|boolean}  If false, then the item was not found. If found, it returns  [object .ArgvElement]
     *
     * @exemple
     * ```js
     *  let argv=new ArgvObject('command1 command2 --option1=value');
     *  argv.get('command2'); // result =>[object ArgvElement]
     *  argv.get('command2',{order:2});//result => [object ArgvElement]
     *  argv.get('command2',{order:1});//result => false
     *  argv.get('--option'); // result=>[object ArgvElement]
     *  argv.get('--option=value');// result=>[object ArgvElement]
     *  argv.get('--option=val');// result=>false
     * ```
     */
 /*   get(element, params = undefined) {
        if (!(element instanceof Argv.elementClass)) {
            element = new Argv.elementClass(element, params);
        } else if (params instanceof Object) {
            element.setParams(params);
        }
        let check = false;
        if (element.type === 'command') {
            let order = 0;
            this.commands.forEach((value, key) => {
                order++;
                if (element.order !== undefined && element.order === order) {
                    if (element.key !== undefined) {
                        if (element.key === value.key) {
                            check = this.commands[key];
                        }
                    } else {
                        check = this.commands[key];
                    }
                    return;
                } else if (element.order === undefined) {
                    if (element.key === value.key) {
                        check = this.commands[key];
                    }
                }
            });
        } else if (element.type === 'option') {
            let keys = Object.keys(this.options);
            let ekey;
            if (element.key !== undefined && keys.includes(element.key)) {
                ekey = element.key;
            } else if (element.shortKey && keys.includes(element.shortKey)) {
                ekey = element.shortKey;
            }
            if (ekey !== undefined) {
                if (![undefined, true].includes(element.value)) {
                    if (element.value === this.options[ekey].value) {
                        check = this.options[ekey];
                    }
                } else {
                    check = this.options[ekey];
                }
            }
        }
        delete element.order;
        return check;
    }*/

    /**
     * Sets a new parameter or overwrites the properties of the specified parameter
     * @param {string|object|ArgvElement} element where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for {@link ArgvElement})
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for  [object .ArgvElement])
     * @returns {this}
     * @exemple
     * ```js
     * let argv=new ArgvObject();
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
     *      .set('-o=value') // search for option "o" and set value
     *
     * ```
     */
/*    set(element, params = undefined) {
        if (!(element instanceof Argv.elementClass)) {
            element = new Argv.elementClass(element, params);
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
        delete element.order;
        if (check === false) {
            if (element.type === 'command') {
                this.commands.push(element);
            } else if (element.type === 'option') {
                let ekey = element.key ?? element.shortKey;
                this.options[ekey] = element;
            }
        } else {
            check.setParams(element);
        }
        return this;
    }*/


    /**
     * Add a new parameter
     * @param {string|object|ArgvElement} element  where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for  [object .ArgvElement])
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for  [object .ArgvElement])
     * @returns {this}
     * @exemple
     * ```js
     * let argv=new ArgvObject();
     * argv
     *      .add('command',{description:'test command'})
     *      .add('--option',{required:true})
     *      .add('-o=value')
     * ```
     */
/*    add(element, params = undefined) {
        if (!(element instanceof Argv.elementClass)) {
            element = new Argv.elementClass(element, params);
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
        delete element.order;
        if (check === false) {
            if (element.type === 'command') {
                this.commands.push(element);
            } else if (element.type === 'option') {
                let ekey = element.key ?? element.shortKey;
                this.options[ekey] = element;
            }
        }
        return this;
    }*/
}