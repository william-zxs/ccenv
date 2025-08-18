# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

claudenv is a command-line tool for quickly switching between different Claude API configurations. It manages environment variables and provides an interactive menu for selecting API providers like Moonshot AI (Kimi), Zhipu AI (BigModel), AICoding, and Alibaba Tongyi Qianwen.

## Architecture

- **install.sh**: Installation script that creates config directory, generates default settings.json, and installs the executable
- **claudenv**: Main bash script that provides interactive configuration switching
- **~/.claudenv/settings.json**: Configuration file containing API profiles in nested format

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

## Key Functions in claudenv script

- `get_current_profile()`: Detects active configuration by matching `ANTHROPIC_BASE_URL`
- `get_profile_names()`: Extracts all profile names using jq
- `get_profile_config()`: Retrieves specific profile configuration
- `apply_profile()`: Unsets old environment variables and sets new ones from `env` object
- `display_menu()`: Interactive menu with arrow key navigation

## Common Commands

### Installation
```bash
./install.sh
```

### Testing configuration format
```bash
# Verify JSON syntax
cat ~/.claudenv/settings.json | jq .

# Test profile name extraction
jq -r '.profiles[].name' ~/.claudenv/settings.json

# Test specific profile retrieval
jq -r --arg name "kimi" '.profiles[] | select(.name == $name)' ~/.claudenv/settings.json
```

### Usage
```bash
claudenv                # Interactive mode
claudenv "kimi"     # Direct switch to named profile
```

## Dependencies

- jq: Required for JSON parsing in bash script
- claude: The tool will automatically exec claude command after configuration switch

## Environment Variables Managed

- ANTHROPIC_BASE_URL
- ANTHROPIC_AUTH_TOKEN
- ANTHROPIC_MODEL
- ANTHROPIC_SMALL_FAST_MODEL

## Important Implementation Notes

When modifying configuration parsing logic, remember that environment variables are accessed via `.env.VARIABLE_NAME` in jq queries (e.g., `.env.ANTHROPIC_BASE_URL`), not directly at the profile root level.

The tool maintains backward compatibility by gracefully handling missing optional environment variables using jq's `// empty` operator.