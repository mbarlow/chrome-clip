// Popup JavaScript for chrome-clip extension
// Handles settings management and UI interactions

class PopupManager {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      theme: "gruvbox-dark",
      defaultPosition: "right",
      defaultSize: 25,
      autoDismiss: false,
      dismissTimer: 5000,
      persistence: true,
      hotkey: "Ctrl+Shift+Z",
      smartPositioning: false,
      clipboardMonitoring: true,
      analytics: false,
      historySize: 20,
    };

    this.init();
  }

  // Initialize popup
  async init() {
    try {
      await this.loadSettings();
      this.setupEventListeners();
      this.updateUI();
      this.updateThemePreview();
      console.log("Popup initialized");
    } catch (error) {
      console.error("Failed to initialize popup:", error);
      this.showToast("Failed to load settings", "error");
    }
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "get-settings" }, resolve);
      });

      this.settings = { ...this.defaultSettings, ...result };
    } catch (error) {
      console.error("Error loading settings:", error);
      this.settings = { ...this.defaultSettings };
    }
  }

  // Save settings to storage
  async saveSettings() {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            action: "save-settings",
            settings: this.settings,
          },
          resolve,
        );
      });

      if (response && response.success) {
        this.showToast("Settings saved successfully", "success");
        return true;
      } else {
        throw new Error(response?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      this.showToast("Failed to save settings", "error");
      return false;
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Quick actions
    document.getElementById("toggle-overlay")?.addEventListener("click", () => {
      this.toggleOverlay();
    });

    document.getElementById("clear-history")?.addEventListener("click", () => {
      this.clearHistory();
    });

    document
      .getElementById("export-settings")
      ?.addEventListener("click", () => {
        this.exportSettings();
      });

    document
      .getElementById("import-settings")
      ?.addEventListener("click", () => {
        this.importSettings();
      });

    // Theme selection
    const themeSelect = document.getElementById("theme-select");
    themeSelect?.addEventListener("change", (e) => {
      this.settings.theme = e.target.value;
      this.updateThemePreview();
      document.body.className = `theme-${e.target.value}`;
    });

    // Position settings
    const positionSelect = document.getElementById("position-select");
    positionSelect?.addEventListener("change", (e) => {
      this.settings.defaultPosition = e.target.value;
    });

    // Size slider
    const sizeSlider = document.getElementById("size-slider");
    const sizeValue = document.getElementById("size-value");
    sizeSlider?.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      this.settings.defaultSize = value;
      if (sizeValue) {
        sizeValue.textContent = `${value}%`;
      }
    });

    // Smart positioning
    const smartPositioning = document.getElementById("smart-positioning");
    smartPositioning?.addEventListener("change", (e) => {
      this.settings.smartPositioning = e.target.checked;
    });

    // Persistence
    const persistence = document.getElementById("persistence");
    persistence?.addEventListener("change", (e) => {
      this.settings.persistence = e.target.checked;
    });

    // Auto dismiss
    const autoDismiss = document.getElementById("auto-dismiss");
    const timeoutGroup = document.querySelector(".auto-dismiss-timeout");
    autoDismiss?.addEventListener("change", (e) => {
      this.settings.autoDismiss = e.target.checked;
      if (timeoutGroup) {
        timeoutGroup.style.display = e.target.checked ? "block" : "none";
      }
    });

    // Dismiss timeout
    const dismissTimeout = document.getElementById("dismiss-timeout");
    const timeoutValue = document.getElementById("timeout-value");
    dismissTimeout?.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      this.settings.dismissTimer = value * 1000; // Convert to milliseconds
      if (timeoutValue) {
        timeoutValue.textContent = `${value} second${value !== 1 ? "s" : ""}`;
      }
    });

    // History size
    const historySize = document.getElementById("history-size");
    const historySizeValue = document.getElementById("history-size-value");
    historySize?.addEventListener("input", (e) => {
      const value = parseInt(e.target.value);
      this.settings.historySize = value;
      if (historySizeValue) {
        historySizeValue.textContent = `${value} items`;
      }
    });

    // Clipboard monitoring
    const clipboardMonitoring = document.getElementById("clipboard-monitoring");
    clipboardMonitoring?.addEventListener("change", (e) => {
      this.settings.clipboardMonitoring = e.target.checked;
    });

    // Analytics
    const analytics = document.getElementById("analytics");
    analytics?.addEventListener("change", (e) => {
      this.settings.analytics = e.target.checked;
    });

    // Footer actions
    document.getElementById("save-settings")?.addEventListener("click", () => {
      this.saveSettings();
    });

    document.getElementById("reset-settings")?.addEventListener("click", () => {
      this.resetSettings();
    });

    // Customize shortcuts
    document
      .getElementById("customize-shortcuts")
      ?.addEventListener("click", () => {
        this.openShortcutsPage();
      });

    // Footer links
    document.getElementById("help-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openHelpPage();
    });

    document.getElementById("feedback-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openFeedbackPage();
    });

    document.getElementById("github-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.openGitHubPage();
    });

    // Import file handler
    const importFile = document.getElementById("import-file");
    importFile?.addEventListener("change", (e) => {
      this.handleImportFile(e.target.files[0]);
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }

  // Update UI with current settings
  updateUI() {
    // Theme
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
      themeSelect.value = this.settings.theme;
      document.body.className = `theme-${this.settings.theme}`;
    }

    // Position
    const positionSelect = document.getElementById("position-select");
    if (positionSelect) {
      positionSelect.value = this.settings.defaultPosition;
    }

    // Size
    const sizeSlider = document.getElementById("size-slider");
    const sizeValue = document.getElementById("size-value");
    if (sizeSlider) {
      sizeSlider.value = this.settings.defaultSize;
    }
    if (sizeValue) {
      sizeValue.textContent = `${this.settings.defaultSize}%`;
    }

    // Smart positioning
    const smartPositioning = document.getElementById("smart-positioning");
    if (smartPositioning) {
      smartPositioning.checked = this.settings.smartPositioning;
    }

    // Persistence
    const persistence = document.getElementById("persistence");
    if (persistence) {
      persistence.checked = this.settings.persistence;
    }

    // Auto dismiss
    const autoDismiss = document.getElementById("auto-dismiss");
    const timeoutGroup = document.querySelector(".auto-dismiss-timeout");
    if (autoDismiss) {
      autoDismiss.checked = this.settings.autoDismiss;
    }
    if (timeoutGroup) {
      timeoutGroup.style.display = this.settings.autoDismiss ? "block" : "none";
    }

    // Dismiss timeout
    const dismissTimeout = document.getElementById("dismiss-timeout");
    const timeoutValue = document.getElementById("timeout-value");
    if (dismissTimeout) {
      dismissTimeout.value = this.settings.dismissTimer / 1000;
    }
    if (timeoutValue) {
      const seconds = this.settings.dismissTimer / 1000;
      timeoutValue.textContent = `${seconds} second${seconds !== 1 ? "s" : ""}`;
    }

    // History size
    const historySize = document.getElementById("history-size");
    const historySizeValue = document.getElementById("history-size-value");
    if (historySize) {
      historySize.value = this.settings.historySize;
    }
    if (historySizeValue) {
      historySizeValue.textContent = `${this.settings.historySize} items`;
    }

    // Clipboard monitoring
    const clipboardMonitoring = document.getElementById("clipboard-monitoring");
    if (clipboardMonitoring) {
      clipboardMonitoring.checked = this.settings.clipboardMonitoring;
    }

    // Analytics
    const analytics = document.getElementById("analytics");
    if (analytics) {
      analytics.checked = this.settings.analytics;
    }
  }

  // Update theme preview
  updateThemePreview() {
    const themes = {
      "gruvbox-dark": {
        bg: "#282828",
        bgAlt: "#3c3836",
        fg: "#ebdbb2",
        accent: "#fabd2f",
        border: "#504945",
      },
      "catppuccin-latte": {
        bg: "#eff1f5",
        bgAlt: "#e6e9ef",
        fg: "#4c4f69",
        accent: "#1e66f5",
        border: "#acb0be",
      },
      dracula: {
        bg: "#282a36",
        bgAlt: "#44475a",
        fg: "#f8f8f2",
        accent: "#bd93f9",
        border: "#44475a",
      },
      nord: {
        bg: "#2e3440",
        bgAlt: "#3b4252",
        fg: "#d8dee9",
        accent: "#88c0d0",
        border: "#4c566a",
      },
    };

    const theme = themes[this.settings.theme];
    if (!theme) return;

    const previewBox = document.querySelector(".preview-box");
    const previewHeader = document.querySelector(".preview-header");
    const previewContent = document.querySelector(".preview-content");
    const previewAccent = document.querySelector(".preview-accent");
    const previewText = document.querySelector(".preview-text");
    const previewButton = document.querySelector(".preview-button");

    if (previewBox) {
      previewBox.style.background = theme.bg;
      previewBox.style.borderColor = theme.border;
    }

    if (previewHeader) {
      previewHeader.style.background = theme.bgAlt;
      previewHeader.style.borderBottomColor = theme.border;
    }

    if (previewContent) {
      previewContent.style.background = theme.bg;
    }

    if (previewAccent) {
      previewAccent.style.color = theme.accent;
    }

    if (previewText) {
      previewText.style.color = theme.fg;
    }

    if (previewButton) {
      previewButton.style.background = theme.accent;
      previewButton.style.color = theme.bg;
    }
  }

  // Quick action handlers
  async toggleOverlay() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "toggle-overlay" });
        this.showToast("Overlay toggled", "info");
      }
    } catch (error) {
      console.error("Error toggling overlay:", error);
      this.showToast("Failed to toggle overlay", "error");
    }
  }

  async clearHistory() {
    if (confirm("Are you sure you want to clear all clipboard history?")) {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab && tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: "clear-history" });
          this.showToast("History cleared", "success");
        }
      } catch (error) {
        console.error("Error clearing history:", error);
        this.showToast("Failed to clear history", "error");
      }
    }
  }

  // Export settings to JSON file
  exportSettings() {
    try {
      const dataStr = JSON.stringify(this.settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = "chrome-clip-settings.json";
      link.click();

      this.showToast("Settings exported", "success");
    } catch (error) {
      console.error("Error exporting settings:", error);
      this.showToast("Failed to export settings", "error");
    }
  }

  // Import settings from JSON file
  importSettings() {
    const importFile = document.getElementById("import-file");
    if (importFile) {
      importFile.click();
    }
  }

  // Handle imported file
  handleImportFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);

        // Validate imported settings
        const validSettings = this.validateSettings(importedSettings);

        this.settings = { ...this.defaultSettings, ...validSettings };
        this.updateUI();
        this.updateThemePreview();

        this.showToast("Settings imported successfully", "success");
      } catch (error) {
        console.error("Error importing settings:", error);
        this.showToast("Invalid settings file", "error");
      }
    };

    reader.readAsText(file);
  }

  // Validate imported settings
  validateSettings(settings) {
    const valid = {};

    // Validate each setting against defaults
    for (const [key, defaultValue] of Object.entries(this.defaultSettings)) {
      if (settings.hasOwnProperty(key)) {
        const value = settings[key];
        const expectedType = typeof defaultValue;

        if (typeof value === expectedType) {
          // Additional validation for specific settings
          if (
            key === "theme" &&
            !["gruvbox-dark", "catppuccin-latte", "dracula", "nord"].includes(
              value,
            )
          ) {
            valid[key] = defaultValue;
          } else if (
            key === "defaultPosition" &&
            !["left", "right", "top", "bottom"].includes(value)
          ) {
            valid[key] = defaultValue;
          } else if (key === "defaultSize" && (value < 15 || value > 75)) {
            valid[key] = defaultValue;
          } else if (
            key === "dismissTimer" &&
            (value < 3000 || value > 30000)
          ) {
            valid[key] = defaultValue;
          } else if (key === "historySize" && (value < 5 || value > 100)) {
            valid[key] = defaultValue;
          } else {
            valid[key] = value;
          }
        } else {
          valid[key] = defaultValue;
        }
      }
    }

    return valid;
  }

  // Reset settings to defaults
  async resetSettings() {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      this.settings = { ...this.defaultSettings };
      this.updateUI();
      this.updateThemePreview();

      const saved = await this.saveSettings();
      if (saved) {
        this.showToast("Settings reset to defaults", "success");
      }
    }
  }

  // Open Chrome shortcuts page
  openShortcutsPage() {
    chrome.tabs.create({
      url: "chrome://extensions/shortcuts",
    });
    window.close();
  }

  // Open help page
  openHelpPage() {
    chrome.tabs.create({
      url: "https://github.com/mbarlow/chrome-clip#help",
    });
    window.close();
  }

  // Open feedback page
  openFeedbackPage() {
    chrome.tabs.create({
      url: "https://github.com/mbarlow/chrome-clip/issues",
    });
    window.close();
  }

  // Open GitHub page
  openGitHubPage() {
    chrome.tabs.create({
      url: "https://github.com/mbarlow/chrome-clip",
    });
    window.close();
  }

  // Handle keyboard shortcuts in popup
  handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      this.saveSettings();
    }

    // Ctrl/Cmd + R to reset
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
      event.preventDefault();
      this.resetSettings();
    }

    // Escape to close
    if (event.key === "Escape") {
      window.close();
    }
  }

  // Show toast notification
  showToast(message, type = "info") {
    const toast = document.getElementById("status-toast");
    const messageEl = toast?.querySelector(".toast-message");

    if (!toast || !messageEl) return;

    messageEl.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Update status indicator
  updateStatus(status, message) {
    const statusDot = document.querySelector(".status-dot");
    const statusText = document.querySelector(".status-text");

    if (statusDot && statusText) {
      statusText.textContent = message;

      statusDot.style.background =
        {
          success: "var(--popup-success)",
          error: "var(--popup-error)",
          warning: "var(--popup-warning)",
          info: "var(--popup-info)",
        }[status] || "var(--popup-success)";
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.popupManager = new PopupManager();
});

// Handle unload to save settings
window.addEventListener("beforeunload", () => {
  if (window.popupManager) {
    window.popupManager.saveSettings();
  }
});
