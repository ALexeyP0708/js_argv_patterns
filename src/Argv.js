/**
 * @module ArgvArray
 * @see ArgvElement
 * @see ArgvArray
 * @see ArgvObject
 */
import {ArgvElement,ArgvArray,ArgvObject} from './export.js';

/**
 *  Class Argv implements static methods to use them in ArgvArray,ArgvObject,ArgvPattern   objects
 */
export class Argv {

    /**
     * Command line parse.Breaks the command line into argv elements.
     * @param {string} str Command line.  warn: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * @returns {Array}  Returns an argv-style array of parameters
     * @example
     * ```js
     * Argv.parseCommand('command1 --option -o=value "command2" --option2="value string"');
     * ```
     * result
     * ```js
     * [
     *      'command1',
     *      '--option',
     *      '-o=value',
     *      'command2',
     *      '--option2=value string'
     * ]
     * ```
     */
    static parseCommand(str){
        str = str.replace(/[\s]+\=[\s]+/g, '=');
        str = str.replace(/[\s]{2,}/g, ' ');
        let pull = [];
        let space = '@@';
        str = str.replace(/(\[[\s\S]*?\])|[\s]*([\=|:])[\s]*|"([\s\S]*?)"|([\s]+)/g, function (m, p1, p2, p3,p4) {
            if(p1 !== undefined){
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
     * Argv elements parse. Converts an argv element to an {@link ArgvElement} object
     * @param {string} str argv element string
     * @returns {Array} since the argv element can contain a set of options (-abcd = value), an array is always returned
     * @example
     * ```js
     * Argv.parseElement('--option=value');
     * ```
     * result
     * ```js
     * [
     *      "[object ArgvElement]"
     * ]
     * ```
    */
    static parseElement(str){
        let result =[];
        if(str[0]==='[' && str[str.length-1]===']'){
            let params=new Argv.elementClass();
            let match=str.match(/^\[[\s]*([!])?[\s]*(-[\w]{1}|--[\w]+|[^'"][\S]*[^'"]|["'][\S\s]+?["'])(?:[\s]+(-[\w]{1}|--[\w]+)|)(?:[\s]+([^"'][\S]*[^"']|["'][\S\s]+?["'])|)(?:[\s]+([^"'][\S]*[^"']|["'][\S\s]+?["'])|)[\s]*\]$/);
            if(null===match){
                throw Error(`Bad parameter "${str}".\n`);
            }
            if(match[1]!==undefined){
                params.required=true;
            }
            match[2]=match[2].trim();
            if(match[2].slice(0,2)==='--'){
                params.type='option';
                params.key=match[2].slice(2);
            } else if(match[2].slice(0,1)==='-'){
                params.type='option';
                params.shortKey=match[2].slice(1);
            } else {
                params.type='command';
                params.key=match[2].replace(/^[\s"']*|[\s"']*$/g,'');
                params.key=params.key==='true'?true:(params.key==='false'?false:params.key);
            }
            if(match[3]!==undefined && match[3].slice(0,2)==='--' && params.key===undefined){
                params.key=match[3].slice(2);
            } else if(match[3]!==undefined && match[3].slice(0,2)!=='--'){
                params.shortKey=match[3].slice(1);
            }
            if(match[4]!==undefined){
                match[4]=match[4].replace(/^[\s"']*|[\s"']*$/g,'');
                if(params.type==='option'){
                    let pattern=match[4].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                    if(pattern !== null){
                        pattern= new RegExp(pattern[1],pattern[2]);
                    } else {
                        pattern=match[4];
                        pattern=pattern.trim();
                        pattern=pattern==='true'?true:(pattern==='false'?false:pattern);
                    }
                    params.value=pattern;
                } else if(params.type==='command'){
                    params.default=match[4];
                    params.default=params.default==='true'?true:(params.default==='false'?false:params.default);
                }
            } else if(params.type!=='command'){
                params.value=true;
            }
            if(match[5]!==undefined){
                match[5]=match[5].replace(/^[\s"']*|[\s"']*$/g,'');
                if(params.type==='option'){
                    params.default=match[5];
                    params.default=params.default==='true'?true:(params.default==='false'?false:params.default);
                }
            }
            result.push(params);
        } else {
            let match=str.match(/^(?:-([\w]+)|--([\w]+))(?:[\s]*[=:\s][\s]*|)["|']?(?:([\s\S]+?)|)["|']?[\s]*$|^[\s]*["']?([\S\s]+)["']?$/);
            if(match===null){
                throw Error(`Bad parameter "${str}".\n`);
            }

            if(match[4]!==undefined){
                let pattern=match[4].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                if(pattern !== null){
                    pattern= new RegExp(pattern[1],pattern[2]);
                } else {
                    pattern=match[4].replace(/^[\s"']*|[\s"']*$/g,'');
                    pattern=pattern==='true'?true:(pattern==='false'?false:pattern);
                }
                let element=new Argv.elementClass({
                    type:'command',
                    key:pattern
                });
                result.push(element);
            } else {
                let value=true;
                if(match[3]!==undefined){
                    let pattern=null;
                    pattern=match[3].match(/^\/([\s\S]*)\/([gimy]{0,4})$/);
                    if(pattern !== null){
                        pattern= new RegExp(pattern[1],pattern[2]);
                    } else {
                        pattern=match[3];
                        pattern=pattern==='true'?true:(pattern==='false'?false:pattern);
                    }
                    value=pattern;
                }
                if(match[1]!==undefined) {
                    for(let key=0; key<match[1].length; key++){
                        let element=new Argv.elementClass({
                            type:'option',
                            shortKey:match[1][key],
                            value:key<match[1].length-1?true:value
                        });
                        result.push(element);
                    }
                } else if(match[2]!==undefined){
                    let element=new Argv.elementClass({
                        type:'option',
                        key:match[2],
                        value
                    });
                    result.push(element);
                }
            }
        }
        return result;
    }

    /**
     * Parses the command line and / or Argv elements, and returns an ArgvArray array for subsequent control of actions.
     * @param {Array|string} argv  Array - argv element set. String-command line.
     * Warn: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * @returns {ArgvArray}
     */

    static parse(argv) {
        if (typeof argv === 'string') {
            argv=Argv.parseCommand(argv);
        }
        let result = new ArgvArray();
        let errors=[];
        let order=0;
        for (let arg of argv) {
            if(typeof arg ==='string'){
                try{
                    arg=this.parseElement(arg);
                    arg.forEach((value)=>{
                        if(value.type==='command'){
                            order++;
                            value.order=order;
                        }
                        result.set(value);
                    });
                }catch(e){
                    errors.push(e.message);
                }
            } else {
                if(arg.type==='command'){
                    order++;
                    arg.order=order;
                }
                result.set(arg);
            }
        }
        if(errors.length>0){
            throw new Error("Bad parameters:\n"+errors.join(" "));
        }
        return result;
    }

    /**
     *  Converting Argv  elements ArgvArray to Array
     * @param {string|Array} argv
     * @returns {string}
     */
    static elementsToArray(argv){
        let result=[];
        if(!(argv instanceof ArgvArray)){
            argv=Argv.parse(argv);
        }
        for(let param of argv){
            if(param.type==='command'){
                if(/[\s]/.test(param.key)){
                    result.push(`"${param.key}"`);
                } else {
                    result.push(param.key);
                }
            } else {
                let value=param.value;

                let key;
                let prefix='';
                if(param.key!==undefined){
                    key=param.key;
                    prefix='--';
                }else if(param.shortKey!==undefined){
                    key=param.shortKey;
                    prefix='-';
                }
                let str=prefix+key;
                if(typeof value !=="boolean"){
                    str+='="'+value+'"';
                } else if(value===false){
                    str=undefined;
                }
                if(str!==undefined){
                    result.push(str);
                }
            }
        }
        return result;
    }

    /**
     *  Converting Argv  elements ArgvArray to Array
     * @param {string|Array} argv
     * @returns {string}
     */
    static elementsToString(argv){
        return this.elementsToArray(argv).join(' ');
    }

    /**
     * Converting Argv pattern elements array to pattern string
     * @param {string|Array} argv
     * @returns {string}
     */
    static elementsToPattern(argv){
        let result=[];
        if(!(argv instanceof ArgvArray)){
            argv=Argv.parse(argv);
        }
        for(let param of argv){
            if(param.type === 'command'){
                let key=param.key;// instanceof RegExp?param.key.toString():param.key;
                if(/[\s]/.test(key)){
                    key=`"${key}"`;
                }
                if(param.default !== undefined || param.required !== undefined && param.required !== false){
                    key=`[${param.required?'!':''} ${key} ${param.default?'"'+param.default+'" ':''}]`;
                }
                result.push(key);
            } else {
                let value=param.value;// instanceof RegExp?param.value.toString():param.value;
                if(/[\s]/.test(value)){
                    value=`"${value}"`;
                }
                let str;
                if(param.key!==undefined && param.shortKey!==undefined ||
                    param.default !== undefined ||
                    param.required !== undefined && param.required !== false){
                    let key=param.key!==undefined?`--${param.key} `:'';
                    let shortKey=param.shortKey!==undefined?`-${param.shortKey} `:'';
                    str=`[${param.required?'!':''} ${key}${shortKey}${value} ${param.default?'"'+param.default+'" ':''}]`;
                }  else {
                    if(param.key!==undefined){
                        str='--'+param.key;
                    }else
                    if(param.shortKey!==undefined){
                        str='-'+param.shortKey;
                    }
                    str+=`=${value}`;
                }
                result.push(str);
            }
        }
        return result.join(' ');
    }
    /**
     *  converting Argv  elements Array to ArgvObject
     * @param {string|ArgvObject|ArgvArray|Array} argv
     * @returns {ArgvObject}
     */
    static elementsToObject(argv){
        let result=new ArgvObject();
        if(!(argv instanceof ArgvArray)){
            argv=Argv.parse(argv);
        }
        for(let param of argv){
            if(param.type==='command'){
                result.commands.push(param);
            } else if(param.type==='option'){
                if(param.key!==undefined){
                    result.options[param.key]=param;
                }else
                if(param.shortKey!==undefined){
                    result.options[param.shortKey]=param;
                }
            }
        }
        result.commands.sort((a,b)=>{
            return a.order-b.order;
        });
        return result;
    }

    /**
     * Converting ArgvObject to ArgvArray
     * @param {ArgvObject} argv
     * @returns {ArgvArray}
     */
    static objectToArray (argv){
        if(!argv instanceof ArgvObject ){
            throw new Error('bad argument. Must be [object ArgvObject] ');
        }
        let result=new ArgvArray();
        for(let command of argv.commands){
            result.push(command);
        }
        for(let key in argv.options){
            let option=argv.options[key];
            let check=false;
            if(!result.includes(option)){
                result.push(option);
            }
        }
        return result;
    }

     /**
     * Matches the argv parameters with the pattern, and returns the matches in ArgvArray object.
     * @param {string|ArgvObject|ArgvArray|Array} argv - where string is the command line
     * where Array- Argv array of command line parameters
     * command line:
     * - `command1 command2`
      * - `command "string from space"` or `command 'string from space'` warn: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * - `--option`  option `option=true`
     * - `--option=value` or `--option:value` option `option=value`
     * - `--option value` option `option=value` if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `--option --value` or `--option -v` option `option=--value` or `option=-v` if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `-o` option `o=true`
     * - `--o=value` or `-o:value` option `o=value`
     * - `--o=value` or `-o:value` option `o=value`
     * - `-o value`  option `o=value` option `o=value` if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `-o --value` or `-o -v`  option `o=--value` or `o=-v`  if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * @param {string|ArgvObject|ArgvArray|Array} patterns где string - where string is the command line
     * where Array- Argv array of command line parameters
     * Patterns commands:
     * - `command1  command2 command3` -  the following command order must be present - `command1 command2 command3`.
     * - `command  * *` the following command order must be present - `command  any_string_without_spaces "any string"`
     * -  `command /hello|bay/i`  the following command order must be present - `command hello` or `command bay`, according to regular expressions.
     * Patterns option:
     *  - `--option` - option `option=true`
     *  - `--option=value` option `option=value` where 'value' solid_string | "string from space" | * | / regular_exr /
     *  - `-o` - option `o=true`
     *  - `-o=value` option `o=value` where 'value' solid_string | "string from space" | * | / regular_exr /
     *  - `-abc` - options `a=true b=true c=true`
     *  - `-abc=value` - options `a=true b=true c=value`  where 'value' solid_string | "string from space" | * | / regular_exr /
     *  - `[-o --option]` or `[--option -o]`- option `option=true` or short `o=true`
     *  - `[-o --option value]` or `[--option value]` or `[-o value]`  - option `option=value` or short `o=value` where 'value' solid_string | string from space | "string from space" | * | / regular_exr /
     * @param {boolean|Array} diff if false, then if there is no parameter in the pattern, it will throw an error,
     * if Array, then the missing parameter will be added to the diff array
     * @returns {ArgvArray}  returns the intersection with the pattern
     * @throws Error Throws an error if the parameter is set to a pattern and does not match the pattern.
     * also throws an error if diff = false - no pattern for the parameter
     */

    static compareArgvToPatterns(patterns,argv,diff=true){
        if(!(argv instanceof ArgvArray)){
            argv=new ArgvArray(argv); //this.parse(argv);
        }
        if(!(patterns instanceof ArgvArray)){
            patterns=new ArgvArray(patterns);//this.parse(patterns);
        }
        let intersect=new ArgvArray();
        //let diff=new ArgvArray();
        let check=false;
        let argvCommandKey=0,patternCommandKey=0;
        let errors=[];
        for(let key=0; key<argv.length; key++){
            if(argv[key].type==='command'){argvCommandKey++;}
            patternCommandKey=0;
            let param=new Argv.elementClass(argv[key]);
            check=false;
            for(let pkey=0; pkey<patterns.length; pkey++){
                for(let prop of Object.keys(patterns[pkey])){
                    if(['type','key','shortKey','value','order'].includes(prop)){ continue;}
                    param[prop]=param[prop]??patterns[pkey][prop];
                }
                if(patterns[pkey].type==='command'){patternCommandKey++;}
                if(argvCommandKey===patternCommandKey && argv[key].type==='command' && patterns[pkey].type==='command'){
                    let pattern = patterns[pkey].key;
                    if(pattern instanceof RegExp ){
                        if(typeof param.key ==='string' && pattern.test(param.key)){
                            check=true;
                            param.pattern=patterns[pkey];
                            intersect.push(param);
                            break;
                        } else {
                            let message= patterns[pkey].errorMessage ?? `Parameter (${key+1})  "${param.key}"  does not match  "${pattern.toString()}" pattern.`;
                            errors.push(message);
                            //throw new Error(message);
                        }
                    } else
                    if((pattern === "*" || pattern === param.key)){
                        check=true;
                        param.pattern=patterns[pkey];
                        intersect.push(param);
                        break
                    } else {
                        let message= patterns[pkey].errorMessage ??`Parameter (${1+key})  "${param.key}"  does not match  "${pattern}".`;
                        errors.push(message);
                        //throw new Error(message);
                    }
                } else
                if(
                    argv[key].type==='option' && patterns[pkey].type==='option' &&
                    ( argv[key].key !== undefined && argv[key].key===patterns[pkey].key ||
                    argv[key].shortKey!==undefined && argv[key].shortKey===patterns[pkey].shortKey )
                ){
                    let pattern= patterns[pkey].value;
                    //let matchs=null;
                    let tp=typeof pattern;
                    let nextParam=argv[key+1];
                    let shift=0;
                    param.key=patterns[pkey].key??param.key;
                    param.shortKey=patterns[pkey].shortKey??param.shortKey;
                    let prefix='';
                    if(param.key!==undefined){
                        prefix='--';
                    } else {
                        prefix='-';
                    }
                    if(!['boolean'].includes(tp) && typeof param.value ==='boolean' && nextParam!==undefined){
                        param.value=nextParam.key??nextParam.shortKey;
                        shift=1;
                    }
                    if(pattern instanceof RegExp ){
                        if(typeof param.value ==='string' && pattern.test(param.value)){
                            check=true;
                            intersect.push(param);
                            break;
                        } else {
                            let message= param.errorMessage ??`The value "${param.value}" of "${prefix}${param.key??param.shortKey}" option (parameter ${key+1}) does not match "${pattern.toString()}" pattern.`;
                            //throw new Error(message);
                            errors.push(message);
                        }
                    } else
                    if((pattern==="*" || pattern == param.value)){
                        check=true;
                        intersect.push(param);
                        break;
                    } else {
                        let message= param.errorMessage ??`The value "${param.value}" of "${prefix}${param.key??param.shortKey}" option (parameter ${key+1}) does not match "${pattern}".`;
                        //throw new Error(message);
                        errors.push(message);
                    }
                    key+=shift;
                }
            }
            if(check===false){
                if(diff===false){
                    let prefix='';
                    if(param.type==='option'){
                        if(param.key!==undefined){
                            prefix='--';
                        } else {
                            prefix='-';
                        }
                    }
                    let message=`The "${prefix}${param.key??param.shortKey}" parameter is undefined.`;
                    errors.push(message);
                    //throw new Error(`The ${prefix}"${param.key??param.shortKey}" parameter is undefined.`);
                } else  if(diff instanceof Array){
                    diff.push(param);
                }
            }
        }
        argvCommandKey=0;
        patternCommandKey=0;
        check=false;
        for(let pkey=0; pkey<patterns.length; pkey++){
            if(patterns[pkey].type==='command'){patternCommandKey++;}
             argvCommandKey=0;
             check=false;
             for(let key=0; key<intersect.length; key++){
                 if(intersect[key].type==='command'){argvCommandKey++;}
                 if(
                     intersect[key].type==='command' && patterns[pkey].type==='command' && argvCommandKey===patternCommandKey ||
                     intersect[key].type==='option' && patterns[pkey].type==='option' &&
                     (
                         patterns[pkey].key!==undefined && patterns[pkey].key === intersect[key].key ||
                         patterns[pkey].shortKey!==undefined && patterns[pkey].shortKey === intersect[key].shortKey
                     )

                 ){
                     check=true;
                     break;
                 }
             }
             if(check===false){
                if(patterns[pkey].default!==undefined){
                    let param=new Argv.elementClass();
                    for(let prop of Object.keys(patterns[pkey])){
                        if(['key','shortKey','value','order'].includes(prop)){continue;}
                        param[prop]=patterns[pkey][prop];
                    }
                    if(patterns[pkey].type==='command'){
                        param.key=patterns[pkey].default;
                    } else if(patterns[pkey].type==='option'){
                        param.key=patterns[pkey].key;
                        param.shortKey=patterns[pkey].shortKey;
                        param.value=patterns[pkey].default;
                    }
                    intersect.push( param );
                } else if(patterns[pkey].required){
                    let message;
                    if(patterns[pkey].type==='command'){
                        message=` ${patternCommandKey} command position is required.`;
                    } else if(patterns[pkey].type==='option'){
                        let prefix=patterns[pkey].key!==undefined?'--':'-';
                        message=`"${prefix}${patterns[pkey].key??patterns[pkey].shortKey}" parameter is required.`;
                    }
                    errors.push(message);
                }
             }
        }
        if(errors.length>0){
            throw new Error("\n"+'Error:'+errors.join("\nError:"));
        }
        return intersect;
    }
}
Argv.elementClass=ArgvElement;
{
    let element=ArgvElement;
    Object.defineProperty(Argv,'elementClass',{
        enumerable:false,
        configurable:true,
        get(){
            return element;
        },
        set(v){
            if(typeof v==='function' && ArgvElement.isPrototypeOf(v)){
                element=v;
            } else if(v===null){
                element=ArgvElement;
            }else {
                throw new Error('The value does not belong to the ArgvElement class');
            }
        }
    });
}