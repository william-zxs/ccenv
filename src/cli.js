#!/usr/bin/env node

/**
 * claudenv - 便捷切换 Claude API 配置的命令行工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.claudenv');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

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
    console.error('错误: 无法读取配置文件:', error.message);
    process.exit(1);
  }
}

/**
 * 获取当前生效的配置
 */
function getCurrentProfile(config) {
  const currentBaseUrl = process.env.ANTHROPIC_BASE_URL;
  if (!currentBaseUrl) return null;
  
  return config.profiles.find(profile => 
    profile.env && profile.env.ANTHROPIC_BASE_URL === currentBaseUrl
  );
}

/**
 * 根据名称获取配置
 */
function getProfileConfig(config, profileName) {
  return config.profiles.find(profile => profile.name === profileName);
}

/**
 * 生成环境变量设置的 shell 命令
 */
function generateEnvCommands(profile) {
  const commands = [];
  
  // 清除现有环境变量
  const envVars = ['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_MODEL', 'ANTHROPIC_SMALL_FAST_MODEL'];
  envVars.forEach(varName => {
    commands.push(`unset ${varName}`);
  });
  
  // 设置新环境变量
  if (profile.env) {
    Object.entries(profile.env).forEach(([key, value]) => {
      if (value && value.trim()) {
        commands.push(`export ${key}="${value}"`);
      }
    });
  }
  
  return commands.join('\n');
}

/**
 * 应用配置（输出环境变量设置命令）
 */
function applyProfile(config, profileName) {
  const profile = getProfileConfig(config, profileName);
  
  if (!profile) {
    console.error(`错误: 找不到配置 '${profileName}'`);
    process.exit(1);
  }
  
  // 输出环境变量设置命令
  console.log(generateEnvCommands(profile));
  
  // 输出确认消息到 stderr，这样不会影响 eval
  console.error(`已切换到配置: ${profileName}`);
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('使用方法: claudenv [选项] [命令|配置名称]');
  console.log('');
  console.log('命令:');
  console.log('  ls                              列出所有可用配置');
  console.log('  <配置名称>                       切换到指定配置');
  console.log('');
  console.log('选项:');
  console.log('  -h, --help                      显示此帮助信息');
  console.log('  -v, --version                   显示版本信息');
}

/**
 * 列出所有配置
 */
function listProfiles() {
  const config = readConfig();
  const currentProfile = getCurrentProfile(config);
  
  console.error('可用的配置:');
  config.profiles.forEach(profile => {
    const current = currentProfile && currentProfile.name === profile.name ? '*' : ' ';
    const baseUrl = profile.env?.ANTHROPIC_BASE_URL || 'N/A';
    console.error(`${current} ${profile.name} - ${baseUrl}`);
  });
  console.error('');
  console.error('使用方法: claudenv <配置名称>');
}

/**
 * 显示版本信息
 */
function showVersion() {
  const packageJson = require('../package.json');
  console.log(`claudenv v${packageJson.version}`);
}

/**
 * 主函数
 */
function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case '-h':
    case '--help':
      showHelp();
      return;
    case '-v':
    case '--version':
      showVersion();
      return;
    case 'ls':
      // 检查配置文件
      checkConfigFile();
      listProfiles();
      return;
    default:
      if (command.startsWith('-')) {
        console.error(`错误: 未知选项 '${command}'`);
        console.error('');
        showHelp();
        process.exit(1);
      } else {
        // 检查配置文件
        checkConfigFile();
        // 直接应用指定配置
        const config = readConfig();
        applyProfile(config, command);
      }
      break;
  }
}

// 运行主函数
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('程序执行出错:', error.message);
    process.exit(1);
  }
}

module.exports = { main, applyProfile, generateEnvCommands };