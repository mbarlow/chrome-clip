# Chrome-clip Troubleshooting Guide

This guide helps you diagnose and fix common issues with the chrome-clip extension.

## 🔍 Quick Diagnostics

### Test 1: Check Extension Installation
1. Go to `chrome://extensions/`
2. Find "chrome-clip" in the list
3. Ensure it's **enabled** (toggle should be blue/on)
4. Check for any error messages in red

### Test 2: Check Hotkey Registration
1. Go to `chrome://extensions/shortcuts`
2. Find "chrome-clip" in the list
3. Verify "Toggle overlay" has a hotkey assigned
4. Default should be `Ctrl+Shift+Z`

### Test 3: Test on a Simple Page
1. Open a new tab with a simple website (e.g., `example.com`)
2. Press `Ctrl+Shift+Z`
3. Check browser console (F12 → Console) for errors

## 🚨 Common Issues & Solutions

### Issue 1: Hotkey Does Nothing

**Symptoms:** Pressing `Ctrl+Shift+Z` doesn't show the overlay

**Causes & Solutions:**

1. **Extension not loaded properly**
   - Go to `chrome://extensions/`
   - Click the refresh icon on chrome-clip
   - Try the hotkey again

2. **Content script not injected**
   - Refresh the webpage
   - Try on a different website
   - Avoid testing on `chrome://` pages (extensions can't run there)

3. **Hotkey conflict**
   - Go to `chrome://extensions/shortcuts`
   - Change the hotkey to something else (e.g., `Ctrl+Shift+Q`)
   - Test the new hotkey

4. **Missing icon files**
   - Create icon files using the provided `create-icons.html`
   - Or temporarily use any PNG files renamed to `icon16.png`, `icon48.png`, `icon128.png`

### Issue 2: Extension Won't Load

**Symptoms:** Extension appears in list but shows errors

**Solutions:**

1. **Check for syntax errors**
   - Look for red error text in `chrome://extensions/`
   - Click "Errors" if present to see details

2. **Verify file structure**
   ```
   chrome-clip/
   ├── manifest.json
   ├── background/service-worker.js
   ├── content/*.js
   ├── popup/*.html,*.js,*.css
   └── styles/*.css
   ```

3. **Try reloading**
   - Click the refresh icon on the extension
   - Or remove and re-add the extension

### Issue 3: Overlay Shows But Content Is Empty

**Symptoms:** Overlay appears but shows no clipboard content

**Solutions:**

1. **Grant clipboard permissions**
   - Click on the page first to focus it
   - Some sites block clipboard access

2. **Test with known content**
   - Copy some text (`Ctrl+C`)
   - Then press `Ctrl+Shift+Z`

3. **Check browser permissions**
   - Go to `chrome://settings/content/clipboard`
   - Ensure clipboard access is allowed

### Issue 4: Overlay Appears But Looks Broken

**Symptoms:** Overlay shows but styling is wrong or missing

**Solutions:**

1. **Check CSS loading**
   - Open browser console (F12)
   - Look for CSS loading errors

2. **Try different themes**
   - Click the theme button (🎨) in the overlay
   - Or press `Ctrl+Shift+T`

3. **Reset extension**
   - Remove and reinstall the extension

## 🛠️ Advanced Troubleshooting

### Debug Mode

Open browser console (F12) and run:
```javascript
debugChromeClip()
```

This will show detailed information about the extension state.

### Manual Testing

1. **Test overlay creation:**
   ```javascript
   window.chromeClipOverlay.show()
   ```

2. **Test content update:**
   ```javascript
   window.chromeClipOverlay.updateContent("Test content")
   ```

3. **Check component loading:**
   ```javascript
   console.log("Overlay:", window.chromeClipOverlay)
   console.log("Keyboard:", window.chromeClipKeyboardHandler)
   console.log("Themes:", window.chromeClipThemeManager)
   console.log("Position:", window.chromeClipPositionManager)
   ```

### Console Error Messages

**Common error patterns and solutions:**

1. **"Cannot read property of undefined"**
   - Component failed to load
   - Check file paths in manifest.json
   - Ensure all files exist

2. **"chrome.runtime.sendMessage is not defined"**
   - Extension context issue
   - Reload the extension
   - Check if running on restricted page

3. **"Failed to read clipboard"**
   - Permission issue
   - Click on page first
   - Try on different website

## 🔧 Installation Issues

### Icon Files Missing

If you see warnings about missing icons:

1. **Quick fix:** Use placeholder images
   - Find any 16x16, 48x48, and 128x128 PNG files
   - Rename them to `icon16.png`, `icon48.png`, `icon128.png`
   - Place in `assets/icons/` folder

2. **Proper fix:** Generate icons
   - Open `create-icons.html` in your browser
   - Download the generated icons
   - Place them in the correct folder

### Manifest V3 Issues

If you see manifest version errors:
- Ensure you're using Chrome 88 or newer
- Check that `manifest.json` is valid JSON
- Verify all required fields are present

## 🌐 Browser-Specific Issues

### Chrome
- Works best with Chrome 88+
- Ensure developer mode is enabled for manual installation

### Edge (Chromium)
- Should work the same as Chrome
- May need to enable "Allow extensions from other stores"

### Other Browsers
- **Firefox:** Not supported (different extension system)
- **Safari:** Not supported
- **Opera:** May work but not officially supported

## 📋 Permissions Issues

### Required Permissions
The extension needs these permissions:
- **activeTab:** To inject into web pages
- **storage:** To save settings
- **clipboardRead:** To access clipboard content

### Permission Denied
If you see permission errors:
1. Check that all permissions are granted
2. Try removing and reinstalling the extension
3. Ensure you're not on a restricted page

## 🔄 Reset Everything

If nothing else works:

1. **Complete reset:**
   - Go to `chrome://extensions/`
   - Remove chrome-clip
   - Restart Chrome
   - Re-install the extension

2. **Clear data:**
   - Go to `chrome://settings/content/all`
   - Search for sites where you used chrome-clip
   - Clear site data

## 📞 Getting Help

### Before Asking for Help

1. **Check this guide** for your specific issue
2. **Try the debug function** in console
3. **Test on multiple websites**
4. **Check Chrome version** (needs 88+)

### Information to Include

When reporting issues, please include:
- Chrome version: `chrome://version/`
- Operating system
- Error messages from console
- Steps to reproduce
- Output of `debugChromeClip()` function

### Where to Get Help

1. **GitHub Issues:** [Create an issue](https://github.com/mbarlow/chrome-clip/issues)
2. **GitHub Discussions:** [Join discussion](https://github.com/mbarlow/chrome-clip/discussions)
3. **Check existing issues** for similar problems

## 🎯 Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| Hotkey not working | Refresh page, check `chrome://extensions/shortcuts` |
| Extension won't load | Check file structure, reload extension |
| Empty overlay | Copy text first, click on page |
| Broken styling | Try theme cycling with `Ctrl+Shift+T` |
| Console errors | Run `debugChromeClip()` for details |
| Permission denied | Ensure not on chrome:// pages |

## ✅ Success Checklist

Your extension is working correctly if:
- ✅ Extension appears in `chrome://extensions/` without errors
- ✅ Hotkey is registered in `chrome://extensions/shortcuts`
- ✅ Pressing `Ctrl+Shift+Z` shows overlay on regular websites
- ✅ Overlay displays clipboard content
- ✅ Theme switching works with `Ctrl+Shift+T`
- ✅ Settings popup opens when clicking extension icon

---

**Still having issues? Check the [GitHub Issues](https://github.com/mbarlow/chrome-clip/issues) or create a new one with the details from your debugging session.**