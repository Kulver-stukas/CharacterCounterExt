# Character Counter

A Microsoft Edge extension that counts characters on a webpage and displays the total in a tooltip.

## Features
- Automatically counts characters on the active tab (no click required).
- Updates every 5 seconds for real-time tracking.
- Preserves badge during page navigation (no reset).
- Works consistently across all sites, including full page reloads (e.g., FT.com) and SPA navigation (e.g., GitHub, VK.com).
- Badge: "N/A" on restricted pages (e.g., new tab, chrome://), otherwise approximate count (e.g., "1k").
- Tooltip: Shows the exact total character count.
- Lightweight performance with no noticeable impact on browser speed.

## Installation
1. Clone or download this repository.
2. Open Edge → "Extensions" → Enable "Developer mode".
3. Click "Load unpacked" and select this folder.

## Files
- `manifest.json`: Extension configuration.
- `background.js`: Logic for counting and updating.
- `icon*.png`: Icons for the extension.

## Credits
- **Created by**: Kulver-stukas (project lead, concept, testing, and release management).
- **Developed with**: Grok by xAI (code implementation, debugging, and optimization).