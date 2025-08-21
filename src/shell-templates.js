/**
 * Shell function templates for different shells
 */

const SHELL_TEMPLATES = {
  bash: {
    comment: '# ccenv function for easy profile switching',
    function: `ccenv() {
    if command -v _ccenv_core >/dev/null 2>&1; then
        # For help, version, ls commands, or no arguments, don't eval, just run directly
        if [[ $# -eq 0 ]]; then
            command _ccenv_core
        else
            case "$1" in
                -h|--help|-v|--version|ls|edit)
                    command _ccenv_core "$@"
                    ;;
                *)
                    eval "$(command _ccenv_core "$@")"
                    ;;
            esac
        fi
    else
        echo "_ccenv_core command not found. Please reinstall ccenv." >&2
        return 1
    fi
}`
  },
  
  zsh: {
    comment: '# ccenv function for easy profile switching',
    function: `ccenv() {
    if command -v _ccenv_core >/dev/null 2>&1; then
        # For help, version, ls commands, or no arguments, don't eval, just run directly
        if [[ $# -eq 0 ]]; then
            command _ccenv_core
        else
            case "$1" in
                -h|--help|-v|--version|ls|edit)
                    command _ccenv_core "$@"
                    ;;
                *)
                    eval "$(command _ccenv_core "$@")"
                    ;;
            esac
        fi
    else
        echo "_ccenv_core command not found. Please reinstall ccenv." >&2
        return 1
    fi
}`
  },
  
  fish: {
    comment: '# ccenv function for easy profile switching',
    function: `function ccenv
    if command -sq _ccenv_core
        # For help, version, ls commands, or no arguments, don't eval, just run directly
        if test (count $argv) -eq 0
            command _ccenv_core
        else
            switch $argv[1]
                case '-h' '--help' '-v' '--version' 'ls' 'edit'
                    command _ccenv_core $argv
                case '*'
                    eval (command _ccenv_core $argv)
            end
        end
    else
        echo "_ccenv_core command not found. Please reinstall ccenv." >&2
        return 1
    end
end`
  }
};

/**
 * Get shell config file path for different shells
 */
const SHELL_CONFIG_FILES = {
  bash: [
    '.bashrc',
    '.bash_profile',
    '.profile'
  ],
  zsh: [
    '.zshrc',
    '.zprofile'
  ],
  fish: [
    '.config/fish/config.fish'
  ]
};

/**
 * Get the appropriate shell template
 */
function getShellTemplate(shellType) {
  return SHELL_TEMPLATES[shellType] || SHELL_TEMPLATES.bash;
}

/**
 * Get possible config file paths for a shell type
 */
function getShellConfigFiles(shellType) {
  return SHELL_CONFIG_FILES[shellType] || SHELL_CONFIG_FILES.bash;
}

/**
 * Detect user's current shell
 */
function detectShell() {
  const shell = process.env.SHELL || '';
  
  if (shell.includes('zsh')) return 'zsh';
  if (shell.includes('fish')) return 'fish';
  if (shell.includes('bash')) return 'bash';
  
  // Default to bash for unknown shells
  return 'bash';
}

module.exports = {
  SHELL_TEMPLATES,
  SHELL_CONFIG_FILES,
  getShellTemplate,
  getShellConfigFiles,
  detectShell
};