# chrome-clip - Smart Clipboard Overlay Extension

> A powerful Chrome extension that transforms your clipboard into an intelligent, themeable overlay for seamless data entry and form filling.

![chrome-clip Demo](assets/demo.gif)

## 🎯 Overview

chrome-clip is a Chrome extension that displays clipboard contents in a sophisticated, resizable overlay triggered by customizable hotkeys. Designed for developers and power users who frequently need to reference or paste data while filling forms or working with web applications.

### ✨ Key Features

- **🚀 Instant Access**: Press `Ctrl+Shift+Z` to instantly view clipboard contents
- **📍 Smart Positioning**: Snap-to-edge sidebar (left/right/top/bottom at 25% viewport)
- **🎨 Beautiful Themes**: Vim-inspired themes (Gruvbox Dark, Catppuccin Latte, Dracula, Nord)
- **📝 Content Tools**: Format JSON/XML, validate data, transform text
- **📚 History Buffer**: Keep track of recent clipboard entries with timestamps
- **⌨️ Keyboard Navigation**: Full keyboard control for accessibility
- **🔄 Cross-Page Persistence**: Overlay survives navigation and page refreshes

## 🛠️ Installation

### From Chrome Web Store (Coming Soon)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/)
2. Search for "chrome-clip"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/mbarlow/chrome-clip.git
   cd chrome-clip
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top-right corner)

4. Click "Load unpacked" and select the `chrome-clip` directory

5. The extension should now appear in your extensions list

## 🎮 Usage

### Basic Usage
1. **Activate Overlay**: Press `Ctrl+Shift+Z` (or `Cmd+Shift+Z` on Mac)
2. **View Content**: Your current clipboard content appears in the overlay
3. **Navigate Tabs**: Use the Current, History, and Tools tabs
4. **Dismiss**: Press `Esc` or click the close button

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Z` | Toggle overlay |
| `Esc` | Close overlay |
| `Ctrl+C` | Copy selected text |
| `Ctrl+V` | Paste from clipboard |
| `Ctrl+A` | Select all content |
| `Ctrl+F` | Focus search |
| `Tab` / `Shift+Tab` | Navigate elements |
| `Ctrl+Arrow Keys` | Move overlay to edges |
| `Ctrl+Plus/Minus` | Resize overlay |
| `Ctrl+Shift+T` | Cycle themes |

### Content Tools

#### Text Transformations
- **UPPERCASE** / **lowercase** / **Title Case**
- **Reverse text**
- **Base64 encode/decode**

#### Format Tools
- **Format JSON** - Pretty-print JSON with syntax highlighting
- **Format XML** - Clean up XML structure
- **Validate JSON/XML** - Check syntax and structure
- **Validate URLs/Emails** - Verify format correctness

### Themes

Choose from four beautiful vim-inspired themes:

- **🌙 Gruvbox Dark** (Default) - Warm, retro colors
- **☀️ Catppuccin Latte** - Clean, modern light theme
- **🧛 Dracula** - Popular dark theme with purple accents
- **🏔️ Nord** - Cool, nordic-inspired theme

Switch themes instantly with `Ctrl+Shift+T` or via the settings panel.

## ⚙️ Configuration

Access settings by clicking the extension icon in the toolbar.

### Position & Size
- **Default Position**: Choose which edge the overlay snaps to
- **Default Size**: Set the initial overlay size (15-75% of viewport)
- **Smart Positioning**: Automatically choose optimal position based on page content

### Behavior
- **Persistence**: Keep overlay visible across page navigation
- **Auto-dismiss**: Automatically hide overlay after timeout
- **History Size**: Number of clipboard entries to remember (5-100)

### Privacy
- **Clipboard Monitoring**: Watch for clipboard changes when overlay is visible
- **Local Storage**: All data is stored locally in your browser
- **No Analytics**: Your clipboard data never leaves your device

## 🏗️ Architecture

### File Structure
```
chrome-clip/
├── manifest.json              # Extension configuration
├── background/
│   └── service-worker.js     # Background script for hotkeys
├── content/
│   ├── overlay.js           # Main overlay logic
│   ├── themes.js            # Theme management
│   ├── positioning.js       # Snap-to-edge positioning
│   └── keyboard-handler.js  # Hotkey processing
├── popup/
│   ├── popup.html          # Settings interface
│   ├── popup.js            # Settings logic
│   └── popup.css           # Settings styling
├── styles/
│   ├── overlay.css         # Core overlay styles
│   ├── animations.css      # Smooth transitions
│   └── themes/             # Theme-specific styles
└── assets/
    └── icons/              # Extension icons
```

### Technologies Used
- **Manifest V3** - Modern Chrome extension architecture
- **Vanilla JavaScript** - No framework dependencies for maximum performance
- **CSS Custom Properties** - Dynamic theming support
- **Chrome APIs**: `commands`, `storage`, `tabs`, `clipboardRead`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Reporting Issues
- Use the [GitHub Issues](https://github.com/mbarlow/chrome-clip/issues) page
- Include your Chrome version and operating system
- Provide steps to reproduce the issue
- Screenshots are helpful!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Gruvbox** color scheme by [morhetz](https://github.com/morhetz/gruvbox)
- **Catppuccin** color scheme by [Catppuccin](https://github.com/catppuccin/catppuccin)
- **Dracula** color scheme by [Dracula Theme](https://draculatheme.com/)
- **Nord** color scheme by [Arctic Ice Studio](https://www.nordtheme.com/)

## 🔮 Roadmap

- [ ] Custom hotkey configuration
- [ ] Plugin system for custom tools
- [ ] Cloud sync for settings (optional)
- [ ] OCR for image clipboard content
- [ ] Integration with password managers
- [ ] Multi-language support

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/mbarlow/chrome-clip/wiki)
- **Issues**: [GitHub Issues](https://github.com/mbarlow/chrome-clip/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mbarlow/chrome-clip/discussions)

---

**Made with ❤️ for developers who live in their browsers**