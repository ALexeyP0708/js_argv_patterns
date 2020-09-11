import {ArgvElement,ArgvObject,ArgvArray,ArgvPattern} from "../../src/export.js";

QUnit.module('Test Examples');

QUnit.test('test methods',function(assert){
    {
        let pattern= new ArgvPattern('style /get|set/ --color=/blue|green|black/');
        pattern.compare(['style','get','--color=blue']);
    }
    {
        let pattern= new ArgvPattern();
        pattern
            .set('style') // задаем 1-ю команду строкой
            .set({ // задаем 2-ю команду обьектом 
                type:'command',
                key:/set|get/i, // паттерн команды - в формате регулярного выражения
                required:false, // обязательная команда или нет // можно не указывать если false
                errorMessage:'Вторая команда должна быть "get" или "set"', // альтернативная сообщение ошибки соответствия
                default:'get' // указываем значение по умолчанию. 
                // можно указать свои поля например 'description', которые будут использоваться в вашем коде.   
            })
            .set('--color',{ // гибрид автоматически опрделяем {type:'option',key:'color'}
                shortKey:'c',
                required:true, // обязательная опция
                errorMessage:'Укажите в опции "--color" цвет blue|green|black', // альтернативная сообщение ошибки соответствия
                //default:'black' // указываем значение по умолчанию.
                value:/blue|green|black/i // паттерн значения - в формате регулярного выражения
            });
        pattern.compare(['style','set','--color blue']);
    }
    {
        let pattern= new ArgvPattern({type:'command',key:'command1'});
        pattern.compare('command1');
    }
    {
        let pattern= new ArgvPattern({type:'command',key:'*'});
        pattern.compare('anyCommand');
    }
    {
        let pattern= new ArgvPattern({
            type:'command',
            key:/command1|command1_1/i // [object RegExp] 
        });
        pattern.compare('command1_1');
    }
    {
        let pattern=new ArgvPattern('command1 [* default_command]');
        let command=pattern.compare('command1');
        command.forEach(value=>delete value.pattern);
        assert.deepEqual(command,[
            new ArgvElement('command1',{order:1}),
            new ArgvElement('default_command',{default:'default_command',order:2})
        ],'test default command');
    }
    {
        let pattern=new ArgvPattern('command1 [! *]');
        try{
           pattern.compare('command1');
            assert.ok(false);
        }catch(e){
        }
        // throws error
    }
    {
        let pattern=new ArgvPattern('command1 --option * /command3|command3_1/i');
        let element=pattern.get({type:'command',order:2});
        delete element.pattern;
        assert.propEqual(element, new ArgvElement('*',{order:2}),'test search command');
        element=pattern.get({type:'command',key:'/command3|command3_1/i'});
        delete element.pattern;
        assert.propEqual(element, new ArgvElement('/command3|command3_1/i',{order:3}),'test search command 2');
        element=pattern.get({type:'command',key:'command1'});
        assert.propEqual(element, new ArgvElement('command1',{order:1}),'test search command 3');
    }
    assert.ok(true);

});