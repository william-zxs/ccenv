#!/bin/bash

# claudenv 安装脚本

set -e

INSTALL_DIR="/usr/local/bin"
CONFIG_DIR="$HOME/.claudenv"
CONFIG_FILE="$CONFIG_DIR/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "正在安装 claudenv..."

# 创建安装目录（如果不存在）
if [[ ! -d "$INSTALL_DIR" ]]; then
    echo "创建安装目录: $INSTALL_DIR"
    mkdir -p "$INSTALL_DIR"
fi

# 创建配置目录
if [[ ! -d "$CONFIG_DIR" ]]; then
    echo "创建配置目录: $CONFIG_DIR"
    mkdir -p "$CONFIG_DIR"
fi

# 生成默认配置文件
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo "创建默认配置文件: $CONFIG_FILE"
    cat > "$CONFIG_FILE" << 'EOF'
{
  "profiles": [
    {
      "name": "kimi",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "",
        "ANTHROPIC_MODEL": "kimi-k2-turbo-preview",
        "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2-turbo-preview"
      }
    },
    {
      "name": "bigmodel",
      "env": {
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_AUTH_TOKEN": ""
      }
    },
    {
      "name": "qianwen",
      "env": {
        "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy",
        "ANTHROPIC_AUTH_TOKEN": ""
      }
    }
  ]
}
EOF
    echo "已创建默认配置文件"
else
    echo "配置文件已存在，跳过创建"
fi

# 复制脚本到安装目录
echo "复制脚本到: $INSTALL_DIR/claudenv"
cp "$SCRIPT_DIR/claudenv" "$INSTALL_DIR/claudenv"

# 设置可执行权限
chmod +x "$INSTALL_DIR/claudenv"

# 检查 PATH
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo
    echo "⚠️  注意: $INSTALL_DIR 不在您的 PATH 中"
    echo "请将以下行添加到您的 shell 配置文件中 (~/.bashrc, ~/.zshrc, etc.):"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\""
    echo
    echo "或者运行以下命令立即生效:"
    echo "export PATH=\"$INSTALL_DIR:\$PATH\""
fi

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo
    echo "⚠️  注意: 需要安装 jq 来解析 JSON 配置文件"
    echo "请运行: brew install jq"
fi

echo
echo "✅ claudenv 安装完成!"
echo
echo "使用方法:"
echo "  claudenv           # 交互式选择配置"
echo "  claudenv kimi  # 直接切换到指定配置"
echo
echo "配置文件位置: $CONFIG_FILE"
echo "可执行文件位置: $INSTALL_DIR/claudenv"