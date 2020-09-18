import {ArgvArray, ArgvPattern} from "../../src/export.js";

QUnit.module('Test ArgPattern class');
QUnit.test('test methods', function (assert) {

    //ArgvPattern.elementsToPattern method
    {
        let match = '[! command1 "command2" ] -a=true -b=false -c=100 [! --option -o "value string" "default string" ]';
        let params = new ArgvPattern('[!command1 command2]  -ab=false -c=100 [!--option -o "value string" "default string"]');
        let result = ArgvPattern.elementsToPattern(params);
        assert.equal(result, match, 'ArgvPattern.elementsToPattern method');
    }
    // Argv.compareArgvToPatterns methods -test commands
    {
        let match = new ArgvArray('command1 command2 command3');
        let result = ArgvPattern.compareArgvToPatterns('command1 --option command2 command3', 'command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns methods -test commands');

        result = ArgvPattern.compareArgvToPatterns('command1 --option * *', 'command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns methods -test commands (*) ');

        result = ArgvPattern.compareArgvToPatterns('command1 --option /^(?:command22|command2)$/i /(?:command33|COMMAND3)/i', 'command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns methods -test commands (RegExp) ');
    }

    // Argv.compareArgvToPatterns methods -test options (--option -o)
    {
        let match = new ArgvArray('--option -o');
        let result = ArgvPattern.compareArgvToPatterns('--option -o', 'command1 --option command2 -o command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option -o)');
    }

    // Argv.compareArgvToPatterns methods -test options (--option=value -o="string value")
    {
        let match = new ArgvArray('--option=value -o="string value"');

        let result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option=value -o="string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option:"value" command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option:value -o:"string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option value -o "string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=* -o=*', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (pattern `--option=* -o=*`)');

        result = ArgvPattern.compareArgvToPatterns('--option=/value|value2/ -o="/string value|string value2/"', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (pattern `--option=/value|value2/ -o=/string value|string value2/`)');
    }

    // Argv.compareArgvToPatterns methods 2 -test options (--option=value -o="string value")
    {
        let match = new ArgvArray('--option=value -o="string value"');
        let result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option=value -o="string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option:"value" command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option:value -o:"string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=value -o="string value"', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (--option value -o "string value")');

        result = ArgvPattern.compareArgvToPatterns('--option=* -o=*', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (pattern `--option=* -o=*`)');

        result = ArgvPattern.compareArgvToPatterns('--option=/value|value2/ -o="/string value|string value2/"', 'command1 --option "value" command2 -o "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, 'Argv.compareArgvToPatterns method -test options (pattern `--option=/value|value2/ -o=/string value|string value2/`)');
    }

    // Argv.compareArgvToPatterns methods -test options (pattern `[--option -o "string value"]`)
    {
        let match = new ArgvArray('[--option -o "string value"]');
        let result = ArgvPattern.compareArgvToPatterns('[--option -o "string value"]', 'command1 command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o string value]`)');

        result = ArgvPattern.compareArgvToPatterns('[--option -o * ]', 'command1 command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o *]`)');

        result = ArgvPattern.compareArgvToPatterns('[--option -o "/string value|other value/" ]', 'command1 command2 --option "string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o /RegExp/]`)');
    }

    // Argv.compareArgvToPatterns methods -test options (pattern `[! --option -o "string value" "default value"]`)
    {
        let match = new ArgvArray('[! --option -o "default value"  "default value"]');
        let result = ArgvPattern.compareArgvToPatterns('[! --option -o "string value" "default value"]', 'command1 command2 -a:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' Argv.compareArgvToPatterns method -test options (pattern `[! --option -o "string value" "default value"]`)');
    }

    // Argv.compareArgvToPatterns method -test diff`)
    {
        let match = new ArgvArray(
            {
                type: 'command',
                key: 'command2',
                order: 2
            },
            {
                type: 'option',
                key: 'option',
                value: true,
            },
            {
                type: 'option',
                shortKey: 'o',
                value: 'value',
            });
        let result = new ArgvArray();
        ArgvPattern.compareArgvToPatterns('command1', 'command1 command2 --option -o="value"', result);
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' Argv.compareArgvToPatterns method  -test diff');
    }


    // getHelp
    {
        let pattern = new ArgvPattern('/command1|command1_1/i command2 --option=value -o [--help -h]');

        let descs = {
            '-': 'desc',
            'command1': {
                '-': 'desc command1',
                'command2': {
                    '-': 'desc command1 command2',
                    '--option': 'desc command1 command2 --option'
                },
                '--option': 'desc command1 --option'
            },
            'command1_1': {
                '-': 'desc command1_1',
                'command2': 'desc command1_1 command2',
                '--option': 'desc command1_1 command2 --option'
            },
            '--option': 'desc --option'
        };
        {
            let argv = pattern.compare('--help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1]  =>   desc command1
[command1][command2]  =>   desc command1 command2
[command1][command2][--option]  =>   desc command1 command2 --option
[command1][--option]  =>   desc command1 --option
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   desc command1_1 command2
[command1_1][--option]  =>   desc command1_1 command2 --option
[--option]  =>   desc --option`;
            assert.equal(message, equal, 'getHelp method  --help');
        }
        {
            let argv = pattern.compare('command1 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1]  =>   desc command1
[command1][command2]  =>   desc command1 command2
[command1][command2][--option]  =>   desc command1 command2 --option
[command1][--option]  =>   desc command1 --option`;
            assert.equal(message, equal, 'getHelp method  command1 --help');
        }
        {

            let argv = pattern.compare('command1 command2 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1]  =>   desc command1
[command1][command2]  =>   desc command1 command2
[command1][command2][--option]  =>   desc command1 command2 --option`;
            assert.equal(message, equal, 'getHelp method  command1 command2 --help');
        }
        {
            let argv = pattern.compare('command1 command2 --option --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1]  =>   desc command1
[command1][command2]  =>   desc command1 command2
[command1][command2][--option]  =>   desc command1 command2 --option
[command1][--option]  =>   desc command1 --option
[--option]  =>   desc --option`;
            assert.equal(message, equal, 'getHelp method  command1 command2 --option --help');

        }
        {
            let argv = pattern.compare('command1_1 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   desc command1_1 command2
[command1_1][--option]  =>   desc command1_1 command2 --option`;
            assert.equal(message, equal, 'getHelp method  command1_1 --help');

        }
        {
            let argv = pattern.compare('command1_1 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   desc command1_1 command2
[command1_1][--option]  =>   desc command1_1 command2 --option`;
            assert.equal(message, equal, 'getHelp method  command1_1 --help');

        }
        {
            let argv = pattern.compare('command1_1 command2 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   desc command1_1 command2`;
            assert.equal(message, equal, 'getHelp method  command1_1 command2 --help');

        }
        pattern.get({order: 1}).descriptions = {
            'command1_1': {
                'command2': 're_desc command1_1 command2',
                '--option': 're_desc command1_1 --option'
            }
        };
        {
            let argv = pattern.compare('command1_1 command2 --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   re_desc command1_1 command2`;
            assert.equal(message, equal, 'getHelp method  command1_1 command2 --help');

        }
        {
            let argv = pattern.compare('command1_1 --option --help');
            let message = ArgvPattern.getHelp(argv, pattern, descs);
            let equal = `desc
[command1_1]  =>   desc command1_1
[command1_1][--option]  =>   re_desc command1_1 --option
[--option]  =>   desc --option`;
            assert.equal(message, equal, 'getHelp method  "command1_1 --option --help"');

        }
        {
            let pHelp = pattern.get('--help');
            pHelp.descriptions = descs;
            let argv = pattern.compare('--help');
            let help = argv.get('--help');
            let message = help.helpMessage;
            let equal = `desc
[command1]  =>   desc command1
[command1][command2]  =>   desc command1 command2
[command1][command2][--option]  =>   desc command1 command2 --option
[command1][--option]  =>   desc command1 --option
[command1_1]  =>   desc command1_1
[command1_1][command2]  =>   re_desc command1_1 command2
[command1_1][--option]  =>   re_desc command1_1 --option
[--option]  =>   desc --option`;
            assert.equal(message, equal, 'ArgvArray.compare  --help');

        }

    }

    // ArgvPattern.compare method
    {
        let match = new ArgvArray('command1 --option=value -o="string value"');
        let pattern = new ArgvPattern('/command1|command2/ --option=value -o="string value"');
        let result = pattern.compare('command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value => delete value.pattern);
        assert.deepEqual(result, match, ' ArgvPattern.compare method');
    }

    // ArgvPattern.toString method
    {
        let match = '[! command1 "command2" ] -a=true -b=false -c=100 [! --option -o "value string" "default string" ]';
        let pattern = new ArgvPattern('[!command1 command2]  -ab=false -c=100 [!--option -o "value string" "default string"]');
        let result = pattern.toString();
        assert.equal(result, match, 'ArgvPattern.toString method');
    }


    // Errors
    {
        assert.throws(function () {
            let result = ArgvPattern.compareArgvToPatterns('command1 command2 /command3|command4/', 'command1 command4 command5');
        }, function (e) {
            return e.message === "\nError:Parameter (2)  \"command4\"  does not match  \"command2\"." +
                "\nError:Parameter (3)  \"command5\"  does not match  \"/command3|command4/\" pattern.";
        }, 'Errors commands');
        assert.throws(function () {
            let result = ArgvPattern.compareArgvToPatterns('command1 --option=value command2 -o=/a1|a2/', 'command1 --option=value1 -o=a3 command2');
        }, function (e) {
            return e.message === "\nError:The value \"value1\" of \"--option\" option (parameter 2) does not match \"value\"." +
                "\nError:The value \"a3\" of \"-o\" option (parameter 3) does not match \"/a1|a2/\" pattern.";
        }, 'Errors options');

        assert.throws(function () {
            let result = ArgvPattern.compareArgvToPatterns('command1  [!command2] [! --option value]', 'command1');
        }, function (e) {
            return e.message === "\nError: 2 command position is required." +
                "\nError:\"--option\" parameter is required.";
        }, 'Errors requred');
        assert.throws(function () {
            let result = ArgvPattern.compareArgvToPatterns('command1', 'command1 command2 --option', false);
        }, function (e) {
            return e.message === "\nError:The \"command2\" parameter is undefined." +
                "\nError:The \"--option\" parameter is undefined.";
        }, 'Parameter undefined');
    }
});