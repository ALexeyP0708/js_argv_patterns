/**
 * @module @alexeyp0708/argv_patterns
 */
import {Argv} from './export.js';

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
     * ```js
     * var result=new ArgvArray('command --option -o=value');
     * var result=new ArgvArray(['command','--option','-o=value']);
     * var result= new ArgvArray('command','--option','-o=value');
     * 
     * ```
     * result
     * ```json
     * [
     *    "[object ArgvElement]", 
     *    "[object ArgvElement]",
     *    "[object ArgvElement]"
     * ]
     * ```
     * var result= new ArgvArray([['command','--option'],[['command2','--option2'],['command3','--option3']]]);
     * equivalent to
     * var result= new ArgvArray('command','--option','command2','--option2','command3','--option3');
     */
    constructor (...args) {
        if(args.length===1){
            if(typeof args[0]==='string'){
                let first= Argv.parseCommand(args[0]);
                args.splice(0,1,...first);
            } else if( args[0] instanceof Array){
                args.splice(0,1,...args[0]);
            }
        }
        if(args.length>1 || args.length===1 && typeof args[0]!=='number'){
            try {
                args=Argv.parse(args);
            } catch (e){
                if(/^Bad parameters:/.test(e.message)){
                    let message=e.message+
                        "Parameters format should be for command line:\n"+
                        "   command\n"+
                        "   -k\n"+
                        "   -k=value\n" +
                        "   -k:value\n" +
                        "   -k value (if the pattern for the key \"k\" has a value. Otherwise, the value will be perceived as a command)\n" +
                        "   --key\n" +
                        "   --key=value\n"+
                        "   --key:value\n"+
                        "   --key value (if the pattern for the key \"key\" has a value. Otherwise, the value will be perceived as a command)\n" +
                        "\n";

                       let ne=new Error(message);
                       ne.old_message=e.message;
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
     * ```js
     * let argv=new ArgvArray('command --option -o=value');
     * argv.toObject();
     * ```
     * result
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
    toObject(){
        return Argv.elementsToObject(this);
    }

    /**
     * converts ArgvArray to Array
     * @returns {string}
     */
    toArray(){
        return Argv.elementsToArray(this);
    }

    /**
     * Converts ArgvArray to command line
     * @returns {string} Command line
     * @example
     * ```js
     * let argv=new ArgvArray(['command', '--option', '-o value']);
     * argv.toString();
     * ```
     * result
     * ```js
     * 'command --option -o=value'
     * ```
     */
    toString(){
        return Argv.elementsToString(this);
    }

    /**
     * search argv element
     * @param {ArgvElement} element
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
    searchElement(element,isFirst=false){
        if(!(element instanceof Argv.elementClass)){
            element=new Argv.elementClass(element);
        } 
        let order=0,check=false;
        let result=new ArgvArray();
        try {
            this.forEach((value,key)=>{
                if(value.type==='command'){
                    order++;
                }
                if( element.type==='option' && element.type===value.type){
                    if(value.key!==undefined && (element.key instanceof RegExp && element.key.test(value.key) || value.key===element.key) ||
                        value.shortKey!==undefined && (element.shortKey instanceof RegExp && element.shortKey.test(value.shortKey) || value.shortKey===element.shortKey)
                    ){
                        if(![undefined,true].includes(element.value)){
                            if (
                                element.value instanceof RegExp && element.value.test(value.value) ||
                                value.value instanceof RegExp && element.value.toString()===value.value.toString() ||
                                element.value===value.value
                            ){
                                result.push(this[key]);
                            }
                        } else {
                            result.push(this[key]);
                        }
                        if(isFirst && result.length>0){
                            throw new Error('break;');
                        }
                    }
                } else if( element.type==='command' &&  element.type===value.type ){
                    if(element.order !== undefined ){
                        if(element.order===order){
                            if(element.key!==undefined){
                                if(
                                    element.key instanceof RegExp && element.key.test(value.key) ||
                                    value.key instanceof RegExp && element.key.toString()===value.key.toString()||
                                    element.key===value.key
                                ){
                                    result.push(this[key]);
                                }
                            } else {
                                result.push(this[key]);
                            }
                            throw new Error('break;');
                        }
                    } else {
                        if(
                            element.key instanceof RegExp && element.key.test(value.key) ||
                            value.key instanceof RegExp && element.key.toString()===value.key.toString()||
                            element.key===value.key
                        ){
                            result.push(this[key]);
                            if(isFirst){
                                throw new Error('break;');
                            }
                        }
                    }
                }
            });
        } catch(e){
            if(e.message!=='break;'){throw e;}
        }
        //delete element.order;
        return result;
    }

    /**
     * 
     * @param elements
     * @param {boolean} isFirst
     * @param {boolean} isCommand
     * @returns {Array|ArgvArray} if isCommand===true then [array ArgvArray]
     */
    searchElements(elements=[],isFirst=false,isCommand=false){
        let results=[];
        elements.forEach((element,key)=>{
            if(!(element instanceof Argv.elementClass)){
                element=new Argv.elementClass(element);
            }
            let result=this.searchElement(element,isFirst);
            if(result.length===0){
                result=undefined;
            }else
            if(isFirst){
                result=result[0];
            }
            results.push(result);
        });
        if(isCommand){
            results=new ArgvArray(...results);
        }
        return results;
    }

    /**
     * search argv element
     * @param {string|object|ArgvElement} element  where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for ArgvElement)
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for ArgvElement)
     * @returns {ArgvElement|boolean}  If false, then the item was not found. If found, it returns  [object .ArgvElement]
     *  
     *  @see [method .#searchElement]
     * @exemple
     *  let argv=new ArgvArray('command1 command2 --option1=value');
     *  argv.get('command2'); // result =>[object ArgvElement]
     *  argv.get('command2',{order:2});//result => [object ArgvElement]
     *  argv.get('command2',{order:1});//result => false
     *  argv.get('--option'); // result=>[object ArgvElement]
     *  argv.get('--option=value');// result=>[object ArgvElement]
     *  argv.get('--option=val');// result=>false
     */   
    get(element,params=undefined){
        if(!(element instanceof Argv.elementClass)){
            element=new Argv.elementClass(element,params);
        } else if(params instanceof Object){
            element.setParams(params);
        }
        let result=this.searchElement(element,true);
        if(result.length>0){
            result=result[0];
        } else{
            result=false;
        }
        return result;
    }

    /**
     * Sets a new parameter or overwrites the properties of the specified parameter
     * @param {string|object|ArgvElement} element where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for [object .ArgvElement])
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
    set(element,params=undefined){
        if(!(element instanceof Argv.elementClass)){
            element=new Argv.elementClass(element,params);
        } else if(params instanceof Object){
            element.setParams(params);
        }
        let find=Object.assign({},element);
        if(find.type==='command' && find.order!==undefined){
            find.key=undefined;
        } else if(find.type==='option'){
            find.value=undefined;
        }
        let check=this.get(find);
        //delete element.order;
        if(check===false){
            this.push(element);
        } else {
            check.setParams(element);
        }
        return this;
    }

    /**
     * Add a new parameter
     * @param {string|object|ArgvElement} element  where string is the command line element for the parser.
     * If an object, then this is a set of element parameters (template for ArgvElement)
     * @param {object|ArgvElement} params if 1 argument is string, it is used as parameter setting for the element (template for [object .ArgvElement])
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
    add(element,params=undefined){
        if(!(element instanceof Argv.elementClass)){
            element=new Argv.elementClass(element,params);
        } else if(params instanceof Object){
            element.setParams(params);
        }
        let find=Object.assign({},element);
        if(find.type==='command'){
            find.key=undefined;
        } else if(find.type==='option'){
            find.value=undefined;
        }
        let check=this.get(find);
        //delete element.order;
        if(check===false){
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
    toElement(element){
        if(!(element instanceof Argv.elementClass)){
            element=new Argv.elementClass(element);
        }
        return element;
    }

    /**
     * Same as Array.prototype.push, but converts arguments to [object .ArgvElement]
     * @param args converted to ArgvElement
     * @returns {number}
     */
    push(...args){
        args.forEach((value,key,array)=>{array[key]=this.toElement(value)});
        return super.push(...args);
    }

    /**
     * Same as Array.prototype.push, but converts the elements of the arguments (arrays) to  [object .ArgvElement]
     * @param {Array[]} args converted to  [object .ArgvElement]
     * @returns {ArgvArray}
     */
    concat(...args){
        args.forEach((value,key,array)=>{
            value.forEach((v,k,a)=>{
                a[k]=this.toElement(v);
            });
        });
        return super.concat(...args);
    }

    /**
     * Same as Array.prototype.unshift, but converts arguments to  [object .ArgvElement]
     * @param args converted to ArgvElement
     * @returns {number}
     */
    unshift(...args){
        args.forEach((value,key,array)=>{array[key]=this.toElement(value)});
        return super.unshift(...args);
    }

    /**
     * Same as Array.prototype.fill, but converts argument 1 to  [object .ArgvElement]
     * @param value converted to  [object .ArgvElement]
     * @param start
     * @param end
     * @returns {Array}
     */
    fill(value,start,end){
        value=this.toElement(value);
        return super.fill(value,start,end);
    }

    /**
     * ame as Array.prototype.fill, but converts rest arguments to  [object .ArgvElement]
     * @param start
     * @param deleteCount
     * @param items converted to  [object .ArgvElement]
     * @returns {any[]}
     */
    splice(start, deleteCount, ...items){
        items.forEach((value,key,array)=>{array[key]=this.toElement(value)});
        return super.splice(start, deleteCount, ...items);
    }

    /**
     * sorting items by order
     * @param call
     */
    sort(call){
        if(call===undefined){
            call=(a,b)=>{
                if(a.type==='option' && b.type==='command'){
                    return 1;
                } else if(a.type==='command' && b.type==='option'){
                    return -1;
                } else {
                    return 0;
                }
            };
        }
        return super.sort(call);
    }
}