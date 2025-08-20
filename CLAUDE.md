# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccenv is a command-line tool for quickly switching between different Claude API configurations. It manages environment variables and provides an interactive menu for selecting API providers like Moonshot AI (Kimi), Zhipu AI (BigModel), AICoding, and Alibaba Tongyi Qianwen.

## Architecture

- **src/cli.js**: Main Node.js CLI script for interactive configuration switching
- **src/init.js**: Initialization script that creates config directory and default settings.json
- **package.json**: NPM package configuration with postinstall hook
- **~/.ccenv/settings.json**: Configuration file containing API profiles in nested format

## Configuration Structure

The project uses a nested JSON structure where environment variables are stored within an `env` object for each profile:

```json
{
  "profiles": [
    {
      "name": "profile_name",
      "env": {
        "ANTHROPIC_BASE_URL": "...",
        "ANTHROPIC_AUTH_TOKEN": "...",
        "ANTHROPIC_MODEL": "...",
        "ANTHROPIC_SMALL_FAST_MODEL": "..."
      }
    }
  ]
}
```

## Key Functions in ccenv script

- `get_current_profile()`: Detects active configuration by matching `ANTHROPIC_BASE_URL`
- `get_profile_names()`: Extracts all profile names using jq
- `get_profile_config()`: Retrieves specific profile configuration
- `apply_profile()`: Unsets old environment variables and sets new ones from `env` object
- `display_menu()`: Interactive menu with arrow key navigation

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

#### 推荐使用方式 (安装后自动可用)
```bash
ccenv                        # Interactive mode
ccenv kimi                   # Direct switch to named profile
ccenv -c kimi                # Switch to profile and launch Claude
```

#### 备用使用方式 (如果 shell 函数未正确安装)
```bash
eval "$(ccenv)"              # Interactive mode
eval "$(ccenv kimi)"         # Direct switch to named profile
source <(ccenv kimi)         # Alternative syntax
```

#### 调试和开发
```bash
ccenv --raw kimi             # Outputs shell commands (for debugging)
ccenv --help                 # Show help information
```

## Dependencies

- Node.js: >= 14.0.0
- npm: For global installation
- claude: The tool will automatically exec claude command after configuration switch

## Environment Variables Managed

- ANTHROPIC_BASE_URL
- ANTHROPIC_AUTH_TOKEN
- ANTHROPIC_MODEL
- ANTHROPIC_SMALL_FAST_MODEL

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

## Important Implementation Notes

When modifying configuration parsing logic, remember that environment variables are accessed via `.env.VARIABLE_NAME` in jq queries (e.g., `.env.ANTHROPIC_BASE_URL`), not directly at the profile root level.

The tool maintains backward compatibility by gracefully handling missing optional environment variables using jq's `// empty` operator.