// Theme management system for chrome-clip extension
// Handles dynamic theme switching and CSS custom property updates

class ThemeManager {
  constructor() {
    this.currentTheme = 'gruvbox-dark';
    this.themes = {
      'gruvbox-dark': {
        name: 'Gruvbox Dark',
        colors: {
          bg: '#282828',
          fg: '#ebdbb2',
          accent: '#fabd2f',
          border: '#504945',
          shadow: 'rgba(40, 40, 40, 0.8)',
          bgAlt: '#3c3836',
          fgDim: '#a89984',
          success: '#b8bb26',
          warning: '#fe8019',
          error: '#fb4934',
          info: '#83a598'
        }
      },
      'catppuccin-latte': {
        name: 'Catppuccin Latte',
        colors: {
          bg: '#eff1f5',
          fg: '#4c4f69',
          accent: '#1e66f5',
          border: '#acb0be',
          shadow: 'rgba(76, 79, 105, 0.2)',
          bgAlt: '#e6e9ef',
          fgDim: '#6c6f85',
          success: '#40a02b',
          warning: '#df8e1d',
          error: '#d20f39',
          info: '#04a5e5'
        }
      },
      'dracula': {
        name: 'Dracula',
        colors: {
          bg: '#282a36',
          fg: '#f8f8f2',
          accent: '#bd93f9',
          border: '#44475a',
          shadow: 'rgba(40, 42, 54, 0.8)',
          bgAlt: '#44475a',
          fgDim: '#6272a4',
          success: '#50fa7b',
          warning: '#ffb86c',
          error: '#ff5555',
          info: '#8be9fd'
        }
      },
      'nord': {
        name: 'Nord',
        colors: {
          bg: '#2e3440',
          fg: '#d8dee9',
          accent: '#88c0d0',
          border: '#4c566a',
          shadow: 'rgba(46, 52, 64, 0.8)',
          bgAlt: '#3b4252',
          fgDim: '#616e88',
          success: '#a3be8c',
          warning: '#ebcb8b',
          error: '#bf616a',
          info: '#5e81ac'
        }
      }
    };

    this.loadTheme();
  }

  // Load theme from storage or use default
  async loadTheme() {
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'get-settings' }, resolve);
      });

      if (result && result.theme && this.themes[result.theme]) {
        this.currentTheme = result.theme;
      }
    } catch (error) {
      console.log('Could not load theme from storage, using default');
    }

    this.applyTheme();
  }

  // Apply the current theme to the document
  applyTheme(themeName = null) {
    const theme = themeName || this.currentTheme;

    if (!this.themes[theme]) {
      console.error(`Theme '${theme}' not found`);
      return;
    }

    const themeData = this.themes[theme];
    const root = document.documentElement;

    // Apply CSS custom properties
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--chrome-clip-${key}`, value);
    });

    // Add theme class to body for theme-specific styles
    document.body.classList.remove(...Object.keys(this.themes).map(t => `chrome-clip-theme-${t}`));
    document.body.classList.add(`chrome-clip-theme-${theme}`);

    this.currentTheme = theme;

    // Save theme preference
    this.saveThemePreference(theme);
  }

  // Save theme preference to storage
  async saveThemePreference(theme) {
    try {
      const settings = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'get-settings' }, resolve);
      });

      const updatedSettings = { ...settings, theme };

      chrome.runtime.sendMessage({
        action: 'save-settings',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  // Get current theme data
  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  // Get all available themes
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name
    }));
  }

  // Switch to a specific theme
  switchTheme(themeName) {
    if (this.themes[themeName]) {
      this.applyTheme(themeName);
      return true;
    }
    return false;
  }

  // Get theme colors for programmatic use
  getThemeColors(themeName = null) {
    const theme = themeName || this.currentTheme;
    return this.themes[theme]?.colors || {};
  }

  // Create dynamic CSS for overlay components
  generateOverlayStyling() {
    const colors = this.getThemeColors();

    return `
      .chrome-clip-overlay {
        background: ${colors.bg} !important;
        color: ${colors.fg} !important;
        border: 1px solid ${colors.border} !important;
        box-shadow: 0 8px 32px ${colors.shadow} !important;
      }

      .chrome-clip-overlay .header {
        background: ${colors.bgAlt} !important;
        border-bottom: 1px solid ${colors.border} !important;
      }

      .chrome-clip-overlay .content {
        background: ${colors.bg} !important;
        color: ${colors.fg} !important;
      }

      .chrome-clip-overlay .accent {
        color: ${colors.accent} !important;
      }

      .chrome-clip-overlay .dim {
        color: ${colors.fgDim} !important;
      }

      .chrome-clip-overlay .success {
        color: ${colors.success} !important;
      }

      .chrome-clip-overlay .warning {
        color: ${colors.warning} !important;
      }

      .chrome-clip-overlay .error {
        color: ${colors.error} !important;
      }

      .chrome-clip-overlay .info {
        color: ${colors.info} !important;
      }

      .chrome-clip-overlay button {
        background: ${colors.bgAlt} !important;
        color: ${colors.fg} !important;
        border: 1px solid ${colors.border} !important;
      }

      .chrome-clip-overlay button:hover {
        background: ${colors.accent} !important;
        color: ${colors.bg} !important;
      }

      .chrome-clip-overlay input, .chrome-clip-overlay select {
        background: ${colors.bgAlt} !important;
        color: ${colors.fg} !important;
        border: 1px solid ${colors.border} !important;
      }

      .chrome-clip-overlay input:focus, .chrome-clip-overlay select:focus {
        border-color: ${colors.accent} !important;
        outline: none !important;
        box-shadow: 0 0 0 2px ${colors.accent}33 !important;
      }

      .chrome-clip-overlay .resize-handle {
        background: ${colors.border} !important;
      }

      .chrome-clip-overlay .resize-handle:hover {
        background: ${colors.accent} !important;
      }
    `;
  }

  // Inject theme-specific styles into the page
  injectThemeStyles() {
    // Remove existing theme styles
    const existingStyle = document.getElementById('chrome-clip-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'chrome-clip-theme-styles';
    styleElement.textContent = this.generateOverlayStyling();

    // Inject into document head
    document.head.appendChild(styleElement);
  }

  // Get theme for specific UI context
  getContextualColors(context = 'default') {
    const colors = this.getThemeColors();

    const contextMap = {
      'error': {
        bg: colors.error,
        fg: colors.bg,
        border: colors.error
      },
      'success': {
        bg: colors.success,
        fg: colors.bg,
        border: colors.success
      },
      'warning': {
        bg: colors.warning,
        fg: colors.bg,
        border: colors.warning
      },
      'info': {
        bg: colors.info,
        fg: colors.bg,
        border: colors.info
      },
      'default': {
        bg: colors.bg,
        fg: colors.fg,
        border: colors.border
      }
    };

    return contextMap[context] || contextMap.default;
  }
}

// Create global theme manager instance
window.chromeClipThemeManager = new ThemeManager();
