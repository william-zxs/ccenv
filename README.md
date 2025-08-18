# claudenv

一个便捷的命令行工具，用于在不同的 Claude API 配置之间快速切换。

## 功能特性

- 🔄 交互式配置选择菜单
- ⭐ 当前生效配置用 `*` 标记
- 🎯 光标默认定位在当前生效的配置上
- 🔧 自动管理环境变量（unset 旧配置，设置新配置）
- 🚀 切换后自动启动 `claude` 命令
- ⚙️ 支持直接指定配置名称快速切换

## 安装

1. 克隆或下载本项目
2. 运行安装脚本：
   ```bash
   ./install.sh
   ```

安装脚本会：

- 创建配置目录 `~/.claudenv/`
- 生成默认配置文件 `~/.claudenv/settings.json`
- 复制可执行文件到 `/usr/local/bin/claudenv`
- 设置必要的权限

## 依赖

- `jq` - 用于解析 JSON 配置文件
  ```bash
  brew install jq
  ```

## 使用方法

### 交互式选择

```bash
claudenv
```

将显示配置菜单，使用数字选择对应的配置。

### 直接切换

```bash
claudenv kimi
```

直接切换到指定名称的配置。

## 配置文件

配置文件位于 `~/.claudenv/settings.json`，格式如下：

```json
{
  "profiles": [
    {
      "name": "kimi",
      "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
      "ANTHROPIC_MODEL": "kimi-k2-turbo-preview",
      "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2-turbo-preview"
    },
    {
      "name": "bigmodel",
      "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "xxx.xxx"
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

1. **kimi** - Moonshot AI
2. **bigmodel** - 智谱 AI
3. **qianwen** - 阿里云通义千问

## 工作原理

1. 读取 `~/.claudenv/settings.json` 配置文件
2. 检测当前生效的配置（通过 `ANTHROPIC_BASE_URL` 环境变量）
3. 显示交互式菜单，标记当前配置
4. 用户选择新配置后：
   - 清除现有的相关环境变量
   - 设置新配置的环境变量
   - 自动执行 `claude` 命令

## 注意事项

- 环境变量的作用域仅限于当前 shell 会话
- 需要确保 `/usr/local/bin` 在 PATH 中
- 需要安装 `jq` 工具来解析 JSON 配置
- 需要确保 `claude` 命令已正确安装

## 自定义配置

可以编辑 `~/.claudenv/settings.json` 文件来添加或修改配置。修改后的配置会立即生效，无需重新安装。
