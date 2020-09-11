
## Введение
Создает патерн argv параметров, 
и в последующем с ним сравнивает argv параметры коммандной строки.
Если по патерну не подходит, то выбрасывает ошибку.

```js
let pattern= new ArgvPattern('style /set|get/ --color=/blue|green|black/');
pattern.compare(['style','set','--color=blue']);
```

пааттерны можно задавать как и строкой так и с помощью обьектов, а также комбенированно.
```js
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
    .set('--color',{ // гибрид автоматически определяем {type:'option',key:'color'}
        shortKey:'c',
        required:true, // обязательная опция
        errorMessage:'Укажите в опции "--color" цвет blue|green|black', // альтернативная сообщение ошибки соответствия
        //default:'black' // указываем значение по умолчанию.
        value:/blue|green|black/i // паттерн значения - в формате регулярного выражения
    });
pattern.compare(['style','set','--color blue']);

``` 



## структура паттернов

### команды

Команды перечисляются. Каждая команда имеет свою позицию в стеке комманд  
Пример  
```js
    let pattern= new ArgvPattern('command1 --option  command2');
    //order 1 - `command1`  
    //order 2 - `command2`  
```  

Команда может быть "строкой" или * или регулярным выражением:
```js
let pattern= new ArgvPattern('command1'); 
// or
pattern= new ArgvPattern({type:'command',key:'command1'});
pattern.compare('command1');
```
- Если * , то на данной позиции комманды может быть любое выражение; 
```js
let pattern= new ArgvPattern('*'); 
// or
pattern= new ArgvPattern({type:'command',key:'*'});
pattern.compare('anyCommand');
```
- Если регулярное выражение, то произайдет сравнение согласно регулярному выражению -`pattern.test(string)`.
```js
let pattern= new ArgvPattern('/command1|command1_1/i'); 
// or
pattern= new ArgvPattern({
    type:'command',
    key:/command1|command1_1/i // [object RegExp] 
});
pattern.compare('command1_1');
```

Стиль расширенного синтаксиса для команды :
- `[! command_pattern]` - обязательная команда 
- `[command_pattern default_command]` - значение по умолчанию если команда не указана
- `[! command_pattern default_command]` не имеет смысла так писать так как установленно значение по умолчанию.
```js
 let pattern=new ArgvPattern('command1 [* default_command]');
 let command=pattern.compare('command1');
 console.log(command);
 /*
    [
        {
            type:'command',
            key:'command1'
            //....
        },
        {
            type:'command',
            key:'default_command'
            //....
        }
    ]
 */
```

```js
 let pattern=new ArgvPattern('command1 [! *]');
 let command=pattern.compare('command1');// 2 command required
 // throws error

```
### Опции




Поиск элементов.
Example
```js
 let pattern=new ArgvPattern('command1 --option * /command3|command3_1/i');
element=pattern.get({type:'command',order:2});// вернет команду на позиции 2 в стеке комманд
element=pattern.get({type:'command',key:'/command3|command3_1/i'});// найдет команду с регулярным выражением. Обратить внимание что это  строка.
// Если будет реальное регулярное выражение, то произведет поиск на сопостовление с регулярным выражением 
element=pattern.get('command1');// найдет команду command1
element=pattern.get('command1',{order:1});// соответствует ли команда на позиции 1 command1
element=pattern.get({order:1,key:/command1|command1_1/i});
```
и [ArgvArray.prototype.get](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html)
```js
    //ArgvArray or ArgvPattern
let argv=new ArgvArray('command1','command1','command2','--option1=value1','--option2=value2','-a=value2','-b=value1');
let result=argv.searchElement({order:1});// [argv[0]]
result=argv.searchElement({key:'command1'});// [argv[0],argv[1]]
result=argv.searchElement({key:'command2'},true);// [argv[2]]
result=argv.searchElement({key:/command[\d]/});// [argv[0],argv[1],argv[2]]
result=argv.searchElement({key:/command[\d]/,order:2});// [argv[1]]
result=argv.searchElement({key:'command6'});// []
result=argv.searchElement({type:'option',key:'option1'});// [argv[3]]
result=argv.searchElement({type:'option',key:'option1',value:'value1'});//[argv[3]]
result=argv.searchElement({type:'option',key:'option1',value:/value[\d]/});// [argv[3]]
result=argv.searchElement({type:'option',key:/option[\d]/,value:/value[\d]/});// [argv[3],argv[4]]
result=argv.searchElement({type:'option',shortKey:/[ab]/,value:/value[\d]/});// [argv[5],argv[6]]
result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/value[\d]/});// [argv[3],argv[4],argv[5],argv[6]]
result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/^[\d]$/});// []
result=argv.searchElement({type:'option',key:/option[\d]/,shortKey:/[ab]/,value:/^value[\d]$/},true);// [argv[3]]
```
Также смотрите методы [ArgvArray.prototype.searchElement](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html) 

