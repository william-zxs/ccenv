# ccenv

A convenient command-line tool for quickly switching between different Claude API configurations.

[中文](README-zh.md)

## Features

- 🔄 Interactive configuration selection menu
- ⭐ Current active configuration marked with `*`
- 🎯 Cursor defaults to the currently active configuration
- 🔧 Automatic environment variable management (unset old config, set new config)
- 🚀 Auto-launch `claude` command after switching
- ⚙️ Support for direct configuration name specification for quick switching
- 📦 npm global installation support, cross-platform compatibility

## Installation

### Method 1: Install via npm (Recommended)

```bash
npm install -g @william-zxs/ccenv
```

### Method 2: Local Development Installation

1. Clone or download this project
2. Run in the project directory:
   ```bash
   npm install -g .
   ```

npm installation will automatically:

- Create configuration directory `~/.ccenv/`
- Generate default configuration file `~/.ccenv/settings.json`
- Install `ccenv` command to global PATH

## Usage

### Step 1: Configure API Keys (Required)

After installation, you need to configure your API keys first:

```bash
ccenv edit
```

This will open the configuration file in an editor. Fill in your API keys for each provider:

- **kimi**: Get your API key from [Moonshot AI](https://platform.moonshot.cn/)
- **glm**: Get your API key from [Zhipu AI](https://open.bigmodel.cn/)  
- **qwen**: Get your API key from [Alibaba Cloud](https://dashscope.aliyuncs.com/)
- **deepseek**: Get your API key from [DeepSeek](https://platform.deepseek.com/)

Replace the empty `ANTHROPIC_AUTH_TOKEN` values with your actual API keys.

### Step 2: Switch Configurations

#### Interactive Selection

```bash
ccenv
```

This will display the configuration menu with color-coded token status:
- 🟢 Green checkmark: API key configured
- 🔴 Red X: API key missing

#### Direct Switching

```bash
ccenv kimi       # Switch to Moonshot AI (Kimi)
ccenv glm        # Switch to Zhipu AI (GLM)
ccenv qwen       # Switch to Alibaba Qianwen
ccenv deepseek   # Switch to DeepSeek
```

#### List All Configurations

```bash
ccenv ls
```

Shows all available configurations with their status.

## Configuration File

The configuration file is located at `~/.ccenv/settings.json` with the following format:

```json
{
  "defaultProfile": null,
  "profiles": [
    {
      "name": "kimi",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "sk-your-moonshot-api-key",
        "ANTHROPIC_MODEL": "kimi-k2-turbo-preview",
        "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2-turbo-preview"
      }
    },
    {
      "name": "glm",
      "env": {
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "your-zhipu-api-key.xxx"
      }
    },
    {
      "name": "qwen",
      "env": {
        "ANTHROPIC_BASE_URL": "https://dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy",
        "ANTHROPIC_AUTH_TOKEN": "sk-your-alibaba-api-key"
      }
    },
    {
      "name": "deepseek",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "sk-your-deepseek-api-key",
        "ANTHROPIC_MODEL": "deepseek-chat",
        "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat"
      }
    }
  ]
}
```

### Supported Environment Variables

- `ANTHROPIC_BASE_URL` - API base URL
- `ANTHROPIC_AUTH_TOKEN` - Authentication token
- `ANTHROPIC_MODEL` - Default model
- `ANTHROPIC_SMALL_FAST_MODEL` - Small fast model

## Built-in Configurations

The following API configurations are included by default:

1. **kimi** - Moonshot AI (月之暗面)
2. **glm** - Zhipu AI (智谱AI)
3. **qwen** - Alibaba Tongyi Qianwen (阿里通义千问)
4. **deepseek** - DeepSeek AI (深度求索)

## How It Works

1. Read the `~/.ccenv/settings.json` configuration file
2. Detect the currently active configuration (via `CCENV_PROFILE` environment variable)
3. Display interactive menu with current configuration marked and token status color-coded
4. After user selects a new configuration:
   - Clear existing related environment variables
   - Set new configuration environment variables
   - Set `CCENV_PROFILE` to track active configuration

## Development and Local Testing

If you want to develop or test locally:

```bash
# Clone project
git clone <repository-url>
cd ccenv

# Install dependencies
npm install

# Local testing
node src/cli.js

# Or link to global
npm link
ccenv
```

## Important Notes

- Environment variables are scoped to the current shell session only
- Ensure `claude` command is properly installed
- Node.js version requirement: >= 14.0.0

## Custom Configuration

You can edit the `~/.ccenv/settings.json` file to add or modify configurations. Modified configurations take effect immediately without reinstallation.

## Publishing to npm

To publish a new version to npm:

```bash
# Update version number
npm version patch  # or minor, major

# Publish
npm publish
```
