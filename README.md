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

### Interactive Selection

```bash
ccenv
```

This will display the configuration menu, use numbers to select the corresponding configuration.

### Direct Switching

```bash
ccenv kimi
```

Directly switch to the configuration with the specified name.

## Configuration File

The configuration file is located at `~/.ccenv/settings.json` with the following format:

```json
{
  "profiles": [
    {
      "name": "kimi",
      "env": {
        "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
        "ANTHROPIC_MODEL": "kimi-k2-turbo-preview",
        "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2-turbo-preview"
      }
    },
    {
      "name": "bigmodel",
      "env": {
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_AUTH_TOKEN": "xxx.xxx"
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

1. **kimi** - Moonshot AI
2. **bigmodel** - Zhipu AI
3. **qianwen** - Alibaba Tongyi Qianwen

## How It Works

1. Read the `~/.ccenv/settings.json` configuration file
2. Detect the currently active configuration (via `ANTHROPIC_BASE_URL` environment variable)
3. Display interactive menu with current configuration marked
4. After user selects a new configuration:
   - Clear existing related environment variables
   - Set new configuration environment variables
   - Automatically execute `claude` command

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
