import {ArgvElement,ArgvArray,ArgvObject} from "../../src/export.js";

QUnit.module('Test ArgObject class');
QUnit.test('test methods',function(assert) {

    // ArgvObject.constructor
    {
        let match={
            commands:[new ArgvElement('command1',{order:1}),new ArgvElement('command2',{order:2})],
            options:{
                option1:new ArgvElement('--option1=value'),
                o:new ArgvElement('-o=v'),
            }
        };
        let result=Object.assign({},new ArgvObject('command1 --option1=value command2 -o=v'));
        assert.deepEqual(result,match,' ArgvObject.constructor arg[0] string type');
        result=Object.assign({},new ArgvObject(['command1', '--option1=value', 'command2', '-o=v']));
        assert.deepEqual(result,match,' ArgvObject.constructor arg[0] Array type');
        result=Object.assign({},new ArgvObject(new ArgvArray(['command1', '--option1=value', 'command2', '-o=v'])));
        assert.deepEqual(result,match,' ArgvObject.constructor arg[0] ArgvArray type');
    }

    // ArgvObject.toArray
    {
        let match = [new ArgvElement('command1',{order:1}), new ArgvElement('command2',{order:2}), new ArgvElement('--option1=value'), new ArgvElement('-o=v')];
        let result = new ArgvObject('command1 --option1=value command2 -o=v');
        assert.deepEqual(result.toArray(), match, ' ArgvObject.toArray');
    }

    // ArgvObject.toString
    {
        let match='command1 command2 -a -c="100" --option1="brackets test" --option2';
        let result = new ArgvObject('command1  -ab=false -c=100  --option1="brackets test" --option2 command2');
        assert.equal(result.toString(),match,'ArgvObject.toString method');
    }

    // ArgvObject.get
    {
        let argv=new ArgvObject(['command1','--option1=value']);
        let match=argv.get({order:1})===argv.commands[0] && argv.get('command1')===argv.commands[0] && argv.get('command1',{order:1})===argv.commands[0] && argv.get('command2')===false && argv.get('command1',{order:2})===false&&
            argv.get('--option1')===argv.options.option1 && argv.get('--option1="value"')===argv.options.option1 && argv.get('--option2')===false && argv.get('--option1=val')===false ;
        assert.ok(match,' ArgvArray.get method');
    }

    // ArgvObject.set
    {
        let argv=new ArgvObject();
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

        let match={
            commands:[
                new ArgvElement({
                    type:'command',
                    key:'new_command',
                    description:'Overwrite description for command',
                }),
                new ArgvElement({
                    type:'command',
                    key:'command2',
                }),
            ],
            options:{
                option:new ArgvElement('[! --option ]',{description:'Hello my friend'}),
                o:new ArgvElement('-o value')
            }
        };
        let result=Object.assign({},argv);
        assert.deepEqual(result,match,'ArgvArray.set ');
    }

    // ArgvObject.add
    {
        let argv=new ArgvObject();
        argv.add('command1',{order:1})
            .add('--option1')
            .add('command2',{order:1})
            .add('--option1=value');
        let match={
          commands:[new ArgvElement('command1')],
          options:{
              option1:new ArgvElement('--option1')
          }
        };
        let result=Object.assign({},argv);
        assert.deepEqual(result,match,' ArgvObject.add ');
    }

});