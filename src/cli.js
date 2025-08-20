#!/usr/bin/env node

/**
 * claudenv - 便捷切换 Claude API 配置的命令行工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const inquirer = require('inquirer');

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
function applyProfile(config, profileName, launchClaude = false, rawOutput = false) {
  const profile = getProfileConfig(config, profileName);
  
  if (!profile) {
    console.error(`错误: 找不到配置 '${profileName}'`);
    process.exit(1);
  }
  
  // 输出环境变量设置命令
  console.log(generateEnvCommands(profile));
  
  // 输出确认消息到 stderr，这样不会影响 eval（除非是原始输出模式）
  if (rawOutput) {
    console.log(`# 已切换到配置: ${profileName}`);
  } else {
    console.error(`已切换到配置: ${profileName}`);
  }
  
  // 如果指定了启动 Claude，则添加启动命令
  if (launchClaude) {
    console.log('');
    console.log('if command -v claude &> /dev/null; then');
    console.log('  echo "正在启动 claude..." >&2');
    console.log('  claude');
    console.log('else');
    console.log('  echo "警告: 找不到 claude 命令" >&2');
    console.log('  echo "请确保 claude 已正确安装并在 PATH 中" >&2');
    console.log('fi');
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('使用方法: claudenv [选项] [配置名称]');
  console.log('');
  console.log('推荐使用方式 (如果已安装 shell 函数):');
  console.log('  claudenv                        交互式选择配置');
  console.log('  claudenv kimi                   切换到 kimi 配置');
  console.log('  claudenv -c kimi                切换到 kimi 配置并启动 Claude');
  console.log('');
  console.log('备用使用方式 (如果上述方式不工作):');
  console.log('  eval "$(claudenv)"              交互式选择配置');
  console.log('  eval "$(claudenv kimi)"         切换到 kimi 配置');
  console.log('  source <(claudenv kimi)         切换到 kimi 配置');
  console.log('');
  console.log('选项:');
  console.log('  -c, --claude    切换配置后启动 Claude');
  console.log('  -r, --raw       输出原始命令（用于调试）');
  console.log('  -h, --help      显示此帮助信息');
  console.log('');
  console.log('注意: 如需安装 shell 函数以便直接使用 claudenv 命令，请重新运行:');
  console.log('  npm install -g claudenv');
}

/**
 * 交互式菜单
 */
async function interactiveMenu() {
  const config = readConfig();
  const currentProfile = getCurrentProfile(config);
  
  const choices = config.profiles.map(profile => {
    const current = currentProfile && currentProfile.name === profile.name ? ' *' : '';
    return {
      name: `${profile.name}${current}`,
      value: profile.name,
      short: profile.name
    };
  });
  
  console.error('选择 Claude API 配置:');
  console.error("提示: * 表示当前生效的配置");
  console.error('');
  
  const questions = [
    {
      type: 'list',
      name: 'profile',
      message: '请选择配置:',
      choices: choices,
      default: currentProfile ? currentProfile.name : choices[0]?.value
    },
    {
      type: 'confirm',
      name: 'launchClaude',
      message: '是否启动 Claude?',
      default: false
    }
  ];
  
  try {
    const answers = await inquirer.prompt(questions);
    applyProfile(config, answers.profile, answers.launchClaude, false);
  } catch (error) {
    if (error.isTtyError) {
      console.error('错误: 无法在当前环境中运行交互式模式');
      console.error('请直接指定配置名称，例如: claudenv kimi');
    } else {
      console.error('错误:', error.message);
    }
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  let launchClaude = false;
  let rawOutput = false;
  let profileName = '';
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-c':
      case '--claude':
        launchClaude = true;
        break;
      case '-r':
      case '--raw':
        rawOutput = true;
        break;
      case '-h':
      case '--help':
        showHelp();
        return;
      default:
        if (arg.startsWith('-')) {
          console.error(`错误: 未知选项 '${arg}'`);
          console.error('');
          showHelp();
          process.exit(1);
        } else {
          if (profileName) {
            console.error('错误: 只能指定一个配置名称');
            console.error('');
            showHelp();
            process.exit(1);
          }
          profileName = arg;
        }
        break;
    }
  }
  
  // 检查配置文件
  checkConfigFile();
  
  if (profileName) {
    // 直接应用指定配置
    const config = readConfig();
    applyProfile(config, profileName, launchClaude, rawOutput);
  } else {
    // 交互式菜单
    await interactiveMenu();
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('程序执行出错:', error.message);
    process.exit(1);
  });
}

module.exports = { main, applyProfile, generateEnvCommands };