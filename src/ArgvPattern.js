import {Argv,ArgvArray,ArgvObject} from './export.js';
export class ArgvPattern extends ArgvArray{
   constructor(...args){
       try{
           super(...args);
       }catch(e){
           if(/^Bad parameters:/.test(e.old_message)){
               let message=e.old_message+
                   "\nParameters format should be for pattern:\n"+
                   "   command"+
                   "   * (any command)\n" +
                   "   /pattern/i  (regular expression for command)\n" +
                   "   [-k --key value]\n" +
                   "   [-k value]\n" +
                   "   [--key value]\n" +
                   "   [-k --key]\n" +
                   "   [! -k --key \"value string\" \"default value\"]\n" +
                   "   -k\n" +
                   "   -k = value\n" +
                   "   -k : value\n" +
                   "   --key = value\n" +
                   "   --key : value\n" +
                   "   -abcd (equivalent \"-a -b -c -d )\n" +
                   "   -abcd = value (equivalent \"-a -b -c -d = value\").\n";
               let ne=new Error(message);
               ne.message=e.message;
               throw ne;
           }
           throw e;
       }
   }
   compare (argv,diff){
       return Argv.compareArgvToPatterns(this,argv,diff);
   }

   toString(){
       return Argv.elementsToPattern(this);
   }
}