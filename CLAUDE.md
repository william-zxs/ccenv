# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccenv is a command-line tool for quickly switching between different Claude API configurations. It manages environment variables and provides an interactive menu for selecting API providers like Moonshot AI (Kimi), Zhipu AI (GLM), Alibaba Tongyi Qianwen, and DeepSeek AI. The tool now features color-coded token status indicators to show configuration readiness at a glance.

## Architecture

- **src/cli.js**: Main Node.js CLI script for interactive configuration switching
- **src/init.js**: Initialization script that creates config directory and default settings.json
- **package.json**: NPM package configuration with postinstall hook
- **~/.ccenv/settings.json**: Configuration file containing API profiles in nested format

## Configuration Structure

The project uses a nested JSON structure where environment variables are stored within an `env` object for each profile:

```json
{
  "defaultProfile": null,
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
      "name": "glm",
      "env": {
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_AUTH_TOKEN": ""
      }
    },
    {
      "name": "qwen",
      "env": {
        "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy",
        "ANTHROPIC_AUTH_TOKEN": ""
      }
    },
    {
      "name": "deepseek",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "",
        "ANTHROPIC_MODEL": "deepseek-chat",
        "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat"
      }
    }
  ]
}
```

## Key Functions in ccenv script

- `getCurrentProfile()`: Detects active configuration using `CCENV_PROFILE` environment variable
- `getProfileConfig()`: Retrieves specific profile configuration by name
- `applyProfile()`: Unsets old environment variables and sets new ones from `env` object
- `listProfiles()`: Displays all profiles with color-coded token status (green ✓ for configured, red ✗ for missing)
- `generateEnvCommands()`: Creates shell commands to set environment variables
- `colorGreen()` / `colorRed()`: ANSI color helper functions for status indicators

## Common Commands

### Installation
```bash
npm install -g ccenv
# or for local development
npm install -g .
```

### Testing configuration format
```bash
# Verify JSON syntax
cat ~/.ccenv/settings.json | jq .

# Test profile name extraction
jq -r '.profiles[].name' ~/.ccenv/settings.json

# Test specific profile retrieval
jq -r --arg name "kimi" '.profiles[] | select(.name == $name)' ~/.ccenv/settings.json
```

### Usage

#### 第一步：配置 API 密钥 (必需)
```bash
ccenv edit                   # Open configuration file in editor
# Fill in ANTHROPIC_AUTH_TOKEN for each provider
```

#### 推荐使用方式 (安装后自动可用)
```bash
ccenv                        # Interactive mode with color-coded token status
ccenv ls                     # List all configurations with status
ccenv kimi                   # Direct switch to Moonshot AI (Kimi)
ccenv glm                    # Direct switch to Zhipu AI (GLM)
ccenv qwen                   # Direct switch to Alibaba Qianwen
ccenv deepseek               # Direct switch to DeepSeek AI
ccenv use <profile>          # Alternative syntax for switching
```

#### 配置管理
```bash
ccenv default                # Show current default profile
ccenv default <profile>      # Set default profile
ccenv edit                   # Edit configuration file
```

#### 备用使用方式 (如果 shell 函数未正确安装)
```bash
eval "$(ccenv)"              # Interactive mode
eval "$(ccenv kimi)"         # Direct switch to named profile
source <(ccenv kimi)         # Alternative syntax
```

#### 帮助和调试
```bash
ccenv -h                     # Show help information
ccenv --help                 # Show help information
ccenv -v                     # Show version information
ccenv --version              # Show version information
```

## Color-Coded Token Status

The tool now provides visual feedback for API token configuration status:

- 🟢 **Green ✓**: API token is configured and ready to use
- 🔴 **Red ✗**: API token is missing or empty

This appears in:
- `ccenv` (interactive mode)
- `ccenv ls` (list configurations)
- Status legend displayed at the bottom of the configuration list

## Dependencies

- Node.js: >= 14.0.0
- npm: For global installation
- No external dependencies (uses native Node.js ANSI color codes)

## Environment Variables Managed

- ANTHROPIC_BASE_URL
- ANTHROPIC_AUTH_TOKEN
- ANTHROPIC_MODEL
- ANTHROPIC_SMALL_FAST_MODEL
- CCENV_PROFILE (tracks currently active configuration)

## Shell Function Installation

During installation, ccenv automatically detects your shell type and offers to install a shell function for convenient usage. This allows direct command usage like `ccenv kimi` instead of requiring `eval "$(ccenv kimi)"`.

### Supported Shells
- bash: Function installed in `.bashrc` or `.bash_profile`
- zsh: Function installed in `.zshrc` or `.zprofile`
- fish: Function installed in `.config/fish/config.fish`

### Manual Installation
If automatic installation fails, add this to your shell config file:

**For bash/zsh:**
```bash
ccenv() {
    if command -v ccenv >/dev/null 2>&1; then
        eval "$(command ccenv "$@")"
    else
        echo "ccenv command not found. Please reinstall ccenv." >&2
        return 1
    fi
}
```

**For fish:**
```fish
function ccenv
    if command -sq ccenv
        eval (command ccenv $argv)
    else
        echo "ccenv command not found. Please reinstall ccenv." >&2
        return 1
    end
end
```

## Default Profiles Included

The tool comes with pre-configured profiles for major Chinese AI providers:

1. **kimi** - 月之暗面 (Moonshot AI)
   - URL: `https://api.moonshot.cn/anthropic`
   - Models: `kimi-k2-turbo-preview`

2. **glm** - 智谱AI (Zhipu AI)
   - URL: `https://open.bigmodel.cn/api/anthropic`

3. **qwen** - 阿里通义千问 (Alibaba Qianwen)
   - URL: `https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy`

4. **deepseek** - 深度求索 (DeepSeek AI)
   - URL: `https://api.deepseek.com/anthropic`
   - Models: `deepseek-chat`

All profiles have empty `ANTHROPIC_AUTH_TOKEN` values that users must fill in after installation.

## Important Implementation Notes

- **Configuration Detection**: The tool uses `CCENV_PROFILE` environment variable to track the active configuration, not `ANTHROPIC_BASE_URL`
- **Token Status Checking**: The `listProfiles()` function checks if `ANTHROPIC_AUTH_TOKEN` exists and is not empty/whitespace
- **Environment Variables**: All variables are accessed via `.env.VARIABLE_NAME` in the JSON structure
- **Color Functions**: Uses native ANSI escape codes (`\x1b[32m` for green, `\x1b[31m` for red, `\x1b[0m` for reset)
- **Configuration Parsing**: The tool gracefully handles missing optional environment variables
- **Default Profile Support**: The `defaultProfile` field can be set to auto-apply a configuration in new shell sessions