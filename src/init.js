#!/usr/bin/env node

/**
 * ccenv 初始化脚本
 * 在 npm install 后自动运行，创建配置目录和默认配置文件
 */

const fs = require('fs');
const path = require('path');

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