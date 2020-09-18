import {ArgvElement} from "../../src/export.js";

QUnit.module('Test ArgElement class');

QUnit.test('test methods', function (assert) {
    //ArgvElement.parseElement method (command)
    {
        let match = [
            {
                type: 'command',
                key: 'command',
            }
        ];
        let result = ArgvElement.parseElement('command');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (command)');
    }
    
    //ArgvElement.parseElement method (--option)
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: true
            }
        ];
        let result = ArgvElement.parseElement('--option');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option)');
    }

    //ArgvElement.parseElement method (--option=value string)
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('--option=value string');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option=value string)');
    }

    //ArgvElement.parseElement method (--option:value string)
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('--option:value string');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option:value string)');
    }

    //ArgvElement.parseElement method (--option value string)
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('--option value string');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option value string)');
    }

    //ArgvElement.parseElement method (--option value string)
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('--option value string');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option value string)');
    }

    //ArgvElement.parseElement method (--option "/regExp/")
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: /^[\s\S]*$/
            }
        ];
        let result = ArgvElement.parseElement('--option "/^[\\s\\S]*$/"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option "/regExp/")');
    }
    //ArgvElement.parseElement method (-o)
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: true
            }
        ];
        let result = ArgvElement.parseElement('-o');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-o)');
    }

    //ArgvElement.parseElement method (-o="value string")
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('-o="value string"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-o="value string")');
    }

    //ArgvElement.parseElement method (-o:"value string")
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('-o:"value string"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-o:"value string")');
    }

    //ArgvElement.parseElement method (-o "value string")
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('-o "value string"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-o "value string")');
    }

    //ArgvElement.parseElement method (-o "/regExp/")
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: /^[\s\S]*$/
            }
        ];
        let result = ArgvElement.parseElement('-o "/^[\\s\\S]*$/"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-o "/regExp/")');
    }

    //ArgvElement.parseElement method (-abc "value string")
    {
        let match = [
            {
                type: 'option',
                shortKey: 'a',
                value: true
            },
            {
                type: 'option',
                shortKey: 'b',
                value: true
            },
            {
                type: 'option',
                shortKey: 'c',
                value: 'value string'
            }
        ];
        let result = ArgvElement.parseElement('-abc "value string"');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (-abc "value string")');
    }

    //ArgvElement.parseElement method ([-o --option "value string"])
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                shortKey: 'o',
                value: 'value string'
            }
        ];
        assert.deepEqual(ArgvElement.parseElement('[-o --option "value string"]'), match, 'ArgvElement.parseElement method ([-o --option "value string"])');
        assert.deepEqual(ArgvElement.parseElement('[--option -o  "value string"]'), match, 'ArgvElement.parseElement method ([--option -o  "value string"])');
    }

    //ArgvElement.parseElement method ([--option "value string"])
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                value: 'value string'
            }
        ];
        assert.deepEqual(ArgvElement.parseElement('[--option "value string"]'), match, 'ArgvElement.parseElement method ([--option "value string"])');
    }

    //ArgvElement.parseElement method ([-o "value string"])
    {
        let match = [
            {
                type: 'option',
                shortKey: 'o',
                value: 'value string'
            }
        ];
        assert.deepEqual(ArgvElement.parseElement('[-o "value string"]'), match, 'ArgvElement.parseElement method ([-o "value string"])');
    }

    //ArgvElement.parseElement method ([-o --option])
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                shortKey: 'o',
                value: true
            }
        ];
        assert.deepEqual(ArgvElement.parseElement('[-o --option]'), match, 'ArgvElement.parseElement method ([-o --option])');
    }

    //ArgvElement.parseElement method ([--option -o "/regExp/"])
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                shortKey: 'o',
                value: /^[\s\S]*$/
            }
        ];
        let result = ArgvElement.parseElement('[--option -o "/^[\\s\\S]*$/"]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method  ([--option -o "/regExp/"])');
    }

    //ArgvElement.parseElement method ([! --option -o "value string" "default string" ])
    {
        let match = [
            {
                type: 'option',
                key: 'option',
                shortKey: 'o',
                value: 'value string',
                required: true,
                default: 'default string'
            }
        ];
        let result = ArgvElement.parseElement('[! --option -o "value string" "default string"]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method ([! --option -o "value string" "default string"]');
    }

    //ArgvElement.parseElement method ([ true ])
    {
        let match = [
            {
                type: 'command',
                key: true,
            }
        ];
        let result = ArgvElement.parseElement('[true]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method ([ true ])');
    }

    //ArgvElement.parseElement method ([ command false ])
    {
        let match = [
            {
                type: 'command',
                key: 'command',
                default: false
            }
        ];
        let result = ArgvElement.parseElement('[command false]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method ([ command false ])');
    }

    //ArgvElement.parseElement method ( false )
    {
        let match = [
            {
                type: 'command',
                key: false,
            }
        ];
        let result = ArgvElement.parseElement('false');

        assert.deepEqual(result, match, 'ArgvElement.parseElement method ( false )');
    }
    //ArgvElement.parseElement method ([ --option false ])
    {
        let match = [{
                type: 'option',
                key: 'option',
                value: false
            }];
        let result = ArgvElement.parseElement('[--option false]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method ([ --option false ])');
    }
    //ArgvElement.parseElement method ([ --option false true])
    {
        let match = [{
                type: 'option',
                key: 'option',
                value: false,
                default: true
            }
        ];
        let result = ArgvElement.parseElement('[--option false true]');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method ([ --option false true])');
    }

    //ArgvElement.parseElement method (--option=false)
    {
        let match = [{
                type: 'option',
                key: 'option',
                value: false,
            }
        ];
        let result = ArgvElement.parseElement('--option=false');
        assert.deepEqual(result, match, 'ArgvElement.parseElement method (--option=false)');
    }
});