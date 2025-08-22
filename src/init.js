#!/usr/bin/env node

/**
 * ccenv 初始化脚本
 * 在 npm install 后自动运行，创建配置目录和默认配置文件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getShellTemplate, detectShell } = require('./shell-templates');

// 配置文件路径
const os = require('os');
const CONFIG_DIR = path.join(os.homedir(), '.ccenv');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

// 默认配置内容
const DEFAULT_CONFIG = {
  defaultProfile: null,
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
 * 创建目录（如果不存在）
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// detectShell 函数现在从 shell-templates.js 导入

/**
 * 获取 shell 配置文件路径
 */
function getShellConfigFile(shellType) {
  const homeDir = os.homedir();
  
  switch (shellType) {
    case 'zsh':
      // 优先使用 .zshrc，如果不存在则使用 .zprofile
      const zshrc = path.join(homeDir, '.zshrc');
      const zprofile = path.join(homeDir, '.zprofile');
      return fs.existsSync(zshrc) ? zshrc : zprofile;
    
    case 'bash':
      // 优先使用 .bashrc，如果不存在则使用 .bash_profile
      const bashrc = path.join(homeDir, '.bashrc');
      const bash_profile = path.join(homeDir, '.bash_profile');
      return fs.existsSync(bashrc) ? bashrc : bash_profile;
    
    case 'fish':
      const fishConfig = path.join(homeDir, '.config', 'fish', 'config.fish');
      // 确保 fish 配置目录存在
      const fishDir = path.dirname(fishConfig);
      if (!fs.existsSync(fishDir)) {
        fs.mkdirSync(fishDir, { recursive: true });
      }
      return fishConfig;
    
    default:
      return null;
  }
}

// generateShellFunction 函数现在从 shell-templates.js 获取

/**
 * 安装 shell 函数
 */
function installShellFunction() {
  try {
    const shellType = detectShell();
    const template = getShellTemplate(shellType);
    
    if (!template) {
      console.log('⚠️  无法获取 shell 模板，请手动添加 shell 函数');
      return false;
    }
    
    const configFile = getShellConfigFile(shellType);
    if (!configFile) {
      console.log(`⚠️  无法找到 ${shellType} 配置文件`);
      return false;
    }
    
    // 检查是否已经安装了函数
    let existingContent = '';
    if (fs.existsSync(configFile)) {
      existingContent = fs.readFileSync(configFile, 'utf8');
      if (existingContent.includes('ccenv function for easy profile switching')) {
        console.log(`✅ ccenv shell 函数已存在于 ${configFile}`);
        return true;
      }
    }
    
    // 添加函数到配置文件
    const functionCode = `\n${template.comment}\n${template.function}\n`;
    fs.appendFileSync(configFile, functionCode);
    
    console.log(`✅ 已安装 ccenv shell 函数到 ${configFile}`);
    console.log(`   请运行 'source ${configFile}' 或重新打开终端以使用新函数`);
    
    return true;
    
  } catch (error) {
    console.log(`⚠️  安装 shell 函数时出错: ${error.message}`);
    return false;
  }
}

/**
 * 初始化配置
 */
function init() {
  try {
    console.log('正在初始化 ccenv...');
    
    // 创建配置目录
    if (!fs.existsSync(CONFIG_DIR)) {
      console.log(`创建配置目录: ${CONFIG_DIR}`);
      ensureDir(CONFIG_DIR);
    }
    
    // 创建默认配置文件
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(`创建默认配置文件: ${CONFIG_FILE}`);
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
      console.log('已创建默认配置文件');
    } else {
      console.log('配置文件已存在，跳过创建');
    }
    
    // 安装 shell 函数
    console.log('\n正在安装 shell 函数...');
    installShellFunction();
    
    console.log('\n✅ ccenv 初始化完成!');
    console.log('');
    console.log('使用方法:');
    console.log('  ccenv ls         # 查看所有配置');
    console.log('  ccenv kimi       # 切换到 kimi 配置');
    console.log('  ccenv -h         # 显示帮助');
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

module.exports = { init };