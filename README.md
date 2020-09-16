# Install

## Description
This component allows you to manage command line parameters (argv parameters).  
To do this, create a pattern and compare parameters of incoming requests from the console with this pattern.
Why another semblance of Commander.js component?
 This is a different look at writing commanders.
 To do this, create a pattern and compare parameters of incoming requests from the console with this pattern.
For example, let's create a helper for a certain start command that launches the specified script.

If the examples are not clear the first time, that's okay. They are presented for general presentation.

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
For example, let's create a helper for a certain start command that launches the specified script.
```js
let pattern = new ArgvPattern('/start|end/i /[\\s\\w]\\.js/i [--force -f] [--help -h]');  
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
		// add a description of the "start" command
		message.push(helpMessages['start']);  
		check=true;  
	} else  
	if(argv.get('end',{order:1})){  
		// add a description of the "end" command
	    message.push(helpMessages['end']);  
		check=true;  
	}  
	// add the "--force" description if there is a "start" or "end" command and the '--force' parameter is present or there are no options other than '--help'.
	if(check===true &&  
		(
			argv.get('--force') || 
			argv.searchElement({type:'option',key:/[\w]+/i}).length<=1 && 
			diff.searchElement({type:'option',key:/[\w]+/i}).length<=0
		)
	){
	    message.push(helpMessages['--force']);  
	}  
// add the entire description if there are no specified commands
	if(!check){  
	    message=Object.values(helpMessages);  
	}  
	if(message.length>0){  
	    console.log(message.join("\n"));  
	}  
} else {  
    // code for start or end script    
}  
// other code. Suppose you decided to expand the functionality by adding parameters without interfering with the main code.
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
		// add the description "--after" if there is a command "start" and the parameter '--after' is present or there are no options other than '--help'
		argv.get('start',{order:1}) && 
		(
			extArgv.get('--after')  ||
			argv.searchElement({type:'option',key:/[\w]+/i}).length<=1
			diff.searchElement({type:'option',key:/[\w]+/i}).length<=0
		)
	){  
	        message.push(extHelpMessages['--after']['start']);  
	} else 
// add the "--after" description if there is an "end" command and the '--after' parameter is present or there are no options other than '--help'
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
	// add all "--after" descriptions if there are no options except for '--help'
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
OK. But why do we need to write a helper?  For starters, this is an example that shows how you can work with this module. Helper('--help' ) is implemented in this module. Its description will be after.

## classes for instances

Instance [ArgvArray](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html) class - intended for command line elements. Describes the command line.  Extends Array;
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
Instance  [ArgvPattern](docs/module-@alexeyp0708_argv_patterns.ArgvPattern.html) class - is intended to create a comparison pattern. 
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

Instance [ArgvElement](docs/module-@alexeyp0708_argv_patterns.ArgvElement.html) class - describes a command line element

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
Instance  [ArgvObject](docs/module-@alexeyp0708_argv_patterns.ArgvObject.html) class -  Converted ArgvArray to object. Syntactic sugar.
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
 
## Pattern string syntax 

String syntax is the same for ArgvArray constructor, for constructor ArgvPattern constructor,for ArgObject constructor and for ArgvElement constructor.
ArgvElement accepts single parameter syntax.

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
- If it is a regular expression, then the comparison will be performed according to the regular expression - `reg_exp.test (string)`.
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
- `[command_pattern]` - {type:'command', key:'command_pattern'} 
- `[command_pattern default_command]` - {type:'command', key:'command_pattern', default:'default_command'} 
- `["long command" "default command"]` - {type:'command', key:'long command', default:'default command'} 
- `[!"long command"]`- {type:'command', key:'long command', required:true} 

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
Extended syntax style options for pattern:
- `[--option]` => {type:'option', key:'option', value:true}
- `[--option -o]` or `[-o --option]` => {type:'option', key:'option', shortKey:'o',value:true}
- `[-o]` =>{type:'option', shortKey:'o', value:true}
- [--option value] =>{type:'option',  key:'option', value:"value"}
- `[--option "long value"]` =>{type:'option',  key:'option', value:"long value"}
- `[--option "long value" "default value"]` =>{type:'option',  key:'option', value:"long value", default:"default value"}
- `[! --option "long value"] =>`{type:'option',  key:'option', value:"long value", required:true}
- `[ --option -o "long value" "default value"]` -  What will happen here? ))))

```js
 let pattern=new ArgvPattern('command1 [!--option -o *]');
 let command=pattern.compare('command1 -o "a good day"');
 console.log(command);
 /*
    [
        {
            type:'command',
            key:'command1'
            //....
        },
        {
            type:'option',
            key:'option',
            shortKey:'o',
            value:'a good day',
            required:true
            //....
        }
    ]
 */
```

```js
 let pattern=new ArgvPattern('command1 [--option -o * "a bad day"]');
 let command=pattern.compare('command1');
 /*
    [
        {
            type:'command',
            key:'command1'
            //....
        },
        {
            type:'option',
            key:'option',
            shortKey:'o',
            value:'a bad day',
            required:true
            //....
        }
    ]
 */

```
## Brief API
You will use the following methods and objects in your code:
- [ArgvArray](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html) object - an array of parameters (ArgvElemnet objects) created from argv parameters or command line. (Further command line array)
- [ArgvPattern](docs/module-@alexeyp0708_argv_patterns.ArgvPattern.html ) object (extends ArgvArray) - массив параметров (ArgvElemnet objects) , an array of parameters (ArgvElemnet objects) created from argv parameters (array) or the command line. It is intended to compare parameters and command line with it. (Further: command line pattern)
- [ArgvElement](docs/module-@alexeyp0708_argv_patterns.ArgvElement.html ) object -an object that describes a command line parameter. (Further:command line element)
- [ArgvArray.prototype.add](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#add) method - adds a new command line element according to the specified criteria, which is not yet in the command line array.
- [ArgvArray.prototype.set](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#set) method - adds a new or modifies an existing command line element.
- [ArgvArray.prototype.get] (docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#get) method - adds a new or modifies an existing command line element
- [ArgvArray.prototype.searchElement] (docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#searchElement) method - searches for command line elements that match the criteria.
- [ArgvArray.prototype.searchElements](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#searchElement#searchElements) method - searches for command line elements that match multiple command line criteria.
-  [ArgvArray.prototype.toObject](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#searchElement#toObject) method - converts to ArgvObject, for ease of use
-  [ArgvArray.prototype.toString](docs/module-@alexeyp0708_argv_patterns.ArgvArray.html#searchElement#toString) method -converts a command line array to a command line.
-  [ArgvPattern.prototype.compare](docs/module-@alexeyp0708_argv_patterns.ArgvPattern.html#searchElement#compare) method - compares a command line array or command line to a command line pattern.
- [ArgvPattern.prototype.toString](docs/module-@alexeyp0708_argv_patterns.ArgvPattern.html#searchElement#toString) method - converts the command line pattern from an array to a command line.
- 
#### ArgvArray array
```js

// passing a solid command line
let argvLine=new ArvArray('command1 --option subCommand');

// or pass an array of strings of command line parameters
argvLine=new ArvArray(['command1', '--option', 'subCommand']);

//or each argument is a command line parameter string
argvLine= new ArvArray('command1',  '--option','subCommand');

/*or the above is repeated, but ArgvElement objects or their templates are passed as parameters.*/
argvLine= new ArvArray(new ArgvElement('command1'), {type:'option', key:'option'},'subCommand');

// Each command line parameter passed will be an ArgvElement for the ArgvArray array.
argvLine.set('subCommand',{required:true}); // find subCommand name and set new data
// or
argvLine.set('[! subCommand]');
//or
argvLine.set('[! /subCommand[\w]*/i]');
//or
argvLine.set({type:'command',key:'subCommand',required:true});
//or
argvLine.set({type:'command',key:'/subCommand[\w]/i',required:true});

/*for the set method, the element is searched only by the
properties key, shortKey, or by order for commands.*/

/* if you specify the "order" property, it will search for 
a specific command position and will replace with new data.*/
argvLine.set('[! newSubCommand]',{order:2}); 

/*In the "add" method, the argument passing logic is the same as in the set method examples.
For the "add" method, the element is searched only by the
properties key, shortKey, or by order for commands.
No search is performed for commands by key.
Only search by order.
*/

//add new command in order 3
argvLine.add('subCommand',{required:true}); 

//The parameter was not added because the 2nd command already exists.
argvLine.add('subCommand',{order:2.required:true});

/*for add and set methods you can use the following syntax:*/
(new ArgvArray())
.set('command')
.add('subCommand')
.add('--option');


/* In the "get" method, the argument passing logic is the same 
as in the set method examples. 
Returns an ArgvElement object.
The get method uses the searchElement method to search. 
Therefore, the search logic for these methods will be the 
same.
The get method returns the first match it finds.
Search is performed by keys, order (if this is a command) 
and value (if this is an option).
If a command is searched for, but no order is specified, the command corresponding to the key will be found.
*/

// return {key:'subCommand',order:2}
element=argvLine.get('subCommand'); 

// return {key:'subCommand',order:2} if key==='subCommand' and order===2
element=argvLine.get('subCommand',{order:2}); 

// return the command at order 2
element=argvLine.get({order:2}); 

//Will return the command at order 2 if its key matches the pattern
element=argvLine.get('/^subCommand[\d]*/i',{order:2});

// will return the option "option" 
element=argvLine.get('--option');

// will return the option "option" if the value matches "value"
element=argvLine.get('--option=value');

// will return the option "option" if its value matches the pattern
element=argvLine.get('--option=/^value[\d]*/i');

// Returns the option whose key is equal to the pattern
element=argvLine.get({type:'option',key:'/^opton[\d]*/i'});

//the searchElement method, unlike the get method, returns a set of matches.
// return ArgvArray
argvLine.searchElement('--option');

// return ArgvArray
argvLine.searchElement({type:'option',key:'/^option[\d]/i'});

//Will only return an array with the first match
argvLine.searchElement({type:'option',key:'/^option[\d]/i'},true); 

//searchElements method will return all matches according to the specified criteria in the 1st argument array.
argvLine.searchElements(['command1','--option']);

//if it is necessary to return 1 match for each criterion
argvLine.searchElements(['command1','--option'],true);

//If you need to return ArgvArray as a single command of the found matches
argvLine.searchElements(['command1','--option'],true,true);
//or
argvLine.searchElements(['command1','--option'],false,true);

argvLine.toString(); // return string command line 
```

#### ArgvPattern array
ArgvPattern completely repeats the ArgvArray methods
```js
let pattern= new ArgvPattern('[/command1|command2/i command1] --option=*');
let diff=new ArgvArray(); // or Array();//these are filtered parameters that do not match the pattern and are not included in the result. 
let argv=pattern.compare(new ArgvArray('command1 --option "value option"'),diff);
//or
argv=pattern.compare('command1 --option "value option"',diff);
//or 
argv=pattern.compare(['command1', '--option "value option"'],diff);

/*
Error: Throws an error if the parameter is set according to 
the pattern, but does not match the criteria of the pattern. 
Error: Throws an error if an extra parameter is passed. Throws an error if diff argument is false. 
Error: Throws an error if the parameter is required according 
to the pattern, but it is missing and the default value is 
not set in the pattern.

*/

pattern.toString(); // return [/command1|command2/i command1] --option=*
```

## To write your own help.

Help description is aimed at describing the command set as a whole, and not just a specific parameter. And the goal is to concentrate a set of command descriptions in one place. So how to describe your command patterns.

```js
// 
let pattern=new ArgvPattern('/command1|command2/i * [* default] --option=value');
let descriptions={
	'-':'Basic script description'
	/*   
if we want to describe subcommands or options for which they 
are used differently, then we create an object, otherwise 
just describe the parameter in the string. 
*/
	'command1':{
		'-':'description "command1"'
		'*':{
			'-':'description "command1 *"',
			'*':{
				'-':'description "command1 * *"',
				'--option':'(specific application of the option) description "command1 * * --option=value'
			},
			'--option':'(specific application of the option) description "command1 * --option=value"''
			
		}
		'--option':'basic description "command1 * --option=value"'
	}
	'command2':'description "command2"'
};
/*
 to activate help when comparing and generating a help 
 message, you need to add it to the pattern.
 */
pattern.set('[--help -h]',{descriptions});
pattern.set('--option2',{
	//add '--option' description or change to "--help"
	descriptions:{
		'command2':{
			'--option2':'description "command2 --option2"'
		}
	}
});
//Help will be displayed based on the command. or description of all commands
let argv=pattern.compare('command1 --help');
let help=argv.get('--help');
if(help){
	console.log(help.helpMessage);
}
```
 
