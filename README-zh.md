# ccenv

一个便捷的命令行工具，用于在不同的 Claude API 配置之间快速切换。

[English](README.md)

## 功能特性

- 🔄 交互式配置选择菜单
- ⭐ 当前生效配置用 `*` 标记
- 🎯 光标默认定位在当前生效的配置上
- 🔧 自动管理环境变量（unset 旧配置，设置新配置）
- 🚀 切换后自动启动 `claude` 命令
- ⚙️ 支持直接指定配置名称快速切换
- 📦 支持 npm 全局安装，跨平台兼容

## 安装

### 方式一：通过 npm 安装（推荐）

```bash
npm install -g @william-zxs/ccenv
```

### 方式二：本地开发安装

1. 克隆或下载本项目
2. 在项目目录中运行：
   ```bash
   npm install -g .
   ```

npm 安装会自动：

- 创建配置目录 `~/.ccenv/`
- 生成默认配置文件 `~/.ccenv/settings.json`
- 安装 `ccenv` 命令到全局 PATH

## 使用方法

### 第一步：配置 API 密钥（必需）

安装后，首先需要配置你的 API 密钥：

```bash
ccenv edit
```

这会在编辑器中打开配置文件。为每个服务商填入你的 API 密钥：

- **kimi**: 从 [月之暗面](https://platform.moonshot.cn/) 获取 API 密钥
- **glm**: 从 [智谱AI](https://open.bigmodel.cn/) 获取 API 密钥  
- **qwen**: 从 [阿里云](https://dashscope.aliyuncs.com/) 获取 API 密钥
- **deepseek**: 从 [深度求索](https://platform.deepseek.com/) 获取 API 密钥

将空的 `ANTHROPIC_AUTH_TOKEN` 值替换为你的实际 API 密钥。

### 第二步：切换配置

#### 交互式选择

```bash
ccenv
```

将显示配置菜单，带有彩色编码的令牌状态：
- 🟢 绿色对号：API 密钥已配置
- 🔴 红色叉号：API 密钥缺失

#### 直接切换

```bash
ccenv kimi       # 切换到月之暗面 (Kimi)
ccenv glm        # 切换到智谱AI (GLM)
ccenv qwen       # 切换到阿里通义千问
ccenv deepseek   # 切换到深度求索
```

#### 列出所有配置

```bash
ccenv ls
```

显示所有可用配置及其状态。

## 配置文件

配置文件位于 `~/.ccenv/settings.json`，格式如下：

```json
{
  "defaultProfile": null,
  "profiles": [
    {
      "name": "kimi",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "sk-你的月之暗面API密钥",
        "ANTHROPIC_MODEL": "kimi-k2-turbo-preview",
        "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2-turbo-preview"
      }
    },
    {
      "name": "glm",
      "env": {
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "你的智谱API密钥.xxx"
      }
    },
    {
      "name": "qwen",
      "env": {
        "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy",
        "ANTHROPIC_AUTH_TOKEN": "sk-你的阿里云API密钥"
      }
    },
    {
      "name": "deepseek",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "sk-你的深度求索API密钥",
        "ANTHROPIC_MODEL": "deepseek-chat",
        "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat"
      }
    }
  ]
}
```

### 支持的环境变量

- `ANTHROPIC_BASE_URL` - API 基础 URL
- `ANTHROPIC_AUTH_TOKEN` - 认证令牌
- `ANTHROPIC_MODEL` - 默认模型
- `ANTHROPIC_SMALL_FAST_MODEL` - 小型快速模型

## 内置配置

默认包含以下 API 配置：

1. **kimi** - 月之暗面 (Moonshot AI)
2. **glm** - 智谱AI (Zhipu AI)
3. **qwen** - 阿里通义千问 (Alibaba Qianwen)
4. **deepseek** - 深度求索 (DeepSeek AI)

## 工作原理

1. 读取 `~/.ccenv/settings.json` 配置文件
2. 检测当前生效的配置（通过 `CCENV_PROFILE` 环境变量）
3. 显示交互式菜单，标记当前配置并彩色显示令牌状态
4. 用户选择新配置后：
   - 清除现有的相关环境变量
   - 设置新配置的环境变量
   - 设置 `CCENV_PROFILE` 来跟踪活动配置

## 开发和本地测试

如果你想在本地开发或测试：

```bash
# 克隆项目
git clone <repository-url>
cd ccenv

# 安装依赖
npm install

# 本地测试
node src/cli.js

# 或者链接到全局
npm link
ccenv
```

## 注意事项

- 环境变量的作用域仅限于当前 shell 会话
- 需要确保 `claude` 命令已正确安装
- Node.js 版本要求：>= 14.0.0

## 自定义配置

可以编辑 `~/.ccenv/settings.json` 文件来添加或修改配置。修改后的配置会立即生效，无需重新安装。

## 发布到 npm

要发布新版本到 npm：

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布
npm publish
```