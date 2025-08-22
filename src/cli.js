#!/usr/bin/env node

/**
 * ccenv - 便捷切换 Claude API 配置的命令行工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.ccenv');
const CONFIG_FILE = path.join(CONFIG_DIR, 'settings.json');

/**
 * ANSI 颜色辅助函数
 */
function colorGreen(text) {
  return `\x1b[32m${text}\x1b[0m`;
}

function colorRed(text) {
  return `\x1b[31m${text}\x1b[0m`;
}

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
  const currentProfileName = process.env.CCENV_PROFILE;
  if (!currentProfileName) return null;
  
  return config.profiles.find(profile => profile.name === currentProfileName);
}

/**
 * 根据名称获取配置
 */
function getProfileConfig(config, profileName) {
  return config.profiles.find(profile => profile.name === profileName);
}

/**
 * 获取默认配置名称
 */
function getDefaultProfile(config) {
  return config.defaultProfile;
}

/**
 * 设置默认配置
 */
function setDefaultProfile(profileName) {
  const config = readConfig();
  
  // 验证配置名称是否存在
  if (!getProfileConfig(config, profileName)) {
    console.error(`错误: 找不到配置 '${profileName}'`);
    process.exit(1);
  }
  
  // 更新默认配置
  config.defaultProfile = profileName;
  
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.error(`已设置默认配置为: ${profileName}`);
  } catch (error) {
    console.error('错误: 无法保存配置文件:', error.message);
    process.exit(1);
  }
}

/**
 * 显示默认配置信息
 */
function showDefaultProfile() {
  const config = readConfig();
  const defaultProfile = getDefaultProfile(config);
  
  if (defaultProfile) {
    console.error(`当前默认配置: ${defaultProfile}`);
  } else {
    console.error('当前没有设置默认配置');
  }
}

/**
 * 写入配置文件的安全函数
 */
function writeConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('错误: 无法保存配置文件:', error.message);
    return false;
  }
}

/**
 * 生成环境变量设置的 shell 命令
 */
function generateEnvCommands(profile) {
  const commands = [];
  
  // 清除现有环境变量
  const envVars = ['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_MODEL', 'ANTHROPIC_SMALL_FAST_MODEL', 'CCENV_PROFILE'];
  envVars.forEach(varName => {
    commands.push(`unset ${varName}`);
  });
  
  // 设置 CCENV_PROFILE 环境变量
  commands.push(`export CCENV_PROFILE="${profile.name}"`);
  
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
 * 自动应用默认配置（如果没有设置环境变量且有默认配置）
 */
function autoApplyDefaultProfile() {
  const config = readConfig();
  const defaultProfile = getDefaultProfile(config);
  
  // 如果没有默认配置，输出空的命令
  if (!defaultProfile) {
    return;
  }
  
  // 如果当前没有设置 CCENV_PROFILE，则应用默认配置
  if (!process.env.CCENV_PROFILE) {
    const profile = getProfileConfig(config, defaultProfile);
    if (profile) {
      console.log(generateEnvCommands(profile));
      console.error(`自动应用默认配置: ${defaultProfile}`);
    }
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('使用方法: ccenv [选项] [命令|配置名称]');
  console.log('');
  console.log('命令:');
  console.log('  ls                              列出所有可用配置');
  console.log('  use, u <配置名称>                切换到指定配置');
  console.log('  default                         显示当前默认配置');
  console.log('  default <配置名称>               设置默认配置');
  console.log('  edit, e                         编辑配置文件');
  console.log('');
  console.log('选项:');
  console.log('  -h, --help                      显示此帮助信息');
  console.log('  -v, --version                   显示版本信息');
  console.log('');
  console.log('说明:');
  console.log('  设置默认配置后，打开新终端时会自动应用该配置的环境变量');
}

/**
 * 列出所有配置
 */
function listProfiles() {
  const config = readConfig();
  const currentProfile = getCurrentProfile(config);
  const defaultProfile = getDefaultProfile(config);
  
  console.error('可用的配置:');
  config.profiles.forEach(profile => {
    const current = currentProfile && currentProfile.name === profile.name ? '*' : ' ';
    const isDefault = defaultProfile === profile.name ? ' (默认)' : '';
    const baseUrl = profile.env?.ANTHROPIC_BASE_URL || 'N/A';
    const hasToken = profile.env?.ANTHROPIC_AUTH_TOKEN && profile.env.ANTHROPIC_AUTH_TOKEN.trim();
    const tokenStatus = hasToken ? colorGreen('[TOKEN: ✓]') : colorRed('[TOKEN: ✗]');
    console.error(`${current} ${profile.name}${isDefault} - ${baseUrl} ${tokenStatus}`);
  });
  console.error('');
  console.error(`标记说明: * = 当前生效, (默认) = 默认配置, ${colorGreen('[TOKEN: ✓]')} = 已配置TOKEN, ${colorRed('[TOKEN: ✗]')} = 未配置TOKEN`);
  console.error('使用方法: ccenv use <配置名称>');
}

/**
 * 显示版本信息
 */
function showVersion() {
  const packageJson = require('../package.json');
  console.log(`ccenv v${packageJson.version}`);
}

/**
 * 编辑配置文件
 */
function editConfig() {
  checkConfigFile();
  
  // 检查是否在 TTY 环境中
  if (!process.stdout.isTTY || !process.stdin.isTTY) {
    console.error('错误: ccenv edit 需要在交互式终端环境中运行');
    console.error('提示: 请直接在终端中运行 ccenv edit，不要通过管道或重定向');
    process.exit(1);
  }
  
  // 编辑器优先级：vim -> vi
  const editors = ['vim', 'vi'];
  
  function tryEditor(index) {
    if (index >= editors.length) {
      console.error('错误: 无法找到可用的编辑器 (vim 或 vi)');
      console.error(`提示: 您可以直接编辑配置文件: ${CONFIG_FILE}`);
      process.exit(1);
    }
    
    const editor = editors[index];
    console.error(`正在使用 ${editor} 打开配置文件...`);
    
    const editorProcess = spawn(editor, [CONFIG_FILE], {
      stdio: 'inherit',
      env: {
        ...process.env,
        TERM: process.env.TERM || 'xterm-256color'
      },
      cwd: process.cwd()
    });
    
    editorProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        // 编辑器不存在，尝试下一个
        console.error(`${editor} 不可用，尝试下一个编辑器...`);
        tryEditor(index + 1);
      } else {
        console.error(`错误: 启动编辑器失败: ${error.message}`);
        process.exit(1);
      }
    });
    
    editorProcess.on('exit', (code) => {
      if (code === 0) {
        console.error('配置文件编辑完成');
      } else if (code !== null) {
        console.error(`编辑器退出，退出代码: ${code}`);
      }
      // 正常结束程序，不要让 Node.js 继续运行
      process.exit(code || 0);
    });
  }
  
  tryEditor(0);
}

/**
 * 主函数
 */
function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 检查配置文件
    checkConfigFile();
    listProfiles();
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
    case 'edit':
      editConfig();
      return;
    case 'e':
      editConfig();
      return;
    case 'use':
    case 'u':
      if (args.length < 2) {
        console.error(`错误: ${command} 命令需要指定配置名称`);
        console.error(`使用方法: ccenv ${command} <配置名称>`);
        process.exit(1);
      }
      // 检查配置文件
      checkConfigFile();
      // 应用指定配置
      const config = readConfig();
      applyProfile(config, args[1]);
      return;
    case 'default':
      // 检查配置文件
      checkConfigFile();
      if (args.length < 2) {
        // 显示当前默认配置
        showDefaultProfile();
      } else {
        // 设置默认配置
        setDefaultProfile(args[1]);
      }
      return;
    case '--auto-apply-default':
      // 内部命令：自动应用默认配置
      checkConfigFile();
      autoApplyDefaultProfile();
      return;
    default:
      console.error(`错误: 未知命令 '${command}'`);
      console.error('');
      showHelp();
      process.exit(1);
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