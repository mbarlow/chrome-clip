// Main overlay component for chrome-clip extension
// Handles overlay creation, clipboard integration, and UI management

class ChromeClipOverlay {
  constructor() {
    this.isVisible = false;
    this.overlay = null;
    this.content = "";
    this.history = [];
    this.maxHistory = 20;
    this.settings = {};
    this.isInitialized = false;
    this.resizeObserver = null;
    this.clipboardMonitorInterval = null;
    this.lastClipboardContent = "";

    this.init();
  }

  // Initialize the overlay system
  async init() {
    if (this.isInitialized) return;

    try {
      await this.loadSettings();
      await this.checkClipboardContent();
      this.setupClipboardMonitoring();
      this.attachEventListeners();
      this.isInitialized = true;

      console.log("ChromeClip overlay initialized successfully");
      // Announce to page that chrome-clip is ready
      window.dispatchEvent(new CustomEvent("chrome-clip-ready"));
    } catch (error) {
      console.error("Failed to initialize ChromeClip overlay:", error);
      // Still make overlay available for manual testing
      this.createOverlay();
    }
  }

  // Load settings from storage
  async loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: "get-settings" }, resolve);
      });

      this.settings = result || {};
      console.log("Settings loaded:", this.settings);
    } catch (error) {
      console.log("Could not load settings, using defaults");
      this.settings = {};
    }
  }

  // Check initial clipboard content
  async checkClipboardContent() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        this.content = text;
        this.lastClipboardContent = text;
        this.addToHistory(text);
      }
    } catch (error) {
      console.log("Could not read initial clipboard content:", error);
      // Set some default content for testing
      this.content = "chrome-clip is ready! Press Ctrl+Shift+Z to toggle.";
    }
  }

  // Setup clipboard monitoring
  setupClipboardMonitoring() {
    // Monitor clipboard changes every 1 second when overlay is visible
    this.clipboardMonitorInterval = setInterval(async () => {
      if (this.isVisible) {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text !== this.lastClipboardContent) {
            this.updateContent(text);
            this.lastClipboardContent = text;
            this.addToHistory(text);
          }
        } catch (error) {
          // Clipboard access might be restricted
        }
      }
    }, 1000);
  }

  // Create overlay DOM element
  createOverlay() {
    if (this.overlay) {
      return this.overlay;
    }

    const overlay = document.createElement("div");
    overlay.className = "chrome-clip-overlay";
    overlay.innerHTML = this.getOverlayHTML();

    // Apply theme styling
    if (window.chromeClipThemeManager) {
      window.chromeClipThemeManager.injectThemeStyles();
    }

    // Position overlay
    if (window.chromeClipPositionManager) {
      const dimensions =
        window.chromeClipPositionManager.positionNewOverlay(overlay);
      window.chromeClipPositionManager.addResizeHandles(
        overlay,
        (newDimensions) => {
          this.handleResize(newDimensions);
        },
      );
    }

    // Setup event handlers
    this.setupOverlayEventHandlers(overlay);

    // Add to document
    document.body.appendChild(overlay);
    this.overlay = overlay;

    // Setup resize observer
    this.setupResizeObserver();

    return overlay;
  }

  // Get overlay HTML structure
  getOverlayHTML() {
    return `
      <div class="chrome-clip-header">
        <div class="header-content">
          <div class="title">
            <span class="accent">chrome-clip</span>
            <span class="dim">v1.0.0</span>
          </div>
          <div class="controls">
            <button class="control-btn theme-btn" title="Cycle Theme (Ctrl+Shift+T)">
              🎨
            </button>
            <button class="control-btn settings-btn" title="Settings">
              ⚙️
            </button>
            <button class="control-btn close-btn" title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>
        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search clipboard content..." />
          <button class="search-clear" title="Clear search">✕</button>
        </div>
      </div>

      <div class="chrome-clip-content">
        <div class="content-tabs">
          <button class="tab-btn active" data-tab="current">Current</button>
          <button class="tab-btn" data-tab="history">History</button>
          <button class="tab-btn" data-tab="tools">Tools</button>
        </div>

        <div class="tab-content active" data-tab="current">
          <div class="content-header">
            <div class="content-info">
              <span class="content-type"></span>
              <span class="content-length"></span>
            </div>
            <div class="content-actions">
              <button class="action-btn copy-btn" title="Copy All (Ctrl+C)">📋</button>
              <button class="action-btn format-btn" title="Format">📝</button>
              <button class="action-btn validate-btn" title="Validate">✓</button>
            </div>
          </div>
          <div class="content-display">
            <pre class="content-text"></pre>
          </div>
        </div>

        <div class="tab-content" data-tab="history">
          <div class="history-header">
            <span class="history-count">0 items</span>
            <button class="clear-history-btn">Clear All</button>
          </div>
          <div class="history-list"></div>
        </div>

        <div class="tab-content" data-tab="tools">
          <div class="tools-grid">
            <div class="tool-section">
              <h4>Text Tools</h4>
              <button class="tool-btn" data-tool="uppercase">UPPERCASE</button>
              <button class="tool-btn" data-tool="lowercase">lowercase</button>
              <button class="tool-btn" data-tool="title">Title Case</button>
              <button class="tool-btn" data-tool="reverse">esreveR</button>
            </div>
            <div class="tool-section">
              <h4>Format Tools</h4>
              <button class="tool-btn" data-tool="json">Format JSON</button>
              <button class="tool-btn" data-tool="xml">Format XML</button>
              <button class="tool-btn" data-tool="base64-encode">Base64 Encode</button>
              <button class="tool-btn" data-tool="base64-decode">Base64 Decode</button>
            </div>
            <div class="tool-section">
              <h4>Validation</h4>
              <button class="tool-btn" data-tool="validate-json">Validate JSON</button>
              <button class="tool-btn" data-tool="validate-xml">Validate XML</button>
              <button class="tool-btn" data-tool="validate-email">Validate Email</button>
              <button class="tool-btn" data-tool="validate-url">Validate URL</button>
            </div>
          </div>
        </div>
      </div>

      <div class="chrome-clip-footer">
        <div class="status-bar">
          <span class="status-text">Ready</span>
          <span class="position-indicator"></span>
        </div>
        <div class="keyboard-hint">
          <span class="dim">Press </span>
          <span class="accent">Esc</span>
          <span class="dim"> to close</span>
        </div>
      </div>
    `;
  }

  // Setup overlay event handlers
  setupOverlayEventHandlers(overlay) {
    // Close button
    const closeBtn = overlay.querySelector(".close-btn");
    closeBtn?.addEventListener("click", () => this.hide());

    // Theme button
    const themeBtn = overlay.querySelector(".theme-btn");
    themeBtn?.addEventListener("click", () => {
      if (window.chromeClipKeyboardHandler) {
        window.chromeClipKeyboardHandler.cycleTheme();
      }
    });

    // Settings button
    const settingsBtn = overlay.querySelector(".settings-btn");
    settingsBtn?.addEventListener("click", () => this.showSettings());

    // Search functionality
    const searchInput = overlay.querySelector(".search-input");
    const searchClear = overlay.querySelector(".search-clear");

    searchInput?.addEventListener("input", (e) =>
      this.handleSearch(e.target.value),
    );
    searchClear?.addEventListener("click", () => {
      searchInput.value = "";
      this.handleSearch("");
    });

    // Tab switching
    const tabBtns = overlay.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });

    // Content actions
    const copyBtn = overlay.querySelector(".copy-btn");
    const formatBtn = overlay.querySelector(".format-btn");
    const validateBtn = overlay.querySelector(".validate-btn");

    copyBtn?.addEventListener("click", () => this.copyCurrentContent());
    formatBtn?.addEventListener("click", () => this.formatContent());
    validateBtn?.addEventListener("click", () => this.validateContent());

    // History actions
    const clearHistoryBtn = overlay.querySelector(".clear-history-btn");
    clearHistoryBtn?.addEventListener("click", () => this.clearHistory());

    // Tool buttons
    const toolBtns = overlay.querySelectorAll(".tool-btn");
    toolBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.applyTool(btn.dataset.tool));
    });

    // Prevent overlay clicks from bubbling to page
    overlay.addEventListener("click", (e) => e.stopPropagation());
    overlay.addEventListener("mousedown", (e) => e.stopPropagation());
    overlay.addEventListener("keydown", (e) => e.stopPropagation());
  }

  // Setup resize observer for responsive behavior
  setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handleOverlayResize(entry);
      }
    });

    if (this.overlay) {
      this.resizeObserver.observe(this.overlay);
    }
  }

  // Handle overlay resize
  handleOverlayResize(entry) {
    const { width, height } = entry.contentRect;

    // Adjust layout for small sizes
    if (width < 300) {
      this.overlay.classList.add("compact");
    } else {
      this.overlay.classList.remove("compact");
    }

    // Update position indicator
    this.updatePositionIndicator();
  }

  // Show overlay
  show() {
    console.log("ChromeClipOverlay.show() called");
    this.lastShowTime = Date.now();

    if (!this.overlay) {
      console.log("Creating overlay");
      this.createOverlay();
    }

    console.log("Setting overlay display to flex");
    this.overlay.style.display = "flex";
    this.isVisible = true;

    // Update content display
    this.updateContentDisplay();
    this.updateHistoryDisplay();
    this.updatePositionIndicator();

    // Focus search input (delayed to prevent immediate hide)
    const searchInput = this.overlay.querySelector(".search-input");
    if (searchInput) {
      setTimeout(() => {
        console.log("Focusing search input");
        if (this.isVisible) {
          searchInput.focus();
        }
      }, 500);
    }

    // Notify keyboard handler (delayed to prevent race condition)
    setTimeout(() => {
      if (window.chromeClipKeyboardHandler && this.isVisible) {
        console.log("Notifying keyboard handler of overlay show");
        window.chromeClipKeyboardHandler.setOverlay(this.overlay);
        window.chromeClipKeyboardHandler.updateVisibility(true);
      }
    }, 50);

    // Add show animation
    console.log("Adding show animation class");
    this.overlay.classList.add("chrome-clip-show");
    console.log("Overlay show completed, isVisible:", this.isVisible);
  }

  // Hide overlay
  hide() {
    console.log("ChromeClipOverlay.hide() called");
    if (!this.overlay) {
      console.log("No overlay to hide");
      return;
    }

    // Prevent immediate hide after show
    if (Date.now() - this.lastShowTime < 200) {
      console.log("Ignoring hide request - too soon after show");
      return;
    }

    console.log("Removing show class and adding hide class");
    this.overlay.classList.remove("chrome-clip-show");
    this.overlay.classList.add("chrome-clip-hide");

    setTimeout(() => {
      if (this.overlay) {
        console.log("Setting overlay display to none after animation");
        this.overlay.style.display = "none";
        this.overlay.classList.remove("chrome-clip-hide");
      }
    }, 200);

    this.isVisible = false;

    // Notify keyboard handler
    if (window.chromeClipKeyboardHandler) {
      console.log("Notifying keyboard handler of overlay hide");
      window.chromeClipKeyboardHandler.updateVisibility(false);
    }
    console.log("Overlay hide completed, isVisible:", this.isVisible);
  }

  // Update content from clipboard or external source
  updateContent(newContent) {
    if (newContent !== this.content) {
      this.content = newContent;
      this.updateContentDisplay();
      this.updateStatus("Content updated");
    }
  }

  // Update content display
  updateContentDisplay() {
    if (!this.overlay) return;

    const contentText = this.overlay.querySelector(".content-text");
    const contentType = this.overlay.querySelector(".content-type");
    const contentLength = this.overlay.querySelector(".content-length");

    if (contentText) {
      contentText.textContent = this.content;
    }

    if (contentType) {
      contentType.textContent = this.detectContentType(this.content);
    }

    if (contentLength) {
      const length = this.content.length;
      const words = this.content
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      contentLength.textContent = `${length} chars, ${words} words`;
    }

    // Apply syntax highlighting if available
    this.applySyntaxHighlighting();
  }

  // Detect content type
  detectContentType(content) {
    if (!content) return "Empty";

    try {
      JSON.parse(content);
      return "JSON";
    } catch {}

    if (content.match(/^<[\s\S]*>$/)) {
      return "XML/HTML";
    }

    if (content.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
      return "Base64";
    }

    if (content.match(/^https?:\/\//)) {
      return "URL";
    }

    if (content.match(/^[\w.-]+@[\w.-]+\.\w+$/)) {
      return "Email";
    }

    return "Text";
  }

  // Apply syntax highlighting
  applySyntaxHighlighting() {
    const contentText = this.overlay?.querySelector(".content-text");
    if (!contentText) return;

    const type = this.detectContentType(this.content);
    contentText.className = `content-text syntax-${type.toLowerCase()}`;

    // Simple syntax highlighting for JSON
    if (type === "JSON") {
      try {
        const parsed = JSON.parse(this.content);
        const formatted = JSON.stringify(parsed, null, 2);
        contentText.innerHTML = this.highlightJSON(formatted);
      } catch {}
    }
  }

  // Simple JSON syntax highlighting
  highlightJSON(json) {
    return json
      .replace(/("[\w\s]*")\s*:/g, '<span class="json-key">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="json-number">$1</span>');
  }

  // Add content to history
  addToHistory(content) {
    if (!content || content === this.history[0]) return;

    this.history.unshift(content);
    this.history = this.history.slice(0, this.maxHistory);
    this.updateHistoryDisplay();
  }

  // Update history display
  updateHistoryDisplay() {
    if (!this.overlay) return;

    const historyList = this.overlay.querySelector(".history-list");
    const historyCount = this.overlay.querySelector(".history-count");

    if (historyCount) {
      historyCount.textContent = `${this.history.length} items`;
    }

    if (historyList) {
      historyList.innerHTML = this.history
        .map(
          (item, index) => `
        <div class="history-item" data-index="${index}">
          <div class="history-content">
            <div class="history-preview">${this.truncateText(item, 100)}</div>
            <div class="history-meta">
              <span class="history-type">${this.detectContentType(item)}</span>
              <span class="history-length">${item.length} chars</span>
            </div>
          </div>
          <div class="history-actions">
            <button class="history-use-btn" title="Use this content">Use</button>
            <button class="history-copy-btn" title="Copy">📋</button>
            <button class="history-delete-btn" title="Delete">🗑️</button>
          </div>
        </div>
      `,
        )
        .join("");

      // Add event listeners to history items
      historyList.querySelectorAll(".history-use-btn").forEach((btn, index) => {
        btn.addEventListener("click", () => this.useHistoryItem(index));
      });

      historyList
        .querySelectorAll(".history-copy-btn")
        .forEach((btn, index) => {
          btn.addEventListener("click", () => this.copyHistoryItem(index));
        });

      historyList
        .querySelectorAll(".history-delete-btn")
        .forEach((btn, index) => {
          btn.addEventListener("click", () => this.deleteHistoryItem(index));
        });
    }
  }

  // Truncate text for display
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  // Switch between tabs
  switchTab(tabName) {
    if (!this.overlay) return;

    // Update tab buttons
    this.overlay.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab content
    this.overlay.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.dataset.tab === tabName);
    });
  }

  // Handle search
  handleSearch(query) {
    if (!this.overlay) return;

    const contentText = this.overlay.querySelector(".content-text");
    if (!contentText) return;

    if (!query) {
      // Clear highlighting
      contentText.textContent = this.content;
      this.applySyntaxHighlighting();
      return;
    }

    // Simple search highlighting
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const highlighted = this.content.replace(regex, "<mark>$1</mark>");
    contentText.innerHTML = highlighted;
  }

  // Copy current content
  copyCurrentContent() {
    navigator.clipboard
      .writeText(this.content)
      .then(() => {
        this.updateStatus("Copied to clipboard");
      })
      .catch((error) => {
        this.updateStatus("Failed to copy", "error");
      });
  }

  // Format content
  formatContent() {
    const type = this.detectContentType(this.content);

    try {
      let formatted;
      if (type === "JSON") {
        const parsed = JSON.parse(this.content);
        formatted = JSON.stringify(parsed, null, 2);
      } else {
        formatted = this.content;
      }

      this.updateContent(formatted);
      this.updateStatus("Content formatted");
    } catch (error) {
      this.updateStatus("Failed to format content", "error");
    }
  }

  // Validate content
  validateContent() {
    const type = this.detectContentType(this.content);

    try {
      if (type === "JSON") {
        JSON.parse(this.content);
        this.updateStatus("Valid JSON", "success");
      } else if (type === "URL") {
        new URL(this.content);
        this.updateStatus("Valid URL", "success");
      } else {
        this.updateStatus("No validation available for this content type");
      }
    } catch (error) {
      this.updateStatus(`Invalid ${type}: ${error.message}`, "error");
    }
  }

  // Apply tool transformation
  applyTool(toolName) {
    let result = this.content;

    try {
      switch (toolName) {
        case "uppercase":
          result = this.content.toUpperCase();
          break;
        case "lowercase":
          result = this.content.toLowerCase();
          break;
        case "title":
          result = this.content.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
          );
          break;
        case "reverse":
          result = this.content.split("").reverse().join("");
          break;
        case "json":
          const parsed = JSON.parse(this.content);
          result = JSON.stringify(parsed, null, 2);
          break;
        case "base64-encode":
          result = btoa(this.content);
          break;
        case "base64-decode":
          result = atob(this.content);
          break;
        default:
          this.updateStatus(`Tool '${toolName}' not implemented`);
          return;
      }

      this.updateContent(result);
      this.updateStatus(`Applied ${toolName} transformation`);
    } catch (error) {
      this.updateStatus(
        `Failed to apply ${toolName}: ${error.message}`,
        "error",
      );
    }
  }

  // History management methods
  useHistoryItem(index) {
    if (this.history[index]) {
      this.updateContent(this.history[index]);
      this.switchTab("current");
    }
  }

  copyHistoryItem(index) {
    if (this.history[index]) {
      navigator.clipboard.writeText(this.history[index]).then(() => {
        this.updateStatus("History item copied");
      });
    }
  }

  deleteHistoryItem(index) {
    this.history.splice(index, 1);
    this.updateHistoryDisplay();
  }

  clearHistory() {
    this.history = [];
    this.updateHistoryDisplay();
    this.updateStatus("History cleared");
  }

  // Update status message
  updateStatus(message, type = "info") {
    const statusText = this.overlay?.querySelector(".status-text");
    if (statusText) {
      statusText.textContent = message;
      statusText.className = `status-text ${type}`;

      // Clear status after 3 seconds
      setTimeout(() => {
        if (statusText.textContent === message) {
          statusText.textContent = "Ready";
          statusText.className = "status-text";
        }
      }, 3000);
    }
  }

  // Update position indicator
  updatePositionIndicator() {
    const indicator = this.overlay?.querySelector(".position-indicator");
    if (indicator && this.overlay) {
      const position = this.overlay.dataset.position || "right";
      const size = this.overlay.dataset.size || "25";
      indicator.textContent = `${position} ${Math.round(size)}%`;
    }
  }

  // Handle resize callback
  handleResize(dimensions) {
    this.updatePositionIndicator();
  }

  // Show settings (placeholder)
  showSettings() {
    this.updateStatus("Settings panel coming soon...");
  }

  // Get overlay element
  getElement() {
    return this.overlay;
  }

  // Attach global event listeners
  attachEventListeners() {
    // Handle viewport resize
    window.addEventListener("resize", () => {
      if (this.isVisible && this.overlay && window.chromeClipPositionManager) {
        window.chromeClipPositionManager.handleViewportResize(this.overlay);
      }
    });

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Content script received message:", message);
      switch (message.action) {
        case "toggle-overlay":
          console.log("Toggling overlay, current state:", this.isVisible);
          this.isVisible ? this.hide() : this.show();
          sendResponse({
            success: true,
            state: this.isVisible ? "hidden" : "shown",
          });
          break;
        case "check-overlay-state":
          // Restore overlay if it was visible
          if (this.settings.persistence && this.isVisible) {
            this.show();
          }
          sendResponse({
            success: true,
            persistent: this.settings.persistence,
          });
          break;
      }
    });

    // Cleanup on page unload
    window.addEventListener("beforeunload", () => {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      if (this.clipboardMonitorInterval) {
        clearInterval(this.clipboardMonitorInterval);
      }
    });
  }

  // Cleanup method
  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.clipboardMonitorInterval) {
      clearInterval(this.clipboardMonitorInterval);
      this.clipboardMonitorInterval = null;
    }

    this.isVisible = false;
    this.isInitialized = false;
  }
}

// Create global overlay instance and add debugging
console.log("Creating ChromeClip overlay instance...");
window.chromeClipOverlay = new ChromeClipOverlay();

// Add global debugging function
window.debugChromeClip = function () {
  console.log("=== Chrome-clip Debug Info ===");
  console.log("Overlay instance:", window.chromeClipOverlay);
  console.log("Is visible:", window.chromeClipOverlay?.isVisible);
  console.log("Settings:", window.chromeClipOverlay?.settings);
  console.log("Content:", window.chromeClipOverlay?.content);
  console.log("Keyboard handler:", window.chromeClipKeyboardHandler);
  console.log("Theme manager:", window.chromeClipThemeManager);
  console.log("Position manager:", window.chromeClipPositionManager);

  // Test toggle
  if (window.chromeClipOverlay) {
    console.log("Testing toggle...");
    window.chromeClipOverlay.isVisible
      ? window.chromeClipOverlay.hide()
      : window.chromeClipOverlay.show();
  }
};

// Announce readiness
console.log(
  "chrome-clip content script loaded. Run debugChromeClip() for diagnostics.",
);
