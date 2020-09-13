/**
 * @module @alexeyp0708/argv_patterns
 * 
 */
import {ArgvElement,ArgvArray,ArgvObject} from './export.js';

/**
 *  Class Argv implements static methods to use them in [array .ArgvArray],[object .ArgvObject],[object .ArgvPattern]
 */
export class Argv {
    
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
     * Argv elements parse. Converts an argv element string to an [object .ArgvElement]
     * @param {string} str Argv element string. Example: `--option value`.
     * @returns {ArgvElement[]} Since the argv element can contain a set of options (-abcd = value), an array is always returned
     * @example
     * Argv.parseElement('--option=value');
     * //result
     * [
     *      "[object ArgvElement]"
     * ]
    */
    static parseElement(str){
        let result =[];
        if(str[0]==='[' && str[str.length-1]===']'){
            let params=new Argv.elementClass();
            let match=str.match(/^\[[\s]*([!])?[\s]*(-[\w]{1}|--[\w]+|[^'"\s]+|["'][\S\s]+?["'])(?:[\s]+(-[\w]{1}|--[\w]+)|)(?:[\s]+([^"'\s]+|["'][\S\s]+?["'])|)(?:[\s]+([^"'\s]+|["'][\S\s]+?["'])|)[\s]*\]$/);
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
     * Parses the command line or argv parameter array and returns an [array .ArgvArray].
     * @param {string[]|array[]|string} argv  Array type- argv parameters set. String type -parameters command line.
     * If an array element is an array, then this array is considered to be a set of command parameters and all its elements will be embedded in the existing array set.
     * Warning: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * @returns {ArgvArray}   A collection of [object .ArgvElement]
     * @throws
     * Error: Bad parameters - syntactically bad parameter or poorly constructed command line  
     */
    static parse(argv) {
        if (typeof argv === 'string') {
            argv=Argv.parseCommand(argv);
        }
        let result = new ArgvArray();
        let errors=[];
        let order=0;
        for (let key=0;key<argv.length;key++) {
            let arg=argv[key];
            if(arg instanceof Array){
                argv.splice(key,1,...arg);
                key--;
                continue;
            }
            if(typeof arg ==='string'){
                try{
                    arg=this.parseElement(arg);
                    arg.forEach((value)=>{
                        if(value.type==='command' && value.order===undefined){
                            order++;
                            Object.defineProperty(value,'order',{
                                enumerable:true,
                                value:order
                            });
                        }
                        result.add(value);
                    });
                }catch(e){
                    errors.push(e.message);
                }
            } else {
                if(arg.type==='command' &&  arg.order===undefined){
                    order++;
                    Object.defineProperty(arg,'order',{
                        enumerable:true,
                        value:order
                    });
                }
                result.add(arg);
            }
        }
        if(errors.length>0){
            throw new Error("Bad parameters:\n"+errors.join(" "));
        }
        return result;
    }

    /**
     *  Converting [object .ArgvElement]  elements  from [array .ArgvArray] to string parameters  array
     * @param {ArgvArray|ArgvObject} argv 
     * @returns {string[]}
     * @throws
     * Error: Bad argument - Invalid argument  
     */
    static elementsToArray(argv){
        let result=[];
        if(!(argv instanceof ArgvArray) && !(argv instanceof ArgvObject)){
            throw new Error('Bad argument. Must be [object ArgvArray] or [object ArgvObject]');
        }
        if(argv instanceof ArgvObject){
            argv=argv.toArray();
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
     * Converting [object .ArgvElement]  elements from [array .ArgvArray] to command line
     * @param {ArgvArray|ArgvObject} argv
     * @returns {string}
     * @throws
     * Error: Bad argument - Invalid argument  
     */
    static elementsToString(argv){
        if(!(argv instanceof ArgvArray) && !(argv instanceof ArgvObject)){
            throw new Error('Bad argument. Must be [object ArgvArray] or [object ArgvObject]');
        }
        return this.elementsToArray(argv).join(' ');
    }

    /**
     * Converting [object ArgvElement]  elements  from [array ArgvArray] to command line pattern
     * @param {ArgvArray|ArgvObject} argv
     * @returns {string} Returns the assembled pattern
     * @throws
     * Error: Bad argument - Invalid argument
     * 
     * @see [ArgvArray](module-ArgvArray.ArgvArray.html)
     * @see [ArgvObject](module-ArgvObject.ArgvObject.html)
     */
    static elementsToPattern(argv){
        let result=[];
        if(!(argv instanceof ArgvArray) && !(argv instanceof ArgvObject)){
            throw new Error('Bad argument. Must be [object ArgvArray] or [object ArgvObject]');
        }
        if(argv instanceof ArgvObject){
            argv=argv.toArray();
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
     * Converting [array .ArgvArray] to [object .ArgvObject]
     * @param {ArgvArray} argv
     * @returns {ArgvObject}
     */
    static elementsToObject(argv){
        let result=new ArgvObject();
        if(!(argv instanceof ArgvArray)){
            throw new Error('Bad argument. Must be [object ArgvArray]');
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
     * Converting [object .ArgvObject] to [array .ArgvArray]
     * @param {ArgvObject} argv
     * @returns {ArgvArray}
     * @throws
     * Error: Bad argument - Invalid argument.  
     */
    static objectToArray (argv){
        if(!argv instanceof ArgvObject ){
            throw new Error('Bad argument. Must be [object ArgvObject] ');
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
     * Matches the argv parameters with the pattern, and returns the matches in [array .ArgvArray].
     * @param {string|Array|ArgvArray} argv - Where string is the command line.
     * Where Array- Argv array of command line parameters.  
     * Command line:
     * - `command1 command2`
     * - `command "string from space"`   or   `command 'string from space'`. Warn: quotes ( " and ') inside quotes are not recognized when parsing a string.
     * - `--option`  => `option=true`
     * - `--option=value` or `--option:value` => `option=value`
     * - `--option value` => `option=value` if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `--option --value` or `--option -v` option `option=--value` or `option=-v` if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `-o` option `o=true`
     * - `--o=value` or `-o:value` => `o=value`
     * - `--o=value` or `-o:value` => `o=value`
     * - `-o value`  => `o=value`  if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * - `-o --value` or `-o -v`  => `o=--value` or `o=-v`  if the parameter in the pattern is set to value (string|"string from space"|* |/regular expr/)
     * @param {string|Array|ArgvArray} patterns  Where string is the command line. Where Array- Argv array of command line parameters.  
     * Command patterns:
     * - `command1  command2 command3` -  the following command order must be present - `command1 command2 command3`.
     * - `command  * *` the following command order must be present - `command  any_string_without_spaces "any string"`
     * -  `command /hello|bay/i`  the following command order must be present - `command hello` or `command bay`, according to regular expressions.  
     * Option patterns:  
     *  - `--option` => `option=true`
     *  - `--option=value` => `option=value` where 'value' `solid_string | "string from space" | * | / regular_exr /`
     *  - `-o` => `o=true`
     *  - `-o=value` => `o=value` where 'value' solid_string | "string from space" | * | / regular_exr /
     *  - `-abc` => `a=true b=true c=true`
     *  - `-abc=value` => `a=true b=true c=value`  where 'value' `solid_string | "string from space" | * | / regular_exr /`
     *  - `[-o --option]` or `[--option -o]` => `option=true` or short `o=true`
     *  - `[-o --option value]` or `[--option value]` or `[-o value]` => `option=value` or short `o=value` where 'value' `solid_string | string from space | "string from space" | * | / regular_exr /`
     * @param {boolean|Array} diff If set to false, it will give an error if the parameter set by the template is missing. If set empty array, then the missing parameter will be added to this array.
     * @returns {ArgvArray}  parameters intersected with the pattern
     * @throws
      * Error: Bad parameters - syntactically bad parameter or poorly constructed command line.  
      * Error: Throws an error if the parameter is set according to the pattern, but does not match the criteria of the pattern.  
      * Error: Throws an error if an extra parameter is passed. Throws an error if diff argument is false.  
      * Error: Throws an error if the parameter is required according to the pattern, but it is missing and the default value is not set in the pattern.
      * @see [ArgvArray](module-ArgvArray.ArgvArray.html)
      * @see [ArgvPattern](module-ArgvPattern.ArgvPattern.html)
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
        let help=argv.get('[--help -h]');
        for(let key=0; key<argv.length; key++){
            if(argv[key].type==='command'){argvCommandKey++;}
            if(argv[key].type==='option' && argv[key].key==='help'){
                continue;
            }
            patternCommandKey=0;
            let param=new Argv.elementClass(argv[key]);
            check=false;
            for(let pkey=0; pkey<patterns.length; pkey++){
                if(patterns[pkey].type==='command'){patternCommandKey++;}
                if(patterns[pkey].type==='option' && patterns[pkey].key==='help'){
                    continue;
                }
                if(argvCommandKey===patternCommandKey && argv[key].type==='command' && patterns[pkey].type==='command'){
                    let pattern = patterns[pkey].key;
                    for(let prop of Object.keys(patterns[pkey])){
                        if(['type','key','shortKey','value','order'].includes(prop)){ continue;}
                        param[prop]=param[prop]??patterns[pkey][prop];
                    }
                    if(pattern instanceof RegExp ){
                        if(typeof param.key ==='string' && pattern.test(param.key)){
                            check=true;
                            param.pattern=patterns[pkey];
                            intersect.push(param);
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
                    } else {
                        let message= patterns[pkey].errorMessage ??`Parameter (${1+key})  "${param.key}"  does not match  "${pattern}".`;
                        errors.push(message);
                        //throw new Error(message);
                    }
                    break;
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
                    for(let prop of Object.keys(patterns[pkey])){
                        if(['type','key','shortKey','value','order'].includes(prop)){ continue;}
                        param[prop]=param[prop]??patterns[pkey][prop];
                    }
                    check=true;
                    param.pattern=patterns[pkey];
                    intersect.push(param);
                    if(pattern instanceof RegExp ){
                        if(typeof param.value !=='string' || !pattern.test(param.value)){
                            let message= param.errorMessage ??`The value "${param.value}" of "${prefix}${param.key??param.shortKey}" option (parameter ${key+1}) does not match "${pattern.toString()}" pattern.`;
                            //throw new Error(message);
                            errors.push(message);
                        }
                    } else
                    if((pattern!=="*" && pattern != param.value)){
                        let message= param.errorMessage ??`The value "${param.value}" of "${prefix}${param.key??param.shortKey}" option (parameter ${key+1}) does not match "${pattern}".`;
                        //throw new Error(message);
                        errors.push(message);
                    } 
                    key+=shift;
                    break;
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
                        if(['key','shortKey','value'].includes(prop)){continue;}
                        param[prop]=patterns[pkey][prop];
                    }
                    param.pattern=patterns[pkey];
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
        if(help){
            let helpPattern=patterns.get('[--help -h]');
            let descriptions={};
            if(helpPattern){
                descriptions=helpPattern.descriptions;
            }
            let message=Argv.getHelp(argv,patterns,descriptions);
            Object.defineProperty(help,'helpMessage',{
                enumerable:true,
                configurable:true,
                writable:true,
                value:message
            });
            intersect.push(help);
        } else
        if(errors.length>0){
            throw new Error("\n"+'Error:'+errors.join("\nError:"));
        }
        return intersect;
    }

    /**
     * 
     * @param argv
     * @param pattern
     * @param {object} descriptions
     * {
     *     '-':'this desc', 
     *     '#':1 // order for command
     * }
     * @returns {*}
     */
    static getHelp(argv,pattern,descriptions={}){
        if(!argv.get('[--help -h]')){return false;}
        if(argv.length<=1){
            argv= pattern;
        }
        let order=0;
        let recurs=(desc,prefix='')=>{
            let messages=[];
            if(desc instanceof Object){
                if(desc['-']!==undefined){
                    messages.push(recurs(desc['-'],`${prefix}`));
                }
                let check=false;
                for(let prop in desc) {
                    if(['-'].includes(prop)){continue;}
                    let element;
                    for (let key = 0; key < argv.length; key++) {
                        element=argv[key];
                        if( element.type==='option' && prop[0]==='-'){
                            let name=element.key?`--${element.key}`:`-${element.shortKey}`;
                            if(name===prop){
                                messages.push(recurs(desc[prop],`${prefix}[${prop}]`));
                                check=true;
                                break;
                            }
                        } else if(element.type==='command' && prop[0]!=='-'){
                            order++;
                            if(element.order === order && (element.key instanceof RegExp && element.key.test(prop) || element.key==='*' || element.key.toString()===prop)){
                                messages.push(recurs(desc[prop],`${prefix}[${prop}]`));
                                check=true;
                                order--;
                                break;
                            }
                            order--;
                        }
                    }
                }
                if(!check){
                    for(let prop in desc) {
                        if(['-'].includes(prop)){continue;}
                        messages.push(recurs(desc[prop],`${prefix}[${prop}]`));
                    }
                }
            } else {
                if(prefix.trim()===''){
                    messages=[`${desc}`];
                } else{
                    messages=[`${prefix}  =>   ${desc}`];
                }
            }
            if(messages.length===0){
                messages.push(`${prefix} =>  Описание параметров отсутствует.`);
            }
            return messages.join("\n");
        };
        for(let key=0;key<argv.length;key++){
            let element=argv[key];
            if(element.descriptions!==undefined){
                descriptions=Object.assign(descriptions,element.descriptions);
                // сделать рекурсивное обьеденение
            }
        }
        return recurs(descriptions);
    }
}

/**
 * Using this property, you can replace the class [object .ArgvElement] the advanced class
 * If Argv.elementClass = null, then  [class .ArgvElement] will be set by default
 * @type {ArgvElement} 
 * @throws 
 * Error: Class does not belong to [class .ArgvElement]  
 * @example
 * class ExtArgvElement extends ArgvElement {}
 * Argv.elementClass=ExtArgvElement;
 * let argv=new ArgvArray('command --option');
 * argv[0] instanceof ExtArgvElement // true
 */
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