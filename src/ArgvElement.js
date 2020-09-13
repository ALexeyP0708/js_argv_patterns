/**
 * @module @alexeyp0708/argv_patterns
 */

import {Argv} from './export.js';

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
 */
export class ArgvElement{

    /**
     * @param {string|object} element
     * @param {string|object} element where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for {@link ArgvElement})
     * @param {object} params
     */
    constructor(element={},params={}){
        Object.defineProperties(this,{
            type:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:'command',
            },
            key:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            shortKey:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            value:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            default:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            required:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            errorMessage:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            },
            descriptions:{
                enumerable:true,
                writable:true,
                configurable:false,
                value:undefined,
            }
        });
        let te=typeof element;
        let self;
        let proto=ArgvElement.prototype;
        if(te ==='string'){
            self= Argv.parseElement(element)[0];
        } else if(!(element instanceof Object)){
            throw new Error('argument 1 must be [object Object] or string');
        } else {
            self=this;
            self.setParams(element);
        }
        if(params instanceof Object){
            self.setParams(params);
        }
        if(self!==this){
            this.setParams(self);
        }
    }

    /**
     * Setting parameters for an element
     * @param {object|ArgvElement} params
     */
    setParams(params={}){
       // let keys=Object.keys(this);
       for(let prop in params){
           if( params[prop]!==undefined){// &&keys.includes(prop)
               this[prop]=params[prop];
           }
       }
    }
}