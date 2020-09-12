# Install
()

# Getting Started
This component allows you to manage command line parameters (argv parameters).  
To do this, create a pattern and compare parameters of incoming requests from the console with this pattern.
Why another semblance of Commander.js component?
 This is a different look at writing commanders.
For example, let's create a helper for a certain start command that launches the specified script.
```js
let pattern = new ArgvPattern('/start|end/i /[\\s\\w]\\.js/i [--force -f] [--help]');  
/*  
	test commands for cLine variable 
	'--help'
	'start --help'   
	'start --force --help'   
	'end --force --help'   
	'end --help'   
	'end --force --help'  
	'start --after --help'
	'end --after --help' 
	'start --after --force --help' 
	'end --after --force --help'
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
	if(check===true && 
		(
			argv.get('--force') || 
			argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 && 
			diff.searchElement({type:'option',key:/[\w]+/i}).length<=0
		)
	){
	    message.push(helpMessages['--force']);  
	}  
	if(!check){  
	    message=Object.values(helpMessages);  
	}  
	if(message.length>0){  
	    console.log(message.join("\n"));  
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
	if( 
		argv.get('start',{order:1}) && 
		(
			extArgv.get('--after')  ||
			argv.searchElement({type:'option',key:/[\w]+/i}).length<=1
			diff.searchElement({type:'option',key:/[\w]+/i}).length<=0
		)
	){  
	        message.push(extHelpMessages['--after']['start']);  
	} else 
	if(
	    argv.get('end',{order:1}) && 
	    (
		    extArgv.get('--after') ||
		    argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 &&
			diff.searchElement({type:'option',key:/[\w]+/i}).length<=0
		)
	){  
        message.push(extHelpMessages['--after']['end']);  
	} else 
	if(argv.searchElement({type:'option',key:/[\w]+/i}).length<=1){  
	    message=Object.values(extHelpMessages['--after']);  
	}  
    if(message.length>0){ 
	        console.log(message.join("\n"));  
	}  
} else {  
    // code for start or end additional script    
}  

```
OK. But why do we need to write a helper when it is built-in in other components  *? Well, for starters, this is an example that shows how you can work with this module. Well, in the future, you can automate and implement your own helper.

```js

```

# Description
This component allows you to manage command line parameters (argv parameters).   
To do this, create a pattern and compare parameters of incoming requests from the console with this pattern.

Exemple
```js
// [object ArgvPattern] instanceof ArgvArray ===true
let pattern= new ArgvPattern('style /set|get/ --color=/blue|green|black/'); 
let result=pattern.compare(['style','set','--color=blue']);
//or
result=pattern.compare('style set --color=blue otherCommand --otherOption');
/*
result=>ArgvArray [
	ArgvElement {
		type:'command',
		key:'style',
		order:1
		...
	},
	ArgvElement {
		type:'command',
		key:'set',
		order:2
		...
	},
	ArgvElement {
		type:'option',
		key:'color',
		value:'blue'
		...
	},	
]
*/
```
Patterns can be set both as a string and with the help of objects, as well as combined.
```js
let pattern= new ArgvPattern();
pattern
    .set('style') // set the 1st command line (string)
    .set({ // set the 2st command line (object) Must repeat the structure of the ArgvElement object
        type:'command', // option|command  default - command
        key:/set|get/i, // command pattern - in regular expression format
        required:false, // default - false
        errorMessage:'The second command must be "get" or "set"', // alternative message for matching error
        default:'get' //specify the default value.
        // you can specify your own fields for example 'description', which will be used in your code.
    })
    .set('--color',{ // hybrid. automatically detect {type: 'option', key: 'color'}
        shortKey:'c',
        required:true, 
        errorMessage:'Set the "--color" option to blue | green | black', 
        value:/blue|green|black/i // value pattern - in regular expression format
    });
pattern.compare(['style','set','--color blue']);
``` 
## classes for instances

Instance ArgvArray class - intended for command line elements. Describes the command line.  Extends Array;
```js
	new ArgvArray('command --option=value');
	// or
	new ArgvArray(['command', '--option=value']);
	// or
	new ArgvArray('command', '--option=value');
	// or
	new ArgvArray([ // combining multiple sets
				['command', '--option=value'], 
				['command2', '--option2=value']
	]);
	/**
	ArgvArray[
		ArgvElement{...}
		ArgvElement{...}
		...
	]
	*/
```
Instance  ArgvPattern class - is intended to create a comparison pattern. 
 Extends ArgvArray;  
```js
	new ArgvPattern ('/command[\d]/i --option=/[\w]+/i');
	/**
	ArgvPattern extends ArgvArray[
		ArgvElement{...}
		ArgvElement{...}
		...
	]
	*/
```

ArgvElement - describes a command line element

```js
new ArgvElement('command1');
/**
ArgvElement{
	type:'command', // command or option . Default-command
	key:'command1',
	value:undefined,
	required:false, //Default-false 
	default:undefined,
	errorMessage:undefined,//alternative error message for comparison.Used in ArgvPattern class.
	order:1, //indicates command order. Added dynamically.For information only.
	pattern:[ArgvElement] //Added dynamically. assigned to the result element when compared with the pattern
}
*/

```
Other 
Instance  ArgvObject class -  Converted ArgvArray to object. Syntactic sugar.
```js
let argv=new ArgvArray('command1 --option1 command2');
argv=argv.toObject();
/*
	argv=>argvObject{
		commands:[ArgvElement{...}],
		options:{
			option1:ArgvElement{...}
		}
	}
*/
```
 
## pattern structure

String syntax is the same for ArgvArray constructor and for constructor ArgvPattern constructor.

### commands

The commands are enumerable. Each command has its own position in the commands stack.
Example 
```js
    let pattern= new ArgvPattern('command1 --option  command2');
    //order 1 - `command1`  
    //order 2 - `command2`  
```  
The command can be a "string" or " * " or a regular expression ( /expression/flags ):
- string  
```js
let pattern= new ArgvPattern('command1 "long command"'); 
// or
pattern= new ArgvPattern({type:'command',key:'command1'},{type:'command',key:'long command'});
pattern.compare('command1 "long command"');
```
- If "*", then any expression can be at this command position;
```js
let pattern= new ArgvPattern('*'); 
// or
pattern= new ArgvPattern({type:'command',key:'*'});
pattern.compare('anyCommand');
```
- If it is a regular expression, then the comparison will be performed according to the regular expression - `pattern.test (string)`.
```js
let pattern= new ArgvPattern('/command1|command1_1/i'); 
// or
pattern= new ArgvPattern({
    type:'command',
    key:/command1|command1_1/i // [object RegExp] 
});
pattern.compare('command1_1');
```

Extended syntax style for command pattern:
- `[! command_pattern]` - mandatory command
- `[command_pattern default_command]` - default if no command is specified
- `[! command_pattern default_command]` it makes no sense to write like this since the default value is set.
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
### options
Option names can be long or short. If the option is specified without a value, then the option is boolean and is equal to true.

```js
	let argv=new ArgvArray('--color -abc=good');
	/* 
	argv=>ArgvArray [
		ArgvElement {
			type:'option',
			key:'color'
			value:true
			...
		},
		ArgvElement {
			type:'option',
			shortKey:'a'
			value:true
			...
		},
		ArgvElement {
			type:'option',
			shortKey:'b'
			value:true
			...
		},
		ArgvElement {
			type:'option',
			shortKey:'c'
			value:'good'
			...
		}
	];
	*/
	
```

The option value in the pattern can be a string or * or a regular expression string ( `/expression/flags `)
```js
 	let argv=new ArgvPattern('--option1=string --option2="long string" --option3=* --option4=/[\d]+/i');
 	/* 
	argv=>ArgvPattern [
		ArgvElement {
			type:'option',
			key:'option1'
			value:'string'
			...
		},
		ArgvElement {
			type:'option',
			key:'option2'
			value:'long string'
			...
		},
		ArgvElement {
			type:'option',
			key:'option3'
			value:'*'
			...
		},
		ArgvElement {
			type:'option',
			key:'option4'
			value:/[\d]+/i 
			...
		}
	];
	*/
```

Separator for values
```js
let argv=new ArgvArray('--option=value');
argv=new ArgvArray('--option:value');
argv=new ArgvArray(['--option value']); 
/* 
since the parser does not know what comes after the option name with a space (command or value for option ),  
the set of parameters should be specified through  
an array or instead of a space,  
explicitly indicate "=" or ":"
*/ 
```
How to determine on the command line that after the option name with a space comes the option value?
```js
	
	let argv=new  ArgvArray('--option1 "value for option"');
	// or
	argv=new  ArgvArray(['--option1', 'value for option']);
	/*
		argv=>[
			ArgvElement {
				type:'option',
				key:'option1'
				value:true
				...
			},
			ArgvElement {
				type:'command',
				key:'value for option'
				...
			},
		];
	*/
```
Answer:
If a command line or an array of parameters is compared with a pattern, then value for option will be determined according to the settings of the pattern.

```js
let pattern=new ArgvPattern('--option1=*');
let result=pattern.compare(['--option1', 'value for option']);
	/*
		result=>[
			ArgvElement {
				type:'option',
				key:'option1'
				value:'value for option'
				...
			}
		];
	*/
```

### Поиск элементов.
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
