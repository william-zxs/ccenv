#!/usr/bin/env node

/**
 * claudenv 初始化脚本
 * 在 npm install 后自动运行，创建配置目录和默认配置文件
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const { detectShell, getShellTemplate, getShellConfigFiles } = require('./shell-templates');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.claudenv');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

// 默认配置内容
const DEFAULT_CONFIG = {
  profiles: [
    {
      name: "kimi",
      env: {
        ANTHROPIC_BASE_URL: "https://api.moonshot.cn/anthropic",
        ANTHROPIC_AUTH_TOKEN: "",
        ANTHROPIC_MODEL: "kimi-k2-turbo-preview",
        ANTHROPIC_SMALL_FAST_MODEL: "kimi-k2-turbo-preview"
      }
    },
    {
      name: "bigmodel",
      env: {
        ANTHROPIC_BASE_URL: "https://open.bigmodel.cn/api/anthropic",
        ANTHROPIC_AUTH_TOKEN: ""
      }
    },
    {
      name: "qianwen",
      env: {
        ANTHROPIC_BASE_URL: "https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy",
        ANTHROPIC_AUTH_TOKEN: ""
      }
    }
  ]
};

/**
 * 安装 shell 函数到用户配置文件
 */
async function installShellFunction() {
  const shell = detectShell();
  const template = getShellTemplate(shell);
  const configFiles = getShellConfigFiles(shell);
  
  console.log(`\n检测到您使用的是 ${shell} shell`);
  
  // 检查是否在交互式终端中
  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
  let installFunction = true;
  
  if (isInteractive) {
    try {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installFunction',
          message: '是否要安装 shell 函数以便直接使用 "claudenv [profile]" 命令？',
          default: true
        }
      ]);
      installFunction = answers.installFunction;
    } catch (error) {
      console.log('交互式询问失败，默认安装 shell 函数...');
    }
  } else {
    console.log('非交互式环境，自动安装 shell 函数...');
  }
  
  if (!installFunction) {
    console.log('\n跳过 shell 函数安装。');
    console.log('如果需要使用 claudenv，请手动执行：');
    console.log('  eval "$(claudenv [profile])"');
    return false;
  }
  
  // 找到合适的配置文件
  let targetConfigFile = null;
  for (const configFile of configFiles) {
    const fullPath = path.join(os.homedir(), configFile);
    if (fs.existsSync(fullPath)) {
      targetConfigFile = fullPath;
      break;
    }
  }
  
  // 如果没有找到现有配置文件，创建默认的
  if (!targetConfigFile) {
    targetConfigFile = path.join(os.homedir(), configFiles[0]);
    // 确保目录存在
    await fs.ensureDir(path.dirname(targetConfigFile));
  }
  
  try {
    // 检查是否已经安装过 claudenv 函数
    let existingContent = '';
    if (fs.existsSync(targetConfigFile)) {
      existingContent = await fs.readFile(targetConfigFile, 'utf8');
    }
    
    if (existingContent.includes('claudenv() {') || existingContent.includes('function claudenv')) {
      console.log(`\n✅ claudenv 函数已存在于 ${path.relative(os.homedir(), targetConfigFile)}`);
      return true;
    }
    
    // 添加 shell 函数
    const functionContent = `\n${template.comment}\n${template.function}\n`;
    await fs.appendFile(targetConfigFile, functionContent);
    
    console.log(`\n✅ 已安装 claudenv shell 函数到 ${path.relative(os.homedir(), targetConfigFile)}`);
    console.log('\n请重新加载您的 shell 配置或重启终端：');
    console.log(`  source ${targetConfigFile}`);
    
    return true;
  } catch (error) {
    console.error('\n❌ 安装 shell 函数失败:', error.message);
    console.log('\n手动安装说明：');
    console.log(`在您的 ${configFiles[0]} 文件中添加以下内容：`);
    console.log(template.function);
    return false;
  }
}

/**
 * 初始化配置
 */
async function init() {
  try {
    console.log('正在初始化 claudenv...');
    
    // 创建配置目录
    if (!fs.existsSync(CONFIG_DIR)) {
      console.log(`创建配置目录: ${CONFIG_DIR}`);
      await fs.ensureDir(CONFIG_DIR);
    }
    
    // 创建默认配置文件
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(`创建默认配置文件: ${CONFIG_FILE}`);
      await fs.writeJson(CONFIG_FILE, DEFAULT_CONFIG, { spaces: 2 });
      console.log('已创建默认配置文件');
    } else {
      console.log('配置文件已存在，跳过创建');
    }
    
    // 安装 shell 函数
    const shellFunctionInstalled = await installShellFunction();
    
    console.log('\n✅ claudenv 初始化完成!');
    console.log('');
    
    if (shellFunctionInstalled) {
      console.log('使用方法（推荐）:');
      console.log('  claudenv           # 交互式选择配置');
      console.log('  claudenv kimi      # 直接切换到指定配置');
      console.log('');
      console.log('备用方法:');
      console.log('  eval "$(claudenv kimi)"  # 如果上述方法不工作');
    } else {
      console.log('使用方法:');
      console.log('  eval "$(claudenv)"        # 交互式选择配置');
      console.log('  eval "$(claudenv kimi)"   # 直接切换到指定配置');
    }
    
    console.log('');
    console.log(`配置文件位置: ${CONFIG_FILE}`);
    console.log('');
    console.log('⚠️  注意: 请编辑配置文件，填入您的 API Token');
    
  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
if (require.main === module) {
  init();
}

module.exports = { init, installShellFunction };