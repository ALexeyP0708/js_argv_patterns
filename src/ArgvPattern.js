/**
 * @module @alexeyp0708/argv_patterns
 */
import {Argv, ArgvArray} from './export.js';

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
        return Argv.compareArgvToPatterns(this, argv, diff);
    }

    /**
     * Converting pattern array to string
     * @returns {string}
     */
    toString() {
        return Argv.elementsToPattern(this);
    }
}