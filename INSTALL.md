# Installation Guide for chrome-clip

This guide will help you install and set up the chrome-clip extension on your Chrome browser.

## 📋 Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic understanding of Chrome extensions

## 🚀 Installation Methods

### Method 1: Chrome Web Store (Recommended)

> **Note**: chrome-clip is not yet available on the Chrome Web Store. Please use Method 2 for now.

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/)
2. Search for "chrome-clip"
3. Click "Add to Chrome"
4. Click "Add extension" in the confirmation dialog
5. The extension icon will appear in your toolbar

### Method 2: Manual Installation (Developer Mode)

#### Step 1: Download the Extension

**Option A: Clone from GitHub**
```bash
git clone https://github.com/mbarlow/chrome-clip.git
cd chrome-clip
```

**Option B: Download ZIP**
1. Go to [GitHub repository](https://github.com/mbarlow/chrome-clip)
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file to a folder on your computer

#### Step 2: Enable Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. In the top-right corner, toggle **"Developer mode"** ON
3. You should see new buttons appear: "Load unpacked", "Pack extension", "Update"

#### Step 3: Load the Extension

1. Click **"Load unpacked"**
2. Navigate to and select the `chrome-clip` folder
3. Click **"Select Folder"** (or "Open" on Mac)
4. The extension should now appear in your extensions list

#### Step 4: Verify Installation

1. Look for the chrome-clip icon in your Chrome toolbar
2. If you don't see it, click the extensions puzzle piece icon and pin chrome-clip
3. Press `Ctrl+Shift+Z` (or `Cmd+Shift+Z` on Mac) to test the overlay

## ⚙️ Initial Setup

### 1. Grant Permissions

When first installed, Chrome may ask for permissions:

- **Read and change all your data on all websites**: Required for the overlay to work on any page
- **Read your clipboard**: Required to access clipboard content

Click "Allow" to grant these permissions.

### 2. Configure Hotkeys (Optional)

1. Go to `chrome://extensions/shortcuts`
2. Find "chrome-clip" in the list
3. Set your preferred hotkey for "Toggle overlay" (default: `Ctrl+Shift+Z`)

### 3. Customize Settings

1. Click the chrome-clip icon in your toolbar
2. Adjust theme, position, and behavior settings to your preference
3. Click "Save Changes"

## 🔧 Troubleshooting

### Extension Not Loading

**Problem**: "Load unpacked" fails with an error

**Solutions**:
- Ensure you selected the correct folder (should contain `manifest.json`)
- Check that all files are present and not corrupted
- Try refreshing the extensions page and loading again

### Overlay Not Appearing

**Problem**: Pressing the hotkey doesn't show the overlay

**Solutions**:
1. Check that the extension is enabled in `chrome://extensions/`
2. Verify the hotkey in `chrome://extensions/shortcuts`
3. Test on a regular webpage (not chrome:// pages)
4. Check browser console for error messages (F12 → Console)

### Clipboard Access Issues

**Problem**: "Failed to read clipboard" error

**Solutions**:
- Ensure the page is focused (click on it first)
- Some sites may block clipboard access - try a different site
- Check Chrome's site settings for clipboard permissions

### Theme Not Applying

**Problem**: Theme changes don't take effect

**Solutions**:
1. Refresh the page where you're testing
2. Try toggling the overlay off and on again
3. Check that settings were saved (look for confirmation message)

## 🔄 Updating the Extension

### Auto-Update (Chrome Web Store)
Extensions from the Chrome Web Store update automatically.

### Manual Update (Developer Mode)
1. Download the latest version
2. Go to `chrome://extensions/`
3. Click the refresh icon on the chrome-clip extension card
4. Or remove the old version and load the new one

## 🗑️ Uninstalling

### Complete Removal
1. Go to `chrome://extensions/`
2. Find chrome-clip in the list
3. Click "Remove"
4. Confirm by clicking "Remove" again

### Clean Uninstall
To remove all settings and data:
1. Uninstall the extension (steps above)
2. Go to `chrome://settings/content/all`
3. Search for sites where you used chrome-clip
4. Clear site data if desired

## 🔒 Security & Privacy

### Data Storage
- All clipboard data is stored locally in your browser
- No data is sent to external servers
- History is cleared when you clear browser data

### Permissions Explained
- **Read clipboard**: Required to display your clipboard content
- **Access all websites**: Needed for the overlay to work on any page
- **Storage**: Saves your settings and clipboard history locally

## 📞 Getting Help

If you encounter issues not covered here:

1. **Check the FAQ**: [GitHub Wiki](https://github.com/mbarlow/chrome-clip/wiki)
2. **Search existing issues**: [GitHub Issues](https://github.com/mbarlow/chrome-clip/issues)
3. **Create a new issue**: Include your Chrome version, OS, and error details
4. **Join discussions**: [GitHub Discussions](https://github.com/mbarlow/chrome-clip/discussions)

## 🎯 Next Steps

After installation:

1. **Read the User Guide**: Check `README.md` for detailed usage instructions
2. **Explore Features**: Try different themes and tools
3. **Customize Settings**: Adjust the overlay to your workflow
4. **Share Feedback**: Let us know how chrome-clip helps your productivity!

---

**Happy clipping! 📋✨**