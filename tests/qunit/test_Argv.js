import {Argv,ArgvElement,ArgvObject,ArgvArray} from "../../src/export.js";

QUnit.module('Test Arg class');

QUnit.test('test methods',function(assert){

    // Argv.elementClass get/set
    {
        class A extends ArgvElement{};
        Argv.elementClass=A;
        assert.equal(Argv.elementClass,A,'Argv.elementClass set/get');
        Argv.elementClass=null;
        assert.equal(Argv.elementClass,ArgvElement,'Argv.elementClass - reset');
    }

    // Argv.elementClass
    {
        assert.throws(function(){
            Argv.elementClass=class A{};
        },function(e){
            return e.message==="The value does not belong to the ArgvElement class";
        },'Argv.elementClass error');
    }
    //Argv.parseCommand method
    {
        let match=[
            'command1',
            '[-o --option value string]',
            '-abc=100',
            '--option1=brackets test',
            '--option2',
            'command2'
        ];
        let result=Argv.parseCommand('command1 [-o --option value string]  -abc=100  --option1="brackets test" --option2 command2');

        assert.propEqual(result,match,'Argv.parseCommand method');
    }

    //Argv.parseElement method (command)
    {
        let match=[
            new ArgvElement({
                type:'command',
                key:'command',
            })
        ];
        let result=Argv.parseElement('command');
        assert.deepEqual(result,match,'Argv.parseElement method (command)');
    }

    //Argv.parseElement method (--option)
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:true
            })
        ];
        let result=Argv.parseElement('--option');
        assert.deepEqual(result,match,'Argv.parseElement method (--option)');
    }

    //Argv.parseElement method (--option=value string)
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('--option=value string');
        assert.deepEqual(result,match,'Argv.parseElement method (--option=value string)');
    }

    //Argv.parseElement method (--option:value string)
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('--option:value string');
        assert.deepEqual(result,match,'Argv.parseElement method (--option:value string)');
    }

    //Argv.parseElement method (--option value string)
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('--option value string');
        assert.deepEqual(result,match,'Argv.parseElement method (--option value string)');
    }

    //Argv.parseElement method (--option value string)
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('--option value string');
        assert.deepEqual(result,match,'Argv.parseElement method (--option value string)');
    }

    //Argv.parseElement method (--option "/regExp/")
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                value: /^[\s\S]*$/
            })
        ];
        let result = Argv.parseElement('--option "/^[\\s\\S]*$/"');
        assert.deepEqual(result, match, 'Argv.parseElement method (--option "/regExp/")');
    }
    //Argv.parseElement method (-o)
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:true
            })
        ];
        let result=Argv.parseElement('-o');
        assert.deepEqual(result,match,'Argv.parseElement method (-o)');
    }

    //Argv.parseElement method (-o="value string")
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('-o="value string"');
        assert.deepEqual(result,match,'Argv.parseElement method (-o="value string")');
    }

    //Argv.parseElement method (-o:"value string")
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('-o:"value string"');
        assert.deepEqual(result,match,'Argv.parseElement method (-o:"value string")');
    }

    //Argv.parseElement method (-o "value string")
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('-o "value string"');
        assert.deepEqual(result,match,'Argv.parseElement method (-o "value string")');
    }

    //Argv.parseElement method (-o "/regExp/")
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:/^[\s\S]*$/
            })
        ];
        let result=Argv.parseElement('-o "/^[\\s\\S]*$/"');
        assert.deepEqual(result,match,'Argv.parseElement method (-o "/regExp/")');
    }

    //Argv.parseElement method (-abc "value string")
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'a',
                value:true
            }),
            new ArgvElement({
                type:'option',
                shortKey:'b',
                value:true
            }),
            new ArgvElement({
                type:'option',
                shortKey:'c',
                value:'value string'
            })
        ];
        let result=Argv.parseElement('-abc "value string"');
        assert.deepEqual(result,match,'Argv.parseElement method (-abc "value string")');
    }

    //Argv.parseElement method ([-o --option "value string"])
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                shortKey:'o',
                value:'value string'
            })
        ];
        assert.deepEqual(Argv.parseElement('[-o --option "value string"]'),match,'Argv.parseElement method ([-o --option "value string"])');
        assert.deepEqual(Argv.parseElement('[--option -o  "value string"]'),match,'Argv.parseElement method ([--option -o  "value string"])');
    }

    //Argv.parseElement method ([--option "value string"])
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                value:'value string'
            })
        ];
        assert.deepEqual(Argv.parseElement('[--option "value string"]'),match,'Argv.parseElement method ([--option "value string"])');
    }

    //Argv.parseElement method ([-o "value string"])
    {
        let match=[
            new ArgvElement({
                type:'option',
                shortKey:'o',
                value:'value string'
            })
        ];
        assert.deepEqual(Argv.parseElement('[-o "value string"]'),match,'Argv.parseElement method ([-o "value string"])');
    }

    //Argv.parseElement method ([-o --option])
    {
        let match=[
            new ArgvElement({
                type:'option',
                key:'option',
                shortKey:'o',
                value:true
            })
        ];
        assert.deepEqual(Argv.parseElement('[-o --option]'),match,'Argv.parseElement method ([-o --option])');
    }

    //Argv.parseElement method ([--option -o "/regExp/"])
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                shortKey:'o',
                value: /^[\s\S]*$/
            })
        ];
        let result = Argv.parseElement('[--option -o "/^[\\s\\S]*$/"]');
        assert.deepEqual(result, match, 'Argv.parseElement method  ([--option -o "/regExp/"])');
    }

    //Argv.parseElement method ([! --option -o "value string" "default string" ])
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                shortKey:'o',
                value: 'value string',
                required:true,
                default:'default string'
            })
        ];
        let result = Argv.parseElement('[! --option -o "value string" "default string"]');
        assert.deepEqual(result, match, 'Argv.parseElement method ([! --option -o "value string" "default string"]');
    }

    //Argv.parseElement method ([ true ])
    {
        let match = [
            new ArgvElement({
                type: 'command',
                key: true,
            })
        ];
        let result = Argv.parseElement('[true]');
        assert.deepEqual(result, match, 'Argv.parseElement method ([ true ])');
    }

    //Argv.parseElement method ([ command false ])
    {
        let match = [
            new ArgvElement({
                type: 'command',
                key: 'command',
                default:false
            })
        ];
        let result = Argv.parseElement('[command false]');
        assert.deepEqual(result, match, 'Argv.parseElement method ([ command false ])');
    }

    //Argv.parseElement method ( false )
    {
        let match = [
            new ArgvElement({
                type: 'command',
                key: false,
            })
        ];
        let result = Argv.parseElement('false');

        assert.deepEqual(result, match, 'Argv.parseElement method ( false )');
    }
    //Argv.parseElement method ([ --option false ])
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                value:false
            })
        ];
        let result = Argv.parseElement('[--option false]');
        assert.deepEqual(result, match, 'Argv.parseElement method ([ --option false ])');
    }
    //Argv.parseElement method ([ --option false true])
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                value:false,
                default:true
            })
        ];
        let result = Argv.parseElement('[--option false true]');
        assert.deepEqual(result, match, 'Argv.parseElement method ([ --option false true])');
    }

    //Argv.parseElement method (--option=false)
    {
        let match = [
            new ArgvElement({
                type: 'option',
                key: 'option',
                value:false,
            })
        ];
        let result = Argv.parseElement('--option=false');
        assert.deepEqual(result, match, 'Argv.parseElement method (--option=false)');
    }

    // Argv.parse method
    {
        let match=[
            new ArgvElement({
                type:'command',
                key:'command1',
                order:1
            }),
            new ArgvElement({
                type:'option',
                shortKey:'a',
                value:true
            }),
            new ArgvElement({
               type:'option',
               shortKey:'b',
               value:true
            }),
            new ArgvElement({
               type:'option',
               shortKey:'c',
               value:'100'
            }),
            new ArgvElement({
               type:'option',
               key:'option1',
               value:'brackets test'
            }),
            new ArgvElement({
               type:'option',
               key:'option2',
               value:true
            }),
            new ArgvElement({
                type:'command',
                key:'command2',
                order:2
            })
        ];
        let result=Argv.parse('command1  -abc=100  --option1="brackets test" --option2 command2');
        assert.deepEqual(result,match,'Argv.parse method');
        let result2=Argv.parse(['command1','-abc=100', '--option1=brackets test', '--option2','command2']);

        assert.deepEqual(result2,match,'Argv.parse method 2');
    }

    // Argv.parse method 2 -identical commands
    {
        let match=[
            new ArgvElement({
                type:'command',
                key:'command1',
                order:1
            }),
            new ArgvElement({
                type:'option',
                shortKey:'a',
                value:true
            }),
            new ArgvElement({
                type:'command',
                key:'command1',
                order:2
            }),
            new ArgvElement({
                type:'command',
                key:'command1',
                order:3
            })
        ];
        let result=Argv.parse('command1  -a  command1 command1');
        assert.deepEqual(result,match,'Argv.parse method -identical commands');
    }

    //Argv.elementsToString method
    {
        let match='command1 -a -c="100" --option1="brackets test" --option2 command2';
        let params=Argv.parse('command1  -ab=false -c=100  --option1="brackets test" --option2 command2');
        let result=Argv.elementsToString(params);
        assert.equal(result,match,'Argv.elementsToString method');
    }

    //Argv.elementsToPattern method
    {
        let match='[! command1 "command2" ] -a=true -b=false -c=100 [! --option -o "value string" "default string" ]';
        let params=Argv.parse('[!command1 command2]  -ab=false -c=100 [!--option -o "value string" "default string"]');
        let result=Argv.elementsToPattern(params);
        assert.equal(result,match,'Argv.elementsToPattern method');
    }

    //Argv.elementsToObject and objectToArray methods
    {
        let match=Object.assign(new ArgvObject(),{
            commands:[
                new ArgvElement({
                type:'command',
                key:'command1',
                order:1
            }),
            new ArgvElement({
                type:'command',
                key:'command2',
                order:2
            })
            ],
            options:{
                a: new ArgvElement({
                    type:'option',
                    shortKey:'a',
                    value:true
                }),
                b: new ArgvElement({
                    type:'option',
                    shortKey:'b',
                    value:true
                }),
                c: new ArgvElement({
                    type:'option',
                    shortKey:'c',
                    value:'100'
                }),
                option1:new ArgvElement({
                    type:'option',
                    key:'option1',
                    value:'brackets test'
                }),
                option2:new ArgvElement({
                    type:'option',
                    key:'option2',
                    value:true
                }),
            }
        });
        let result=Argv.elementsToObject(new ArgvArray('command1  -abc=100  --option1="brackets test" --option2 command2'));
        assert.deepEqual(result,match, 'Argv.elementsToObject method');
        let result2=Argv.objectToArray(result);
        let match2=(new ArgvArray()).concat([
            new ArgvElement({
                type:'command',
                key:'command1',
                order:1
            }),
            new ArgvElement({
                type:'command',
                key:'command2',
                order:2
            }),
            new ArgvElement({
                type:'option',
                shortKey:'a',
                value:true
            }),
            new ArgvElement({
                type:'option',
                shortKey:'b',
                value:true
            }),
            new ArgvElement({
                type:'option',
                shortKey:'c',
                value:'100'
            }),
            new ArgvElement({
                type:'option',
                key:'option1',
                value:'brackets test'
            }),
            new ArgvElement({
                type:'option',
                key:'option2',
                value:true
            })

        ]);
        assert.deepEqual(result2,match2, 'Argv.objectToArray method');
    }

    // Argv.compareArgvToPatterns methods -test commands
    {
        let match=new ArgvArray('command1 command2 command3');
        let result=Argv.compareArgvToPatterns('command1 --option command2 command3','command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test commands');

        result=Argv.compareArgvToPatterns('command1 --option * *','command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test commands (*) ');

        result=Argv.compareArgvToPatterns('command1 --option /^(?:command22|command2)$/i /(?:command33|COMMAND3)/i','command1 --anyOption command2 --anyOption2 command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test commands (RegExp) ');
    }

    // Argv.compareArgvToPatterns methods -test options (--option -o)
    {
        let match=new ArgvArray('--option -o');
        let result=Argv.compareArgvToPatterns('--option -o','command1 --option command2 -o command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option -o)');
    }

    // Argv.compareArgvToPatterns methods -test options (--option=value -o="string value")
    {
        let match=new ArgvArray('--option=value -o="string value"');

        let result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option=value -o="string value")');

        result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option:"value" command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option:value -o:"string value")');

        result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option value -o "string value")');

        result=Argv.compareArgvToPatterns('--option=* -o=*','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (pattern `--option=* -o=*`)');

        result=Argv.compareArgvToPatterns('--option=/value|value2/ -o="/string value|string value2/"','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (pattern `--option=/value|value2/ -o=/string value|string value2/`)');
    }

    // Argv.compareArgvToPatterns methods 2 -test options (--option=value -o="string value")
    {
        let match=new ArgvArray('--option=value -o="string value"');
        let result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option=value -o="string value")');

        result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option:"value" command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option:value -o:"string value")');

        result=Argv.compareArgvToPatterns('--option=value -o="string value"','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (--option value -o "string value")');

        result=Argv.compareArgvToPatterns('--option=* -o=*','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (pattern `--option=* -o=*`)');

        result=Argv.compareArgvToPatterns('--option=/value|value2/ -o="/string value|string value2/"','command1 --option "value" command2 -o "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,'Argv.compareArgvToPatterns methods -test options (pattern `--option=/value|value2/ -o=/string value|string value2/`)');
    }

    // Argv.compareArgvToPatterns methods -test options (pattern `[--option -o "string value"]`)
    {
        let match=new ArgvArray('[--option -o "string value"]');
        let result=Argv.compareArgvToPatterns('[--option -o "string value"]','command1 command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o string value]`)');

        result=Argv.compareArgvToPatterns('[--option -o * ]','command1 command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o *]`)');

        result=Argv.compareArgvToPatterns('[--option -o "/string value|other value/" ]','command1 command2 --option "string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' Argv.compareArgvToPatterns methods -test options (pattern `[--option -o /RegExp/]`)');
    }

    // Argv.compareArgvToPatterns methods -test options (pattern `[! --option -o "string value" "default value"]`)
    {
        let match=new ArgvArray('[! --option -o "default value"  "default value"]');
        let result=Argv.compareArgvToPatterns('[! --option -o "string value" "default value"]','command1 command2 -a:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' Argv.compareArgvToPatterns methods -test options (pattern `[! --option -o "string value" "default value"]`)');
    }

    // Argv.compareArgvToPatterns methods -test diff`)
    {
        let match=new ArgvArray(
            {
                type:'command',
                key:'command2',
                order:2
            },
            {
                type:'option',
                key:'option',
                value:true,
            },
            {
                type:'option',
                shortKey:'o',
                value:'value',
            });
        let result=new ArgvArray();
        Argv.compareArgvToPatterns('command1','command1 command2 --option -o="value"',result);
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' Argv.compareArgvToPatterns methods - methods -test diff');
    }

    // Errors
    {

        assert.throws(function(){
            let result=Argv.compareArgvToPatterns('command1 command2 /command3|command4/','command1 command4 command5');
        },function(e){
            return e.message==="\nError:Parameter (2)  \"command4\"  does not match  \"command2\"."+
                "\nError:Parameter (3)  \"command5\"  does not match  \"/command3|command4/\" pattern.";
        }, 'Errors commands');
        assert.throws(function(){
            let result=Argv.compareArgvToPatterns('command1 --option=value command2 -o=/a1|a2/','command1 --option=value1 -o=a3 command2');
        },function(e){
            return e.message==="\nError:The value \"value1\" of \"--option\" option (parameter 2) does not match \"value\"."+
                "\nError:The value \"a3\" of \"-o\" option (parameter 3) does not match \"/a1|a2/\" pattern.";
        }, 'Errors options');

        assert.throws(function(){
            let result=Argv.compareArgvToPatterns('command1  [!command2] [! --option value]','command1');
        },function(e){
            return e.message==="\nError: 2 command position is required."+
                "\nError:\"--option\" parameter is required.";
        }, 'Errors requred');

        assert.throws(function(){
            let result=Argv.compareArgvToPatterns('command1','command1 command2 --option',false);
        },function(e){
            return e.message==="\nError:The \"command2\" parameter is undefined."+
            "\nError:The \"--option\" parameter is undefined.";
        }, 'Parameter undefined');

    }


});