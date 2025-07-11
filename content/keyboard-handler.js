// Keyboard handler for chrome-clip extension
// Manages hotkey processing, overlay navigation, and keyboard shortcuts

class KeyboardHandler {
  constructor() {
    this.isOverlayVisible = false;
    this.overlay = null;
    this.settings = {};
    this.keyBindings = new Map();
    this.activeModifiers = new Set();

    this.loadSettings();
    this.setupDefaultBindings();
    this.attachEventListeners();
  }

  // Load keyboard settings from storage
  async loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "get-settings" }, resolve);
      });

      if (result) {
        this.settings = result;
      }
    } catch (error) {
      console.log("Could not load keyboard settings, using defaults");
    }
  }

  // Setup default key bindings
  setupDefaultBindings() {
    // Primary overlay toggle
    this.addBinding("Ctrl+Shift+Z", () => {
      console.log(
        "Ctrl+Shift+Z pressed, current overlay state:",
        this.isOverlayVisible,
      );
      this.toggleOverlay();
    });

    // Overlay-specific bindings (only active when overlay is visible)
    this.addBinding("Escape", () => this.hideOverlay());
    this.addBinding("Ctrl+C", (e) => this.copyToClipboard(e));
    this.addBinding("Ctrl+V", (e) => this.pasteFromClipboard(e));
    this.addBinding("Ctrl+A", (e) => this.selectAllContent(e));
    this.addBinding("Ctrl+F", (e) => this.focusSearch(e));
    this.addBinding("Tab", (e) => this.navigateElements(e));
    this.addBinding("Shift+Tab", (e) => this.navigateElements(e, true));
    this.addBinding("Enter", (e) => this.activateElement(e));
    this.addBinding("Space", (e) => this.activateElement(e));

    // Positioning shortcuts
    this.addBinding("Ctrl+Left", () => this.moveOverlay("left"));
    this.addBinding("Ctrl+Right", () => this.moveOverlay("right"));
    this.addBinding("Ctrl+Up", () => this.moveOverlay("top"));
    this.addBinding("Ctrl+Down", () => this.moveOverlay("bottom"));

    // Size shortcuts
    this.addBinding("Ctrl+Plus", () => this.resizeOverlay(1.2));
    this.addBinding("Ctrl+Minus", () => this.resizeOverlay(0.8));
    this.addBinding("Ctrl+0", () => this.resetOverlaySize());

    // Theme switching
    this.addBinding("Ctrl+Shift+T", () => this.cycleTheme());
  }

  // Add a key binding
  addBinding(keyCombo, callback, context = "global") {
    const key = this.normalizeKeyCombo(keyCombo);

    if (!this.keyBindings.has(key)) {
      this.keyBindings.set(key, []);
    }

    this.keyBindings.get(key).push({
      callback,
      context,
      combo: keyCombo,
    });
  }

  // Normalize key combination string
  normalizeKeyCombo(combo) {
    return combo
      .toLowerCase()
      .split("+")
      .map((key) => key.trim())
      .sort((a, b) => {
        // Sort modifiers first, then the main key
        const modifierOrder = ["ctrl", "alt", "shift", "meta"];
        const aIsModifier = modifierOrder.includes(a);
        const bIsModifier = modifierOrder.includes(b);

        if (aIsModifier && !bIsModifier) return -1;
        if (!aIsModifier && bIsModifier) return 1;
        if (aIsModifier && bIsModifier) {
          return modifierOrder.indexOf(a) - modifierOrder.indexOf(b);
        }

        return a.localeCompare(b);
      })
      .join("+");
  }

  // Convert keyboard event to key combo string
  eventToKeyCombo(event) {
    const parts = [];

    if (event.ctrlKey || event.metaKey) parts.push("ctrl");
    if (event.altKey) parts.push("alt");
    if (event.shiftKey) parts.push("shift");

    // Handle special keys
    let key = event.key.toLowerCase();

    const specialKeys = {
      " ": "space",
      arrowleft: "left",
      arrowright: "right",
      arrowup: "up",
      arrowdown: "down",
      enter: "enter",
      escape: "escape",
      tab: "tab",
      backspace: "backspace",
      delete: "delete",
      home: "home",
      end: "end",
      pageup: "pageup",
      pagedown: "pagedown",
    };

    key = specialKeys[key] || key;

    // Handle number row plus/minus
    if (key === "=" && event.shiftKey) key = "plus";
    if (key === "-") key = "minus";
    if (key === "0") key = "0";

    parts.push(key);

    return this.normalizeKeyCombo(parts.join("+"));
  }

  // Attach global event listeners
  attachEventListeners() {
    document.addEventListener("keydown", (e) => this.handleKeyDown(e), true);
    document.addEventListener("keyup", (e) => this.handleKeyUp(e), true);

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "toggle-overlay") {
        this.toggleOverlay();
      }
    });
  }

  // Handle key down events
  handleKeyDown(event) {
    const keyCombo = this.eventToKeyCombo(event);
    const bindings = this.keyBindings.get(keyCombo);

    if (keyCombo === "ctrl+shift+z") {
      console.log("Ctrl+Shift+Z detected in handleKeyDown");
    }

    if (!bindings) return;

    // Check if any binding should execute
    for (const binding of bindings) {
      if (this.shouldExecuteBinding(binding, event)) {
        console.log(
          "Executing binding for:",
          keyCombo,
          "overlay visible:",
          this.isOverlayVisible,
        );
        event.preventDefault();
        event.stopPropagation();

        try {
          binding.callback(event);
        } catch (error) {
          console.error("Error executing key binding:", error);
        }

        break;
      }
    }
  }

  // Handle key up events
  handleKeyUp(event) {
    // Track modifier state for complex combinations
    this.activeModifiers.clear();

    if (event.ctrlKey || event.metaKey) this.activeModifiers.add("ctrl");
    if (event.altKey) this.activeModifiers.add("alt");
    if (event.shiftKey) this.activeModifiers.add("shift");
  }

  // Check if a binding should execute in current context
  shouldExecuteBinding(binding, event) {
    // Global bindings always execute unless typing in input
    if (binding.context === "global") {
      // Don't execute if user is typing in an input field (except for overlay toggle)
      if (binding.combo.includes("Ctrl+Shift+Z")) {
        return true;
      }

      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.contentEditable === "true");

      // If overlay is visible and we're not typing, allow overlay bindings
      if (this.isOverlayVisible && !isTyping) {
        return true;
      }

      // If not typing and it's a global shortcut, allow it
      return !isTyping;
    }

    // Overlay-specific bindings only execute when overlay is visible
    if (binding.context === "overlay") {
      return this.isOverlayVisible;
    }

    return false;
  }

  // Toggle overlay visibility
  toggleOverlay() {
    console.log("toggleOverlay called, current state:", this.isOverlayVisible);
    if (this.isOverlayVisible) {
      console.log("Hiding overlay");
      this.hideOverlay();
    } else {
      console.log("Showing overlay");
      this.showOverlay();
    }
  }

  // Show overlay
  showOverlay() {
    console.log("showOverlay called");
    if (window.chromeClipOverlay) {
      console.log("Calling window.chromeClipOverlay.show()");
      window.chromeClipOverlay.show();
      this.isOverlayVisible = true;
      this.overlay = window.chromeClipOverlay.getElement();
      console.log("Overlay visibility set to:", this.isOverlayVisible);
    } else {
      console.log("window.chromeClipOverlay not available");
    }
  }

  // Hide overlay
  hideOverlay() {
    console.log("hideOverlay called");
    if (window.chromeClipOverlay) {
      console.log("Calling window.chromeClipOverlay.hide()");
      window.chromeClipOverlay.hide();
      this.isOverlayVisible = false;
      this.overlay = null;
      console.log("Overlay visibility set to:", this.isOverlayVisible);
    }
  }

  // Copy content to clipboard
  copyToClipboard(event) {
    if (!this.overlay) return;

    const selection = window.getSelection();
    if (selection.toString()) {
      navigator.clipboard.writeText(selection.toString()).catch((error) => {
        console.error("Failed to copy to clipboard:", error);
      });
    }
  }

  // Paste from clipboard
  pasteFromClipboard(event) {
    if (!this.overlay) return;

    navigator.clipboard
      .readText()
      .then((text) => {
        // Trigger overlay content update
        if (window.chromeClipOverlay) {
          window.chromeClipOverlay.updateContent(text);
        }
      })
      .catch((error) => {
        console.error("Failed to read from clipboard:", error);
      });
  }

  // Select all content in overlay
  selectAllContent(event) {
    if (!this.overlay) return;

    const contentArea = this.overlay.querySelector(".content");
    if (contentArea) {
      const range = document.createRange();
      range.selectNodeContents(contentArea);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  // Focus search input
  focusSearch(event) {
    if (!this.overlay) return;

    const searchInput = this.overlay.querySelector(".search-input");
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Navigate between focusable elements
  navigateElements(event, reverse = false) {
    if (!this.overlay) return;

    const focusableElements = this.overlay.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length === 0) return;

    const currentIndex = Array.from(focusableElements).indexOf(
      document.activeElement,
    );
    let nextIndex;

    if (reverse) {
      nextIndex =
        currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex =
        currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    }

    focusableElements[nextIndex].focus();
  }

  // Activate focused element
  activateElement(event) {
    if (!this.overlay) return;

    const activeElement = document.activeElement;
    if (activeElement && this.overlay.contains(activeElement)) {
      if (activeElement.tagName === "BUTTON") {
        activeElement.click();
      } else if (
        activeElement.tagName === "INPUT" &&
        activeElement.type === "checkbox"
      ) {
        activeElement.click();
      }
    }
  }

  // Move overlay to different edge
  moveOverlay(position) {
    if (!this.overlay || !window.chromeClipPositionManager) return;

    const dimensions =
      window.chromeClipPositionManager.calculateOverlayDimensions(position);
    window.chromeClipPositionManager.applyPosition(this.overlay, dimensions);

    // Update resize handles
    window.chromeClipPositionManager.addResizeHandles(
      this.overlay,
      (newDimensions) => {
        // Handle resize callback if needed
      },
    );
  }

  // Resize overlay
  resizeOverlay(factor) {
    if (!this.overlay || !window.chromeClipPositionManager) return;

    const currentSize = parseFloat(this.overlay.dataset.size) || 25;
    const newSize = Math.max(10, Math.min(80, currentSize * factor));

    const position = this.overlay.dataset.position;
    const dimensions =
      window.chromeClipPositionManager.calculateOverlayDimensions(
        position,
        newSize,
      );
    window.chromeClipPositionManager.applyPosition(this.overlay, dimensions);
  }

  // Reset overlay to default size
  resetOverlaySize() {
    if (!this.overlay || !window.chromeClipPositionManager) return;

    const position = this.overlay.dataset.position;
    const dimensions =
      window.chromeClipPositionManager.calculateOverlayDimensions(position, 25);
    window.chromeClipPositionManager.applyPosition(this.overlay, dimensions);
  }

  // Cycle through available themes
  cycleTheme() {
    if (!window.chromeClipThemeManager) return;

    const themes = window.chromeClipThemeManager.getAvailableThemes();
    const currentTheme = window.chromeClipThemeManager.currentTheme;
    const currentIndex = themes.findIndex((theme) => theme.id === currentTheme);

    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    window.chromeClipThemeManager.switchTheme(nextTheme.id);

    // Update overlay styling
    if (window.chromeClipThemeManager.injectThemeStyles) {
      window.chromeClipThemeManager.injectThemeStyles();
    }
  }

  // Set overlay reference
  setOverlay(overlayElement) {
    this.overlay = overlayElement;
    this.isOverlayVisible =
      overlayElement && overlayElement.style.display !== "none";
  }

  // Update visibility state
  updateVisibility(isVisible) {
    console.log(
      "updateVisibility called with:",
      isVisible,
      "current state:",
      this.isOverlayVisible,
    );
    this.isOverlayVisible = isVisible;
    if (!isVisible) {
      this.overlay = null;
    }
  }

  // Get current key bindings for display
  getKeyBindings() {
    const bindings = [];

    for (const [key, bindingList] of this.keyBindings) {
      for (const binding of bindingList) {
        bindings.push({
          key: binding.combo,
          description: this.getBindingDescription(binding.combo),
          context: binding.context,
        });
      }
    }

    return bindings.sort((a, b) => a.key.localeCompare(b.key));
  }

  // Get human-readable description for key binding
  getBindingDescription(combo) {
    const descriptions = {
      "Ctrl+Shift+Z": "Toggle overlay",
      Escape: "Hide overlay",
      "Ctrl+C": "Copy selected text",
      "Ctrl+V": "Paste from clipboard",
      "Ctrl+A": "Select all content",
      "Ctrl+F": "Focus search",
      Tab: "Next element",
      "Shift+Tab": "Previous element",
      Enter: "Activate element",
      Space: "Activate element",
      "Ctrl+Left": "Move to left edge",
      "Ctrl+Right": "Move to right edge",
      "Ctrl+Up": "Move to top edge",
      "Ctrl+Down": "Move to bottom edge",
      "Ctrl+Plus": "Increase size",
      "Ctrl+Minus": "Decrease size",
      "Ctrl+0": "Reset size",
      "Ctrl+Shift+T": "Cycle theme",
    };

    return descriptions[combo] || "Unknown action";
  }
}

// Create global keyboard handler instance
window.chromeClipKeyboardHandler = new KeyboardHandler();
