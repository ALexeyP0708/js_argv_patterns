import {ArgvArray, ArgvElement} from "../../src/export.js";

QUnit.module('Test ArgArray class');
QUnit.test('test methods', function (assert) {

    {
        //ArgArray.parseCommand method
        {
            let match = [
                'command1',
                '[-o --option value string]',
                '-abc=100',
                '--option1=brackets test',
                '--option2',
                'command2'
            ];
            let result = ArgvArray.parseCommand('command1 [-o --option value string]  -abc=100  --option1="brackets test" --option2 command2');

            assert.propEqual(result, match, 'ArgArray.parseCommand method');
        }

    }


    // ArgvArray.parse method
    {
        let match = [
            {
                type: 'command',
                key: 'command1',
                order: 1
            },
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
                value: '100'
            },
            {
                type: 'option',
                key: 'option1',
                value: 'brackets test'
            },
            {
                type: 'option',
                key: 'option2',
                value: true
            },
            {
                type: 'command',
                key: 'command2',
                order: 2
            }
        ];
        let result = ArgvArray.parse('command1  -abc=100  --option1="brackets test" --option2 command2');
        assert.deepEqual(result, match, 'ArgvArray.parse method');
        let result2 = ArgvArray.parse(['command1', '-abc=100', '--option1=brackets test', '--option2', 'command2']);
        assert.deepEqual(result2, match, 'ArgvArray.parse method 2');
    }

    // ArgvArray.parse method 2 -identical commands
    {
        let match = [
            {
                type: 'command',
                key: 'command1',
                order: 1
            },
            {
                type: 'option',
                shortKey: 'a',
                value: true
            },
            {
                type: 'command',
                key: 'command1',
                order: 2
            },
            {
                type: 'command',
                key: 'command1',
                order: 3
            }
        ];
        let result = ArgvArray.parse('command1  -a  command1 command1');
        assert.deepEqual(result, match, 'ArgvArray.parse method -identical commands');
    }
    
    // elementsToArray method
    {
        let argv=new ArgvArray('command1  -a  command1 command1');
        argv=argv.toArray();
        console.log();
        let match=[
                "command1",
                "-a",
                "command1",
                "command1"
            ];
        assert.propEqual(argv, match, 'ArgvArray.parse method -identical commands');
    }
    //ArgvArray.elementsToString method
    {
        let match = 'command1 -a -c="100" --option1="brackets test" --option2 command2';
        let params = new ArgvArray('command1  -ab=false -c=100  --option1="brackets test" --option2 command2');
        let result = ArgvArray.elementsToString(params);
        assert.equal(result, match, 'ArgvArray.elementsToString method');
    }

    // ArgvArray.elementClass get/set
    {
        class A extends ArgvElement {
        };
        ArgvArray.elementClass = A;
        assert.equal(ArgvArray.elementClass, A, 'ArgvArray.elementClass set/get');
        ArgvArray.elementClass = null;
        assert.equal(ArgvArray.elementClass, ArgvElement, 'ArgvArray.elementClass - reset');
    }

    // ArgvArray.elementClass
    {
        assert.throws(function () {
            ArgvArray.elementClass = class A {
            };
        }, function (e) {
            return e.message === "The value does not belong to the ArgvElement class";
        }, 'ArgvArray.elementClass error');
    }
    // ArgvArray.constructor method
    {
        let match = [
            new ArgvElement({type: 'command', key: 'command', order: 1}),
            new ArgvElement('--option'),
            new ArgvElement('-o=value')
        ];
        let result = new ArgvArray('command --option -o=value');
        assert.deepEqual(result, match, 'ArgvArray.constructor (arg1 type string)');
        result = new ArgvArray(['command', '--option', '-o=value']);
        assert.deepEqual(result, match, 'ArgvArray.constructor (arg1 type Array)');
        result = new ArgvArray('command', '--option', '-o=value');
        assert.deepEqual(result, match, 'ArgvArray.constructor (args type Array)');
        result = new ArgvArray([['command', '--option'], [['command2', '--option2'], ['command3', '--option3']]]);
        match = [
            new ArgvElement({type: 'command', key: 'command', order: 1}),
            new ArgvElement('--option'),
            new ArgvElement({type: 'command', key: 'command2', order: 2}),
            new ArgvElement('--option2'),
            new ArgvElement({type: 'command', key: 'command3', order: 3}),
            new ArgvElement('--option3')
        ];
        assert.deepEqual(result, match, 'ArgvArray.constructor (args type Array[])');
    }

    // ArgvArray.searchElement method
    {

        let argv = new ArgvArray('command1', 'command1', 'command2', '--option1=value1', '--option2=value2', '-a=value2', '-b=value1');
        assert.propEqual(argv.searchElement({order: 1}), [argv[0]], ' ArgvArray.searchElement method -test commands 1');
        assert.propEqual(argv.searchElement({key: 'command1'}), [argv[0], argv[1]], ' ArgvArray.searchElement method - test commands 2');
        assert.propEqual(argv.searchElement({key: 'command2'}, true), [argv[2]], ' ArgvArray.searchElement method - test commands 3');
        assert.propEqual(argv.searchElement({key: /command[\d]/}), [argv[0], argv[1], argv[2]], ' ArgvArray.searchElement method - test commands 4');
        assert.propEqual(argv.searchElement({
            key: /command[\d]/,
            order: 2
        }), [argv[1]], ' ArgvArray.searchElement method - test commands 5');
        assert.propEqual(argv.searchElement({key: 'command6'}), [], ' ArgvArray.searchElement method - test commands 6');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: 'option1'
        }), [argv[3]], ' ArgvArray.searchElement method - test options 1');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: 'option1',
            value: 'value1'
        }), [argv[3]], ' ArgvArray.searchElement method - test options 1');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: 'option1',
            value: /value[\d]/
        }), [argv[3]], ' ArgvArray.searchElement method - test options 2');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: /option[\d]/,
            value: /value[\d]/
        }), [argv[3], argv[4]], ' ArgvArray.searchElement method - test options 3');
        assert.propEqual(argv.searchElement({
            type: 'option',
            shortKey: /[ab]/,
            value: /value[\d]/
        }), [argv[5], argv[6]], ' ArgvArray.searchElement method - test options 4');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: /option[\d]/,
            shortKey: /[ab]/,
            value: /value[\d]/
        }), [argv[3], argv[4], argv[5], argv[6]], ' ArgvArray.searchElement method - test options 5');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: /option[\d]/,
            shortKey: /[ab]/,
            value: /^[\d]$/
        }), [], ' ArgvArray.searchElement method - test options 6');
        assert.propEqual(argv.searchElement({
            type: 'option',
            key: /option[\d]/,
            shortKey: /[ab]/,
            value: /^value[\d]$/
        }, true), [argv[3]], ' ArgvArray.searchElement method - test options 7');
    }

    // ArgvArray.get method
    {
        let argv = new ArgvArray('command1', '--option1=value');
        let match = argv.get({order: 1}) === argv[0] &&
            argv.get('command1') === argv[0] &&
            argv.get('command1', {order: 1}) === argv[0] &&
            argv.get({order: 1, key: /command1/i}) === argv[0] &&
            argv.get({typeof: 'command', key: /command1/i}) === argv[0] &&
            argv.get({typeof: 'command', key: /command2/i}) === false &&
            argv.get('command2') === false &&
            argv.get('command1', {order: 2}) === false &&
            argv.get('--option1') === argv[1] &&
            argv.get('--option1="value"') === argv[1] &&
            argv.get('--option1', {value: /value/i}) === argv[1] &&
            argv.get('--option2') === false &&
            argv.get('--option1=val') === false;
        assert.ok(match, ' ArgvArray.get method');
    }

    // ArgvArray.set method
    {
        let argv = new ArgvArray();
        argv
            .set('command', {order: 1, description: 'test command'})
            .set({
                key: 'command2',
                order: 2
            })
            .set({order: 1, key: "new_command"})
            .set({key: "new_command", description: 'Overwrite description for command'})
            .set('--option', {required: true})
            .set('-o=value')
            .set('--option', {description: 'Hello my friend'});

        let match = [
            new ArgvElement({
                type: 'command',
                key: 'new_command',
                description: 'Overwrite description for command',
                order: 1
            }),
            new ArgvElement({
                type: 'command',
                key: 'command2',
                order: 2
            }),
            new ArgvElement('[! --option ]', {description: 'Hello my friend'}),
            new ArgvElement('-o value')
        ];
        assert.deepEqual(argv, match, 'ArgvArray.set method');
    }

    // ArgvArray.add method -command order2
    {
        let argv = new ArgvArray();
        argv.add('command1', {order: 1})
            .add('--option1')
            .add('command2', {order: 1})
            .add('--option1=value');
        let match = [
            new ArgvElement('command1', {order: 1}),
            new ArgvElement('--option1'),

        ];
        assert.deepEqual(argv, match, ' ArgvArray.add method');
    }

    // Argv.toElement
    {
        let match = new ArgvElement('--option=value');
        let argv = new ArgvArray();
        assert.deepEqual(argv.toElement('--option=value'), match, 'Argv.toElement method');
    }

    // ArgvArray.toString method
    {
        let match = 'command1 -a -c="100" --option1="brackets test" --option2 command2';
        let result = new ArgvArray('command1  -ab=false -c=100  --option1="brackets test" --option2 command2');
        assert.equal(result.toString(), match, 'ArgvArray.toString method');
    }

    // ArgvArray.toObject method
/*    {
        let match = new ArgvObject(['command', 'command2', '--option', '-o=value']);
        let result = new ArgvArray(['command', '--option', '-o=value', 'command2']);
        assert.deepEqual(result.toObject(), match, 'ArgvArray.toObject method');
    }*/

    // Argv.push
    {
        let match = new ArgvArray('--option=value');
        let argv = new ArgvArray();
        argv.push('--option=value');
        assert.deepEqual(argv, match, 'Argv.push method');
    }

    // Argv.concat
    {
        let match = new ArgvArray('--option=value');
        let argv = new ArgvArray();
        argv = argv.concat(['--option=value']);
        assert.deepEqual(argv, match, 'Argv.concat method');
    }

    // Argv.unshift
    {
        let match = new ArgvArray('--option=value');
        let argv = new ArgvArray();
        argv.unshift('--option=value');
        assert.deepEqual(argv, match, 'Argv.unshift method');
    }

    // Argv.fill
    {
        let match = new ArgvArray('--option=value');
        let argv = new ArgvArray(1);
        argv = argv.fill('--option=value', 0, 1);
        assert.deepEqual(argv, match, 'Argv.fill method');
    }

    // Argv.splice
    {
        let match = new ArgvArray('--option=value');
        let argv = new ArgvArray();
        argv.splice(0, 0, '--option=value');
        assert.deepEqual(argv, match, 'Argv.splice method');
    }

    // Argv.sort
    {
        let argv = new ArgvArray('--option command1 -o --option2=value command2 command3');
        argv.sort();
        let match = new ArgvArray('command1 command2 command3 --option -o --option2=value');
        assert.deepEqual(argv, match, 'Argv.sort method');
    }
});