# Character Counter

A Microsoft Edge extension that counts characters on a webpage and displays the total in a tooltip.

## Features
- Empty badge in new tabs.
- First click: Starts counting (2s delay), updates every minute.
- Second click: Shows immediate count.
- Auto-updates on page changes within the tab.
- Badge: "N/A" on restricted pages, otherwise approximate count (e.g., "1k").
- Tooltip: Exact total and auto status.

## Installation
1. Clone or download this repository.
2. Open Edge → "Extensions" → Enable "Developer mode".
3. Click "Load unpacked" and select this folder.

## Files
- `manifest.json`: Extension configuration.
- `background.js`: Logic for counting and updating.
- `icon*.png`: Icons for the extension.

## Credits
Created by Kulver-stukas with assistance from Grok by xAI.