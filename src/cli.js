#!/usr/bin/env node

/**
 * claudenv - 便捷切换 Claude API 配置的命令行工具
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const { spawn } = require('child_process');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.claudenv');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

// 环境变量名称
const ENV_VARS = [
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_SMALL_FAST_MODEL'
];

/**
 * 检查配置文件是否存在
 */
function checkConfigFile() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.error(`错误: 配置文件不存在 ${CONFIG_FILE}`);
    console.error('请先运行安装脚本生成配置文件');
    process.exit(1);
  }
}

/**
 * 读取配置文件
 */
function readConfig() {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error('错误: 无法读取配置文件', error.message);
    process.exit(1);
  }
}

/**
 * 获取当前生效的配置
 */
function getCurrentProfile() {
  const currentBaseUrl = process.env.ANTHROPIC_BASE_URL;
  if (!currentBaseUrl) {
    return null;
  }
  
  const config = readConfig();
  const profile = config.profiles.find(p => 
    p.env && p.env.ANTHROPIC_BASE_URL === currentBaseUrl
  );
  
  return profile ? profile.name : null;
}

/**
 * 获取所有配置名称
 */
function getProfileNames() {
  const config = readConfig();
  return config.profiles.map(p => p.name);
}

/**
 * 根据名称获取配置
 */
function getProfileConfig(profileName) {
  const config = readConfig();
  return config.profiles.find(p => p.name === profileName);
}

/**
 * 应用配置
 */
function applyProfile(profileName) {
  const profileConfig = getProfileConfig(profileName);
  
  if (!profileConfig) {
    console.error(`错误: 找不到配置 '${profileName}'`);
    process.exit(1);
  }
  
  // 先清除现有的环境变量
  ENV_VARS.forEach(varName => {
    delete process.env[varName];
  });
  
  // 应用新配置
  if (profileConfig.env) {
    ENV_VARS.forEach(varName => {
      if (profileConfig.env[varName]) {
        process.env[varName] = profileConfig.env[varName];
      }
    });
  }
  
  console.log(`已切换到配置: ${profileName}`);
}

/**
 * 启动 claude 命令
 */
function startClaude() {
  console.log('正在启动 claude...');
  
  // 使用 spawn 来执行 claude 命令，并继承当前进程的环境变量
  const claude = spawn('claude', [], {
    stdio: 'inherit',
    env: process.env
  });
  
  claude.on('error', (error) => {
    console.error('警告: 找不到 claude 命令');
    console.error('请确保 claude 已正确安装并在 PATH 中');
  });
  
  claude.on('close', (code) => {
    process.exit(code);
  });
}

/**
 * 交互式菜单
 */
async function showInteractiveMenu() {
  checkConfigFile();
  
  const profileNames = getProfileNames();
  const currentProfile = getCurrentProfile();
  
  // 构建选择项，标记当前配置
  const choices = profileNames.map(name => ({
    name: name === currentProfile ? `${name} *` : name,
    value: name
  }));
  
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'profile',
        message: '选择 Claude API 配置:',
        choices: choices,
        default: currentProfile || profileNames[0]
      }
    ]);
    
    applyProfile(answers.profile);
    console.log();
    startClaude();
    
  } catch (error) {
    if (error.isTtyError) {
      console.error('错误: 无法在非交互式终端中运行');
    } else {
      console.error('错误:', error.message);
    }
    process.exit(1);
  }
}

/**
 * 显示版本信息
 */
function showVersion() {
  const packageJson = require('../package.json');
  console.log(`claudenv v${packageJson.version}`);
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
claudenv - 便捷切换 Claude API 配置的命令行工具

使用方法:
  claudenv                    # 交互式选择配置
  claudenv <配置名>           # 直接切换到指定配置
  claudenv --version, -v      # 显示版本信息
  claudenv --help, -h         # 显示帮助信息

示例:
  claudenv                    # 显示配置菜单
  claudenv kimi              # 切换到 kimi 配置
  claudenv bigmodel          # 切换到 bigmodel 配置

配置文件位置: ~/.claudenv/settings.json
  `);
}

/**
 * 主函数
 */
async function main() {
  // 处理命令行参数
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    const firstArg = args[0];
    
    // 处理帮助和版本参数
    if (firstArg === '--version' || firstArg === '-v') {
      showVersion();
      return;
    }
    
    if (firstArg === '--help' || firstArg === '-h') {
      showHelp();
      return;
    }
    
    // 其他参数视为配置名称
    checkConfigFile();
    applyProfile(firstArg);
    console.log();
    startClaude();
  } else {
    // 显示交互式菜单
    await showInteractiveMenu();
  }
}

// 处理 Ctrl+C 退出
process.on('SIGINT', () => {
  console.log('\n已取消');
  process.exit(0);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('发生错误:', error.message);
    process.exit(1);
  });
}

module.exports = {
  readConfig,
  getCurrentProfile,
  getProfileNames,
  getProfileConfig,
  applyProfile
};