const program = require('commander');
const chalk = require('chalk');

program.version('1.0.0', '-v, --version');
program.command('init <name>').action(function(name){
  console.log(program.commands[0].opts());
});
program.parse(process.argv);