import {ArgvPattern,ArgvArray} from "../../src/export.js";

QUnit.module('Test ArgPattern class');
QUnit.test('test methods',function(assert) {

    // ArgvPattern.compare method
    {
        let match=new ArgvArray('command1 --option=value -o="string value"');
        let pattern=new ArgvPattern('/command1|command2/ --option=value -o="string value"');
        let result=pattern.compare('command1 --option="value" command2 -o:"string value" command3');
        result.forEach(value=>delete value.pattern);
        assert.deepEqual(result,match,' ArgvPattern.compare method');
    }

    // ArgvPattern.toString method
    {
        let match='[! command1 "command2" ] -a=true -b=false -c=100 [! --option -o "value string" "default string" ]';
        let pattern=new ArgvPattern('[!command1 command2]  -ab=false -c=100 [!--option -o "value string" "default string"]');
        let result=pattern.toString();
        assert.equal(result,match,'ArgvPattern.toString method');
    }
});