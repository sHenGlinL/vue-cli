const path = require('path')
const ora = require('ora')
const inquirer = require('inquirer')
const chalk = require('chalk') 
// const globby = require('globby')
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
        "name": "features", // 选项名称
        "message": "Check the features needed for your project:", // 选项提示语
        "pageSize": 10,
        "type": "checkbox", // 选项类型
        "choices": [
          {
            "name": "Element-Plus",
            "value": "element",
            "short": "Element",
            "description": "Element Plus，一套为开发者、设计师和产品经理准备的基于 Vue 3 的桌面端组件库",
            "link": "https://element-plus.gitee.io/zh-CN/#/zh-CN",
            "checked": true
          },
          {
            "name": "Vue-Router",
            "value": "router",
            "short": "Router",
            "description": "The official router for Vue.js",
            "link": "https://router.vuejs.org/",
            "checked": true
          },
          {
            "name": "Vuex",
            "value": "vuex",
            "short": "Vuex",
            "description": "Vuex is a state management pattern + library for Vue.js applications",
            "link": "https://vuex.vuejs.org/",
            "checked": false
          },
          {
            "name": "Lodash",
            "value": "lodash",
            "short": "Lodash",
            "description": "A modern JavaScript utility library delivering modularity, performance & extras.",
            "link": "https://lodash.com/",
            "checked": false
          },
          {
            "name": "Moment.js",
            "value": "moment",
            "short": "Moment",
            "description": "JavaScript日期处理类库",
            "link": "http://momentjs.cn/",
            "checked": false
          },
        ]
      },
    ]
    const { features } = await inquirer.prompt(prompts)
    return features
  }

  // 处理选择的第三方库（todo: 暂时用字符串替换的方式，更好的应通过ast进行注入）
  async handleLibFeatures(features) {
    const PACKAGE_FILE = path.resolve(this.targetDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(PACKAGE_FILE), CHARSET)

    const MAIN_FILE = path.resolve(this.targetDir, 'src/main.ts');
    let mainTS = readFileSync(MAIN_FILE, CHARSET)

    const importBase = "import App from './App.vue'"
    const appUseBase = "app."

    if (features.includes('element')) {
      packageJson.dependencies["element-plus"] = "^2.0.1"
    }
    if (features.includes('router')) {
      packageJson.dependencies["vue-router"] = "^4.0.5"
      mainTS = mainTS.replace(importBase, importBase + '\n' + "import router from './router'")
      mainTS = mainTS.replace(appUseBase, appUseBase + 'use(router).')

      // 拷贝模版
      const source = path.resolve(__dirname, './generator/router')
      const target = path.resolve(this.targetDir, 'src/router')
      await copySync(source, target)
    }
    if (features.includes('vuex')) {
      packageJson.dependencies["vuex"] = "^4.0.2"
      mainTS = mainTS.replace(importBase, importBase + '\n' + "import { store, key } from './store'")
      mainTS = mainTS.replace(appUseBase, appUseBase + 'use(store, key).')

      // 拷贝模版
      const source = path.resolve(__dirname, './generator/vuex')
      const target = path.resolve(this.targetDir, 'src/store')
      await copySync(source, target)
    }
    if (features.includes('lodash')) {
      packageJson.dependencies["lodash"] = "^4.17.21"
    }
    if (features.includes('moment')) {
      packageJson.dependencies["moment"] = "^2.29.1"
    }
    writeFileSync(PACKAGE_FILE, JSON.stringify(packageJson), CHARSET);
    writeFileSync(MAIN_FILE, mainTS, CHARSET);
  }

  // async render(source) {
  //   source = path.resolve(__dirname, source)
  //   // 读取目录中所有的文件
  //   const _files = await globby(['**/*'], { cwd: source, dot: true })
  //   console.log('_files',_files);
  //   for (const rawPath of _files) {
  //     const sourcePath = path.resolve(source, rawPath)
  //   }
  // }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
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
