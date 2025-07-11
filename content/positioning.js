// Positioning system for chrome-clip overlay
// Handles snap-to-edge behavior, resizing, and viewport management

class PositionManager {
  constructor() {
    this.defaultPosition = 'right';
    this.defaultSize = 25; // Percentage of viewport
    this.minSize = 200; // Minimum pixels
    this.maxSize = 80; // Maximum percentage
    this.snapThreshold = 50; // Pixels for snap detection
    this.resizeHandleSize = 8; // Pixels
    this.settings = {};

    this.loadSettings();
  }

  // Load positioning settings from storage
  async loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'get-settings' }, resolve);
      });

      if (result) {
        this.settings = result;
        this.defaultPosition = result.defaultPosition || 'right';
        this.defaultSize = result.defaultSize || 25;
      }
    } catch (error) {
      console.log('Could not load positioning settings, using defaults');
    }
  }

  // Calculate overlay dimensions and position based on snap position
  calculateOverlayDimensions(position = null, size = null) {
    const pos = position || this.defaultPosition;
    const sizePercent = size || this.defaultSize;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Calculate size in pixels with min/max constraints
    let pixelSize;
    if (pos === 'left' || pos === 'right') {
      pixelSize = Math.max(
        this.minSize,
        Math.min(
          (viewport.width * sizePercent) / 100,
          (viewport.width * this.maxSize) / 100
        )
      );
    } else {
      pixelSize = Math.max(
        this.minSize,
        Math.min(
          (viewport.height * sizePercent) / 100,
          (viewport.height * this.maxSize) / 100
        )
      );
    }

    const dimensions = {
      position: pos,
      size: pixelSize,
      viewport: viewport
    };

    switch (pos) {
      case 'left':
        dimensions.x = 0;
        dimensions.y = 0;
        dimensions.width = pixelSize;
        dimensions.height = viewport.height;
        break;

      case 'right':
        dimensions.x = viewport.width - pixelSize;
        dimensions.y = 0;
        dimensions.width = pixelSize;
        dimensions.height = viewport.height;
        break;

      case 'top':
        dimensions.x = 0;
        dimensions.y = 0;
        dimensions.width = viewport.width;
        dimensions.height = pixelSize;
        break;

      case 'bottom':
        dimensions.x = 0;
        dimensions.y = viewport.height - pixelSize;
        dimensions.width = viewport.width;
        dimensions.height = pixelSize;
        break;

      default:
        // Default to right if invalid position
        dimensions.x = viewport.width - pixelSize;
        dimensions.y = 0;
        dimensions.width = pixelSize;
        dimensions.height = viewport.height;
        dimensions.position = 'right';
    }

    return dimensions;
  }

  // Apply positioning styles to overlay element
  applyPosition(overlay, dimensions) {
    if (!overlay) return;

    overlay.style.position = 'fixed';
    overlay.style.left = `${dimensions.x}px`;
    overlay.style.top = `${dimensions.y}px`;
    overlay.style.width = `${dimensions.width}px`;
    overlay.style.height = `${dimensions.height}px`;
    overlay.style.zIndex = '2147483647'; // Maximum z-index

    // Add position class for theme-specific styling
    overlay.classList.remove('snap-left', 'snap-right', 'snap-top', 'snap-bottom');
    overlay.classList.add(`snap-${dimensions.position}`);

    // Store current dimensions on element
    overlay.dataset.position = dimensions.position;
    overlay.dataset.size = dimensions.size;
  }

  // Detect which edge the overlay should snap to based on current position
  detectSnapPosition(x, y, width, height) {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Calculate distances to each edge
    const distances = {
      left: centerX,
      right: viewport.width - centerX,
      top: centerY,
      bottom: viewport.height - centerY
    };

    // Find the closest edge
    const closestEdge = Object.keys(distances).reduce((closest, edge) => {
      return distances[edge] < distances[closest] ? edge : closest;
    });

    // Only snap if within threshold
    const minDistance = Math.min(...Object.values(distances));
    if (minDistance <= this.snapThreshold) {
      return closestEdge;
    }

    return null;
  }

  // Add resize handles to overlay
  addResizeHandles(overlay, onResize) {
    const position = overlay.dataset.position;

    // Remove existing handles
    overlay.querySelectorAll('.chrome-clip-resize-handle').forEach(handle => {
      handle.remove();
    });

    let handlePosition;
    let cursor;

    switch (position) {
      case 'left':
        handlePosition = 'right';
        cursor = 'ew-resize';
        break;
      case 'right':
        handlePosition = 'left';
        cursor = 'ew-resize';
        break;
      case 'top':
        handlePosition = 'bottom';
        cursor = 'ns-resize';
        break;
      case 'bottom':
        handlePosition = 'top';
        cursor = 'ns-resize';
        break;
      default:
        return;
    }

    const handle = document.createElement('div');
    handle.className = 'chrome-clip-resize-handle';
    handle.style.position = 'absolute';
    handle.style.cursor = cursor;
    handle.style.zIndex = '10';

    // Position the handle
    if (position === 'left') {
      handle.style.right = '0';
      handle.style.top = '0';
      handle.style.bottom = '0';
      handle.style.width = `${this.resizeHandleSize}px`;
    } else if (position === 'right') {
      handle.style.left = '0';
      handle.style.top = '0';
      handle.style.bottom = '0';
      handle.style.width = `${this.resizeHandleSize}px`;
    } else if (position === 'top') {
      handle.style.bottom = '0';
      handle.style.left = '0';
      handle.style.right = '0';
      handle.style.height = `${this.resizeHandleSize}px`;
    } else if (position === 'bottom') {
      handle.style.top = '0';
      handle.style.left = '0';
      handle.style.right = '0';
      handle.style.height = `${this.resizeHandleSize}px`;
    }

    // Add resize functionality
    this.makeResizable(handle, overlay, position, onResize);
    overlay.appendChild(handle);
  }

  // Make overlay resizable via handle
  makeResizable(handle, overlay, position, onResize) {
    let isResizing = false;
    let startSize = 0;
    let startMouse = 0;

    const startResize = (e) => {
      e.preventDefault();
      e.stopPropagation();

      isResizing = true;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = handle.style.cursor;

      const rect = overlay.getBoundingClientRect();

      if (position === 'left' || position === 'right') {
        startSize = rect.width;
        startMouse = e.clientX;
      } else {
        startSize = rect.height;
        startMouse = e.clientY;
      }

      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    };

    const doResize = (e) => {
      if (!isResizing) return;

      let newSize;
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      if (position === 'left') {
        const delta = e.clientX - startMouse;
        newSize = Math.max(this.minSize, Math.min(startSize + delta, viewport.width * this.maxSize / 100));
      } else if (position === 'right') {
        const delta = startMouse - e.clientX;
        newSize = Math.max(this.minSize, Math.min(startSize + delta, viewport.width * this.maxSize / 100));
      } else if (position === 'top') {
        const delta = e.clientY - startMouse;
        newSize = Math.max(this.minSize, Math.min(startSize + delta, viewport.height * this.maxSize / 100));
      } else if (position === 'bottom') {
        const delta = startMouse - e.clientY;
        newSize = Math.max(this.minSize, Math.min(startSize + delta, viewport.height * this.maxSize / 100));
      }

      // Calculate new dimensions
      const sizePercent = position === 'left' || position === 'right'
        ? (newSize / viewport.width) * 100
        : (newSize / viewport.height) * 100;

      const dimensions = this.calculateOverlayDimensions(position, sizePercent);
      this.applyPosition(overlay, dimensions);

      if (onResize) {
        onResize(dimensions);
      }
    };

    const stopResize = () => {
      if (!isResizing) return;

      isResizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);

      // Save new size to settings
      this.savePositionSettings();
    };

    handle.addEventListener('mousedown', startResize);
  }

  // Handle viewport resize
  handleViewportResize(overlay) {
    if (!overlay) return;

    const position = overlay.dataset.position;
    const sizePercent = this.defaultSize;

    const dimensions = this.calculateOverlayDimensions(position, sizePercent);
    this.applyPosition(overlay, dimensions);
  }

  // Save position settings
  async savePositionSettings() {
    try {
      const settings = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'get-settings' }, resolve);
      });

      const updatedSettings = {
        ...settings,
        defaultPosition: this.defaultPosition,
        defaultSize: this.defaultSize
      };

      chrome.runtime.sendMessage({
        action: 'save-settings',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Failed to save position settings:', error);
    }
  }

  // Get optimal position based on page content
  getOptimalPosition() {
    // Simple heuristic: check if there's more content on left or right
    const body = document.body;
    const bodyRect = body.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Check for forms or input fields that might need space
    const forms = document.querySelectorAll('form, input, textarea, select');
    const formAreas = Array.from(forms).map(form => {
      const rect = form.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      };
    });

    // Prefer right side by default, unless there's significant content there
    let optimalPosition = 'right';

    // Check if right side has many forms
    const rightSideForms = formAreas.filter(area => area.left > viewport.width * 0.6);
    const leftSideForms = formAreas.filter(area => area.right < viewport.width * 0.4);

    if (rightSideForms.length > leftSideForms.length * 2) {
      optimalPosition = 'left';
    }

    return optimalPosition;
  }

  // Create positioning for new overlay
  positionNewOverlay(overlay) {
    const position = this.settings.smartPositioning
      ? this.getOptimalPosition()
      : this.defaultPosition;

    const dimensions = this.calculateOverlayDimensions(position);
    this.applyPosition(overlay, dimensions);

    return dimensions;
  }
}

// Create global position manager instance
window.chromeClipPositionManager = new PositionManager();
