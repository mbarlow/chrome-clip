# Chrome-clip Icons

This directory contains the icon files for the chrome-clip extension.

## Required Icons

The extension requires the following icon sizes:
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

You can create these icons from the SVG file in the parent directory:

1. Open `../icon.svg` in a graphics editor like Inkscape or GIMP
2. Export as PNG at the required sizes
3. Name them according to the manifest requirements

## Temporary Solution

For development purposes, you can:
1. Copy any existing 16x16, 48x48, and 128x128 PNG files
2. Rename them to the required names
3. Or create simple colored squares as placeholders

The extension will work without proper icons, but Chrome will show generic placeholder icons.