const path = require('path')
const fs = require('fs-extra')
const clear = require('clear')
const figlet = require('figlet')
const inquirer = require('inquirer')

const Generator = require('./Generator')

module.exports = async function (name, options) {
  // 执行创建命令
  // clear()
  // const data = figlet.textSync("cci-yingji-cli Welcome")
  // console.log(data)

  
  const cwd  = process.cwd(); // 当前命令行选择的目录
  const targetAir  = path.join(cwd, name) // 需要创建的目录地址

  await checkExists(targetAir, options.force)

  const generator = new Generator(name, targetAir)
  generator.create()
}

// 检查目录是否存在，是否强制创建
async function checkExists(targetAir, force) {
  // 目录是否已经存在？
  if (fs.existsSync(targetAir)) {
    // 是否为强制创建？
    if (force) {
      await fs.remove(targetAir)
    } else {
      // 询问用户是否确定要覆盖
      const { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            {
              name: 'Overwrite',
              value: 'overwrite'
            },{
              name: 'Cancel',
              value: false
            }
          ]
        }
      ])
      
      if (!action) {
        return
      } else if (action === 'overwrite') {
        await fs.remove(targetAir)
      }
    }
  }
}
