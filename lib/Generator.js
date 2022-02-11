const path = require('path')
const ora = require('ora')
const inquirer = require('inquirer')
const chalk = require('chalk') 
const { copySync } = require('fs-extra')
const { promisify } = require('util')
const downloadGitRepo = promisify(require('download-git-repo'))
const { readFileSync, writeFileSync } = require('fs');

const { getRepoList, getTagList } = require('./http')

const CHARSET = 'utf-8';

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result; 
  } catch (error) {
    // 状态为修改为失败
    spinner.fail('Request failed, refetch ...')
  } 
}

class Generator {
  constructor (name, targetDir){
    this.name = name; // 目录名称
    this.targetDir = targetDir; // 创建位置
    this.vue_version = '' // 当前选择的vue版本
    this.packageJson = {} // 模板的package.json文件内容
    this.mainJS = '' // 模版的main.ts内容
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称
  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template');
    if (!repoList) return;

    // 过滤我们需要的模板名称
    const repos = repoList.map(item => item.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo',
      type: 'list',
      choices: repos,
      message: 'Please choose a template to create project'
    })

    this.vue_version = repo.split('-')[0]

    // 3）return 用户选择的名称
    return repo;
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）用户选择自己需要下载的 tag
  // 3）return 用户选择的 tag
  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo);
    if (!tags) return;
    
    // 过滤我们需要的 tag 名称
    const tagsList = tags.map(item => item.name);

    // 2）用户选择自己需要下载的 tag
    const { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tagsList,
      message: 'Place choose a tag to create project'
    })

    // 3）return 用户选择的 tag
    return tag
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag){

    // 1）拼接下载地址
    const requestUrl = `liangsl-cli/${repo}${tag?'#'+tag:''}`;

    // 2）调用下载方法
    await wrapLoading(
      downloadGitRepo, // 远程下载方法
      'waiting download template', // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir) // 参数2: 创建位置
    )
  }

  // 设置第三方库选项
  async setLibFeatures() {
    const prompts = [
      {
        name: "features", // 选项名称
        message: "Check the features needed for your project:", // 选项提示语
        pageSize: 10,
        type: "checkbox", // 选项类型
        choices: require(`./generator/${this.vue_version}/features.json`)
      }
    ]
    const { features } = await inquirer.prompt(prompts)
    return features
  }

  // 处理选择的第三方库（todo: 暂时用字符串替换的方式，更好的应通过ast进行注入）
  async handleLibFeatures(features) {
    const PACKAGE_FILE = path.resolve(this.targetDir, 'package.json');
    this.packageJson = JSON.parse(readFileSync(PACKAGE_FILE), CHARSET)

    const MAIN_FILE = path.resolve(this.targetDir, 'src/main.ts');
    this.mainJS = readFileSync(MAIN_FILE, CHARSET)

    for(let feature of features) {
      require(`./generator/${this.vue_version}/${feature}`)(this)
    }

    writeFileSync(PACKAGE_FILE, JSON.stringify(this.packageJson), CHARSET);
    writeFileSync(MAIN_FILE, this.mainJS, CHARSET);
  }

  // 在package.json中注入依赖
  extendPackage(name, version) {
    this.packageJson.dependencies[name] = version
  }
  // 在main.js中注入所选项
  injectImports(imports, useContent) {
    const importBase = "import App from './App.vue'"
    const appUseBase = "app."

    this.mainJS = this.mainJS.replace(importBase, importBase + '\n' + imports)
    this.mainJS = this.mainJS.replace(appUseBase, appUseBase + `${useContent}.`)
  }
  // 把选项模板拷贝到目标目录
  async copyTemplate(module, target) {
    const source = path.resolve(__dirname, `./generator/${this.vue_version}/${module}/template`)
    target = path.resolve(this.targetDir, target)
    await copySync(source, target)
  }

  // 核心创建逻辑
  async create(){
    // 1）获取模板名称
    const repo = await this.getRepo()
    // 2) 获取 tag 名称
    const tag = await this.getTag(repo)
    // 3）下载模板到模板目录
    await this.download(repo, tag)
    // 4) 选择第三方库
    const features = await this.setLibFeatures()
    // 5) 处理选择的第三方库，放进package.json
    this.handleLibFeatures(features)
    
    // 4）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
    console.log(`\r\n  npm install`)
    console.log('  npm run dev\r\n')
  }
}

module.exports = Generator;
