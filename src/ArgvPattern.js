/**
 * @module @alexeyp0708/argv_patterns
 */
import {ArgvArray} from './export.js';

/**
 *  Class ArgvPattern create array containing  [object .ArgvElement] elements which are patterns
 * @extends @.ArgvArray
 */
export class ArgvPattern extends ArgvArray {
    constructor(...args) {
        try {
            super(...args);
        } catch (e) {
            if (/^Bad parameters:/.test(e.old_message)) {
                let message = e.old_message +
                    "\nParameters format should be for pattern:\n" +
                    "   command" +
                    "   * (any command)\n" +
                    "   /pattern/i  (regular expression for command)\n" +
                    "   [pattern_command default_command]  \n" +
                    "   [! pattern_command] (required pattern_command) \n" +
                    "   [-k --key value]\n" +
                    "   [-k value]\n" +
                    "   [--key value]\n" +
                    "   [-k --key]\n" +
                    "   [! -k --key \"value string\" \"default value\"]\n" +
                    "   -k\n" +
                    "   -k = value\n" +
                    "   -k : value\n" +
                    "   --key = value\n" +
                    "   --key : value\n" +
                    "   -abcd (equivalent \"-a -b -c -d )\n" +
                    "   -abcd = value (equivalent \"-a -b -c -d = value\").\n";
                let ne = new Error(message);
                ne.old_message = e.message;
                throw ne;
            }
            throw e;
        }
    }

    /**
     * Matches the argv parameters with the pattern, and returns the matches in [array .ArgvArray]. 
     * See [method .Argv.compareArgvToPatterns].
     * @param {string|Array|ArgvArray} argv  argv parameters
     * @param diff  If set to false, it will give an error if the parameter set by the template is missing. 
     * If set empty array, then the missing parameter will be added to this array.
     * @returns {ArgvArray}
     */
    compare(argv, diff) {
        return ArgvPattern.compareArgvToPatterns(this, argv, diff);
    }

    /**
     * Converting pattern array to string
     * @returns {string}
     */
    toString() {
        return ArgvPattern.elementsToPattern(this);
    }

    /**
     * Converting [object ArgvElement]  elements  from [array ArgvArray] to command line pattern
     * @param {ArgvArray} argv
     * @returns {string} Returns the assembled pattern
     * @throws
     * Error: Bad argument - Invalid argument
     *
     * @see [ArgvPattern](module-ArgvArray.ArgvArray.html)
     */
    static elementsToPattern(argv) {
        let result = [];
        if (!(argv instanceof ArgvArray)) {
            throw new Error('Bad argument. Must be [object ArgvArray] or [object ArgvObject]');
        }
        for (let param of argv) {
            if (param.type === 'command') {
                let key = param.key;// instanceof RegExp?param.key.toString():param.key;
                if (/[\s]/.test(key)) {
                    key = `"${key}"`;
                }
                if (param.default !== undefined || param.required !== undefined && param.required !== false) {
                    key = `[${param.required ? '!' : ''} ${key} ${param.default ? '"' + param.default + '" ' : ''}]`;
                }
                result.push(key);
            } else {
                let value = param.value;// instanceof RegExp?param.value.toString():param.value;
                if (/[\s]/.test(value)) {
                    value = `"${value}"`;
                }
                let str;
                if (param.key !== undefined && param.shortKey !== undefined ||
                    param.default !== undefined ||
                    param.required !== undefined && param.required !== false) {
                    let key = param.key !== undefined ? `--${param.key} ` : '';
                    let shortKey = param.shortKey !== undefined ? `-${param.shortKey} ` : '';
                    str = `[${param.required ? '!' : ''} ${key}${shortKey}${value} ${param.default ? '"' + param.default + '" ' : ''}]`;
                } else {
                    if (param.key !== undefined) {
                        str = '--' + param.key;
                    } else if (param.shortKey !== undefined) {
                        str = '-' + param.shortKey;
                    }
                    str += `=${value}`;
                }
                result.push(str);
            }
        }
        return result.join(' ');
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
     * @param {string|Array|ArgvPattern} patterns  Where string is the command line. Where Array- Argv array of command line parameters.
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
     * @returns {ArgvArray} parameters that intersect with the pattern
     * @throws
     * Error: Bad parameters - syntactically bad parameter or poorly constructed command line.
     * Error: Throws an error if the parameter is set according to the pattern, but does not match the criteria of the pattern.
     * Error: Throws an error if an extra parameter is passed. Throws an error if diff argument is false.
     * Error: Throws an error if the parameter is required according to the pattern, but it is missing and the default value is not set in the pattern.
     * @see [ArgvArray](module-ArgvArray.ArgvArray.html)
     * @see [ArgvPattern](module-ArgvPattern.ArgvPattern.html)
     */

    static compareArgvToPatterns(patterns, argv, diff = true) {
        if (!(argv instanceof ArgvArray)) {
            argv = new ArgvArray(argv); //this.parse(argv);
        }
        if (!(patterns instanceof ArgvPattern)) {
            patterns = new ArgvPattern(patterns);//this.parse(patterns);
        }
        let intersect = new ArgvArray();
        //let diff=new ArgvArray();
        let check = false;
        let argvCommandKey = 0, patternCommandKey = 0;
        let errors = [];
        let helpPattern = patterns.get('[--help -h]');
        let help = false;
        if (helpPattern) {
            help = argv.get('[--help -h]')
        }
        ;
        for (let key = 0; key < argv.length; key++) {
            if (argv[key].type === 'command') {
                argvCommandKey++;
            }
            if (argv[key].type === 'option' && argv[key].key === 'help') {
                continue;
            }
            patternCommandKey = 0;
            let param = new this.elementClass(argv[key]);
            check = false;
            for (let pkey = 0; pkey < patterns.length; pkey++) {
                if (patterns[pkey].type === 'command') {
                    patternCommandKey++;
                }
                if (patterns[pkey].type === 'option' && patterns[pkey].key === 'help') {
                    continue;
                }
                if (argvCommandKey === patternCommandKey && argv[key].type === 'command' && patterns[pkey].type === 'command') {
                    let pattern = patterns[pkey].key;
                    for (let prop of Object.keys(patterns[pkey])) {
                        if (['type', 'key', 'shortKey', 'value', 'order'].includes(prop)) {
                            continue;
                        }
                        param[prop] = param[prop] ?? patterns[pkey][prop];
                    }
                    if (pattern instanceof RegExp) {
                        if (typeof param.key === 'string' && pattern.test(param.key)) {
                            check = true;
                            param.pattern = patterns[pkey];
                            intersect.push(param);
                        } else {
                            let message = patterns[pkey].errorMessage ?? `Parameter (${key + 1})  "${param.key}"  does not match  "${pattern.toString()}" pattern.`;
                            errors.push(message);
                            //throw new Error(message);
                        }
                    } else if ((pattern === "*" || pattern === param.key)) {
                        check = true;
                        param.pattern = patterns[pkey];
                        intersect.push(param);
                    } else {
                        let message = patterns[pkey].errorMessage ?? `Parameter (${1 + key})  "${param.key}"  does not match  "${pattern}".`;
                        errors.push(message);
                        //throw new Error(message);
                    }
                    break;
                } else if (
                    argv[key].type === 'option' && patterns[pkey].type === 'option' &&
                    (argv[key].key !== undefined && argv[key].key === patterns[pkey].key ||
                        argv[key].shortKey !== undefined && argv[key].shortKey === patterns[pkey].shortKey)
                ) {
                    let pattern = patterns[pkey].value;
                    let tp = typeof pattern;
                    let nextParam = argv[key + 1];
                    let shift = 0;
                    param.key = patterns[pkey].key ?? param.key;
                    param.shortKey = patterns[pkey].shortKey ?? param.shortKey;
                    let prefix = '';
                    if (param.key !== undefined) {
                        prefix = '--';
                    } else {
                        prefix = '-';
                    }
                    if (!['boolean'].includes(tp) && typeof param.value === 'boolean' && nextParam !== undefined) {
                        param.value = nextParam.key ?? nextParam.shortKey;
                        shift = 1;
                    }
                    for (let prop of Object.keys(patterns[pkey])) {
                        if (['type', 'key', 'shortKey', 'value', 'order'].includes(prop)) {
                            continue;
                        }
                        param[prop] = param[prop] ?? patterns[pkey][prop];
                    }
                    check = true;
                    param.pattern = patterns[pkey];
                    intersect.push(param);
                    if (pattern instanceof RegExp) {
                        if (typeof param.value !== 'string' || !pattern.test(param.value)) {
                            let message = param.errorMessage ?? `The value "${param.value}" of "${prefix}${param.key ?? param.shortKey}" option (parameter ${key + 1}) does not match "${pattern.toString()}" pattern.`;
                            //throw new Error(message);
                            errors.push(message);
                        }
                    } else if ((pattern !== "*" && pattern != param.value)) {
                        let message = param.errorMessage ?? `The value "${param.value}" of "${prefix}${param.key ?? param.shortKey}" option (parameter ${key + 1}) does not match "${pattern}".`;
                        //throw new Error(message);
                        errors.push(message);
                    }
                    key += shift;
                    break;
                }
            }
            if (check === false) {
                if (diff === false) {
                    let prefix = '';
                    if (param.type === 'option') {
                        if (param.key !== undefined) {
                            prefix = '--';
                        } else {
                            prefix = '-';
                        }
                    }
                    let message = `The "${prefix}${param.key ?? param.shortKey}" parameter is undefined.`;
                    errors.push(message);
                    //throw new Error(`The ${prefix}"${param.key??param.shortKey}" parameter is undefined.`);
                } else if (diff instanceof Array) {
                    diff.push(param);
                }
            }
        }
        argvCommandKey = 0;
        patternCommandKey = 0;
        check = false;
        for (let pkey = 0; pkey < patterns.length; pkey++) {
            if (patterns[pkey].type === 'command') {
                patternCommandKey++;
            }
            argvCommandKey = 0;
            check = false;
            for (let key = 0; key < intersect.length; key++) {
                if (intersect[key].type === 'command') {
                    argvCommandKey++;
                }
                if (
                    intersect[key].type === 'command' && patterns[pkey].type === 'command' && argvCommandKey === patternCommandKey ||
                    intersect[key].type === 'option' && patterns[pkey].type === 'option' &&
                    (
                        patterns[pkey].key !== undefined && patterns[pkey].key === intersect[key].key ||
                        patterns[pkey].shortKey !== undefined && patterns[pkey].shortKey === intersect[key].shortKey
                    )

                ) {
                    check = true;
                    break;
                }
            }
            if (check === false) {
                if (patterns[pkey].default !== undefined) {
                    let param = new this.elementClass();
                    for (let prop of Object.keys(patterns[pkey])) {
                        if (['key', 'shortKey', 'value'].includes(prop)) {
                            continue;
                        }
                        param[prop] = patterns[pkey][prop];
                    }
                    param.pattern = patterns[pkey];
                    if (patterns[pkey].type === 'command') {
                        param.key = patterns[pkey].default;
                    } else if (patterns[pkey].type === 'option') {
                        param.key = patterns[pkey].key;
                        param.shortKey = patterns[pkey].shortKey;
                        param.value = patterns[pkey].default;
                    }
                    intersect.push(param);
                } else if (patterns[pkey].required) {
                    let message;
                    if (patterns[pkey].type === 'command') {
                        message = ` ${patternCommandKey} command position is required.`;
                    } else if (patterns[pkey].type === 'option') {
                        let prefix = patterns[pkey].key !== undefined ? '--' : '-';
                        message = `"${prefix}${patterns[pkey].key ?? patterns[pkey].shortKey}" parameter is required.`;
                    }
                    errors.push(message);
                }
            }
        }
        if (help) {
            //let helpPattern=patterns.get('[--help -h]');
            let descriptions = {};
            if (helpPattern) {
                descriptions = helpPattern.descriptions;
            }
            let message = this.getHelp(argv, patterns, descriptions);
            Object.defineProperty(help, 'helpMessage', {
                enumerable: true,
                configurable: true,
                writable: true,
                value: message
            });
            intersect.push(help);
        } else if (errors.length > 0) {
            throw new Error("\n" + 'Error:' + errors.join("\nError:"));
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
     * }
     * @returns {string}
     */
    static getHelp(argv, pattern, descriptions = {}) {
        if (!argv.get('[--help -h]')) {
            return false;
        }
        if (argv.length <= 1) {
            argv = pattern;
        }
        let order = 0;
        let recurs = (desc, prefix = '') => {
            let messages = [];
            if (desc instanceof Object) {
                if (desc['-'] !== undefined) {
                    messages.push(recurs(desc['-'], `${prefix}`));
                }
                let check = false;
                for (let prop in desc) {
                    if (['-'].includes(prop)) {
                        continue;
                    }
                    let element;
                    for (let key = 0; key < argv.length; key++) {
                        element = argv[key];
                        if (element.type === 'option' && prop[0] === '-') {
                            let name = element.key ? `--${element.key}` : `-${element.shortKey}`;
                            if (name === prop) {
                                messages.push(recurs(desc[prop], `${prefix}[${prop}]`));
                                check = true;
                                break;
                            }
                        } else if (element.type === 'command' && prop[0] !== '-') {
                            order++;
                            if (element.order === order && (element.key instanceof RegExp && element.key.test(prop) || element.key === '*' || element.key.toString() === prop)) {
                                messages.push(recurs(desc[prop], `${prefix}[${prop}]`));
                                check = true;
                                order--;
                                break;
                            }
                            order--;
                        }
                    }
                }
                if (!check) {
                    for (let prop in desc) {
                        if (['-'].includes(prop)) {
                            continue;
                        }
                        messages.push(recurs(desc[prop], `${prefix}[${prop}]`));
                    }
                }
            } else {
                if (prefix.trim() === '') {
                    messages = [`${desc}`];
                } else {
                    messages = [`${prefix}  =>   ${desc}`];
                }
            }
            if (messages.length === 0) {
                messages.push(`${prefix} => There is no description of the parameters.`);
            }
            return messages.join("\n");
        };
        let recurs2 = (e_descs, descs) => {
            for (let prop in e_descs) {
                if (prop === '-') {
                    descs[prop] = e_descs[prop];
                    continue;
                }
                if (typeof e_descs[prop] === 'string') {
                    e_descs[prop] = {'-': e_descs[prop]}
                }
                if (descs[prop] !== undefined) {
                    if (typeof descs[prop] === 'string') {
                        descs[prop] = {'-': descs[prop]}
                    }
                    recurs2(e_descs[prop], descs[prop]);
                } else {
                    descs[prop] = e_descs[prop];
                }
            }
        };
        for (let key = 0; key < argv.length; key++) {
            let element = argv[key];
            if (element.descriptions !== undefined) {
                let e_descs = element.descriptions;
                if (typeof e_descs === 'string') {
                    e_descs = {'-': e_descs};
                }
                recurs2(e_descs, descriptions);
            }
        }
        return recurs(descriptions);
    }
}