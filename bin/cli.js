#! /usr/bin/env node

const program = require('commander')
const chalk = require('chalk')

program
   // 配置版本号信息
  .version(`v${require('../package.json').version}`)
  .usage('<command> [option]')

program
  .on('--help', () => {
    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`liangsl-cli <command> --help`)} show details\r\n`)
  })

program
  // 定义命令和参数
  .command('create <app-name>')
  .description('create a new project')
  // -f or --force 为强制创建，如果创建的目录存在则直接覆盖
  .option('-f, --force', 'overwrite target directory if it exist')
  .action(require("../lib/create"))
  
// 解析用户执行命令传入参数
program.parse(process.argv);