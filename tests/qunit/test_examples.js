import {ArgvElement,ArgvObject,ArgvArray,ArgvPattern} from "../../src/export.js";

QUnit.module('Test Examples');

QUnit.test('test methods',function(assert){
    {
        let pattern = new ArgvPattern('/start|end/i /[\\s\\w]\\.js/i [--force -f] [--help]');
        /*
        test commands '--help'  
        'start --help' 
        'start --force --help' 
        'end --force --help' 
        'end --help' 
        'end --force --help'
        'start --after --help'
        'end --after --help'
        'start --after --force --help'
        'end --after --force --help
        */
        let cLine='end --help'; // suppose this is a command passed to the script  

        let diff=new ArgvArray(); // the rest of the parameters will be indicated here  
        let argv=pattern.compare(cLine,diff);
        let help=argv.get('--help');
        let helpMessages={
            start:`start path/js/script -command "start" runs script.`,
            end:`end path/js/file - ends script execution.`,
            '--force':`[--force -f] - Forces the script to start or end.`,
        };
        if(help){
            let check=false;
            let message=[];
            if(argv.get('start',{order:1})){
                message.push(helpMessages['start']);
                check=true;
            } else
            if(argv.get('end',{order:1})){
                message.push(helpMessages['end']);
                check=true;
            }
            if(check===true && (argv.get('--force') || argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 && diff.searchElement({type:'option',key:/[\w]+/i}).length<=0)){
                message.push(helpMessages['--force']);
            }
            if(!check){
                message=Object.values(helpMessages);
            }
            if(message.length>0){
                //console.log(message.join("\n"));
            }
        } else {
            // code for start or end script  
        }
// other code  
        let extPattern = new ArgvPattern('[--after *]');
        let extArgv=extPattern.compare(diff); //you can use the cLine variable instead of diff.  
        let extHelpMessages = {
            '--after':{
                start:`[--after=pathc/js/script] - Will execute the script after running the main script.`,
                end:`[--after=pathc/js/script] - Will execute the script after the main script finishes.`
            }
        };
        if(argv.get('--help')){
            let message=[];
            let check=false;
            if(argv.get('start',{order:1}) && (extArgv.get('--after')  || argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 &&
                diff.searchElement({type:'option',key:/[\w]+/i}).length<=0)){
                message.push(extHelpMessages['--after']['start']);
            } else 
            if( argv.get('end',{order:1}) && (extArgv.get('--after') || argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 &&
                diff.searchElement({type:'option',key:/[\w]+/i}).length<=0)){
                message.push(extHelpMessages['--after']['end']);
            } else if(argv.searchElement({type:'option',key:/[\w]+/i}).length<=1){
                message=Object.values(extHelpMessages['--after']);
            }
            if(message.length>0){
                //console.log(message.join("\n"));
            }
        } else {
            // code for start or end additional script  
        }
    }
    
    {
        
    }
    {
        let pattern= new ArgvPattern('style /set|get/ --color=/blue|green|black/');
        let result=pattern.compare(['style','set','--color=blue']);
        //or
        result.forEach(value=>delete value.pattern);
        /*assert.propEqual(result,[
            new ArgvElement()
        ],'exemple 1');*/
       
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