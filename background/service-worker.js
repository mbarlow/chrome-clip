// Background service worker for chrome-clip extension
// Handles hotkey commands and manages extension state

// Listen for command events (hotkeys)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-overlay") {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab && tab.id) {
        // Send message to content script to toggle overlay
        chrome.tabs
          .sendMessage(tab.id, {
            action: "toggle-overlay",
          })
          .catch((error) => {
            console.log("Error sending message to content script:", error);
          });
      }
    } catch (error) {
      console.error("Error handling toggle-overlay command:", error);
    }
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    // Set default settings
    const defaultSettings = {
      theme: "gruvbox-dark",
      defaultPosition: "right",
      defaultSize: 25,
      autoDismiss: false,
      dismissTimer: 5000,
      persistence: true,
      hotkey: "Ctrl+Shift+Z",
    };

    await chrome.storage.sync.set({ settings: defaultSettings });
    console.log("chrome-clip extension installed with default settings");
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "get-settings":
      chrome.storage.sync.get(["settings"]).then((result) => {
        sendResponse(result.settings || {});
      });
      return true; // Indicate async response

    case "save-settings":
      chrome.storage.sync
        .set({ settings: message.settings })
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Indicate async response

    case "log-error":
      console.error("Content script error:", message.error);
      break;

    default:
      console.log("Unknown message action:", message.action);
  }
});

// Handle tab updates to maintain overlay state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    !tab.url.startsWith("chrome://")
  ) {
    // Tab has finished loading, content script will handle overlay restoration
    console.log("Tab updated, content script will handle overlay state");
  }
});

// Handle tab activation to ensure overlay state is maintained
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && !tab.url.startsWith("chrome://")) {
      // Send message to check if overlay should be restored
      chrome.tabs
        .sendMessage(activeInfo.tabId, {
          action: "check-overlay-state",
        })
        .catch((error) => {
          // Content script might not be ready yet, this is normal
          console.log("Content script not ready for tab activation message");
        });
    }
  } catch (error) {
    console.log("Error handling tab activation:", error);
  }
});

// Cleanup function for extension lifecycle
chrome.runtime.onSuspend.addListener(() => {
  console.log("chrome-clip service worker suspending");
});

// Keep service worker alive for critical operations
let keepAliveInterval;

function keepServiceWorkerAlive() {
  keepAliveInterval = setInterval(() => {
    chrome.runtime.getPlatformInfo(() => {
      // Simple operation to keep service worker active
    });
  }, 25000); // Every 25 seconds
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Start keep-alive mechanism
keepServiceWorkerAlive();

// Stop keep-alive when suspending
chrome.runtime.onSuspend.addListener(stopKeepAlive);
