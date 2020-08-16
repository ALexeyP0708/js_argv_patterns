import {ArgvElement,ArgvArray,ArgvObject} from "../../src/export.js";

QUnit.module('Test ArgArray class');
QUnit.test('test methods',function(assert) {

    // ArgvArray.constructor method
    {
        let match = [
            new ArgvElement({type:'command',key:'command'}),
            new ArgvElement('--option'),
            new ArgvElement('-o=value')
        ];
        let result = new ArgvArray('command --option -o=value');
        assert.deepEqual(result,match,'ArgvArray.constructor (arg1 type string)');
        result = new ArgvArray(['command', '--option', '-o=value']);
        assert.deepEqual(result,match,'ArgvArray.constructor (arg1 type Array)');
        result = new ArgvArray('command', '--option', '-o=value');
        assert.deepEqual(result,match,'ArgvArray.constructor (args type Array)');
    }

    // ArgvArray.get method
    {
        let argv=new ArgvArray('command1','--option1=value');

        let match=argv.get({order:1})===argv[0] && argv.get('command1')===argv[0] && argv.get('command1',{order:1})===argv[0] && argv.get('command2')===false && argv.get('command1',{order:2})===false&&
            argv.get('--option1')===argv[1] && argv.get('--option1="value"')===argv[1] && argv.get('--option2')===false && argv.get('--option1=val')===false ;
        assert.ok(match,' ArgvArray.get method');
    }

    // ArgvArray.set method
    {
        let argv=new ArgvArray();
        argv
         .set('command',{order:1,description:'test command'})
         .set({
                  key:'command2',
                  order:2
              })
         .set({order:1,key:"new_command"})
         .set({key:"new_command",description:'Overwrite description for command'})
         .set('--option',{required:true})
         .set('-o=value')
         .set('--option',{description:'Hello my friend'});

        let match=[
            new ArgvElement({
                type:'command',
                key:'new_command',
                description:'Overwrite description for command',
            }),
            new ArgvElement({
                type:'command',
                key:'command2',
            }),
            new ArgvElement('[! --option ]',{description:'Hello my friend'}),
            new ArgvElement('-o value')
        ];
        assert.deepEqual(argv,match,'ArgvArray.set method');
    }

    // ArgvArray.add method -command order2
    {
        let argv=new ArgvArray();
        argv.add('command1',{order:1})
            .add('--option1')
            .add('command2',{order:1})
            .add('--option1=value');
        let match=[
            new ArgvElement('command1'),
            new ArgvElement('--option1'),

        ];
        assert.deepEqual(argv,match,' ArgvArray.add method');
    }

    // Argv.toElement
    {
        let match=new ArgvElement('--option=value');
        let argv=new ArgvArray();
        assert.deepEqual(argv.toElement('--option=value'),match,'Argv.toElement method');
    }

    // ArgvArray.toString method
    {
        let match='command1 -a -c="100" --option1="brackets test" --option2 command2';
        let result = new ArgvArray('command1  -ab=false -c=100  --option1="brackets test" --option2 command2');
        assert.equal(result.toString(),match,'ArgvArray.toString method');
    }

    // ArgvArray.toObject method
    {
        let match = new ArgvObject(['command','command2', '--option', '-o=value']);
        let result = new ArgvArray(['command', '--option', '-o=value','command2']);
        assert.deepEqual(result.toObject(),match,'ArgvArray.toObject method');
    }

    // Argv.push
    {
        let match=new ArgvArray('--option=value');
        let argv=new ArgvArray();
        argv.push('--option=value');
        assert.deepEqual(argv,match,'Argv.push method');
    }

    // Argv.concat
    {
        let match=new ArgvArray('--option=value');
        let argv=new ArgvArray();
        argv=argv.concat(['--option=value']);
        assert.deepEqual(argv,match,'Argv.concat method');
    }

    // Argv.unshift
    {
        let match=new ArgvArray('--option=value');
        let argv=new ArgvArray();
        argv.unshift('--option=value');
        assert.deepEqual(argv,match,'Argv.unshift method');
    }

    // Argv.fill
    {
        let match=new ArgvArray('--option=value');
        let argv=new ArgvArray(1);
        argv=argv.fill('--option=value',0,1);
        assert.deepEqual(argv,match,'Argv.fill method');
    }

    // Argv.splice
    {
        let match=new ArgvArray('--option=value');
        let argv=new ArgvArray();
        argv.splice(0,0,'--option=value');
        assert.deepEqual(argv,match,'Argv.splice method');
    }

    // Argv.sort
    {
        let argv=new ArgvArray('--option command1 -o --option2=value command2 command3');
        argv.sort();
        let match=new ArgvArray('command1 command2 command3 --option -o --option2=value');
        assert.deepEqual(argv,match,'Argv.sort method');
    }
});