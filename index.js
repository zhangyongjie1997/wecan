#!/usr/bin/env node
const program = require('commander');
const inquirer = require('inquirer');
const symbols = require('log-symbols');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const chalk = require('chalk');
const ora = require('ora');
const shell = require('shelljs');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    console.log(name);
  });
program.parse(process.argv);