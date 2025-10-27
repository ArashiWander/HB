# Vendor: HB Classic (Birthday Animation Page)

## Source
- **Original Repository**: https://github.com/ayusharma/birthday
- **Author**: Ayush Sharma (@ayusharma)
- **License**: WTFPL (Do What The F*ck You Want To Public License)
- **Vendored Date**: October 27, 2025

## What This Is
A self-contained jQuery/Bootstrap 3 birthday greeting page with sequential animations:
- Lights turning on (colored bulbs)
- Music playback (`hbd.mp3`)
- Banner drop animation
- Floating balloons with letter reveals
- Animated birthday cake with candles
- Sequential birthday message reveal

## Why It's Vendored
This is a complete standalone experience with:
- Legacy jQuery/Bootstrap 3 dependencies
- Global CSS selectors and IDs (`#b1`...`#b7`, `.bannar`, `.fuego`, etc.)
- Inline animations using `.animate()` loops
- Hard-coded element references throughout

**Integration Approach**: Rather than rewriting ~200 lines of jQuery animation logic and risking breakage, this page is embedded as a sandboxed iframe in the parent application.

## How It's Integrated
1. **Sandboxed iframe** in parent page (`index.html`):
   - `sandbox="allow-scripts allow-same-origin"` for security
   - `loading="lazy"` for performance
   - `referrerpolicy="no-referrer"` for privacy

2. **PostMessage bridge** (`effect.js`):
   - Parent → Child: `{type: 'hb:pause'}` to stop audio on close
   - Child → Parent: `{type: 'hb:wish'}` milestone event when "Happy Birthday" is revealed

3. **Resource isolation**:
   - All assets (images, CSS, JS, audio) kept in this folder
   - No global scope pollution in parent app
   - Bootstrap/jQuery only loaded in iframe context

## Modifications Made
1. **Fixed mixed-content fonts**: Changed `http://fonts.googleapis.com` → `https://` to avoid HTTPS blocking
2. **Added postMessage listeners** at top of `effect.js` for parent communication
3. **Added milestone event** in `$('#wish_message').click()` to notify parent

## Original Files (Unchanged)
- All `.png`, `.jpg` image assets
- `hbd.mp3` audio file
- `stylesheet.css`, `loading.css`, `cake.less`
- Core structure of `index.html`
- Core animation logic in `effect.js`

## Maintenance
- **Do not** attempt to merge this CSS/JS into parent app globals
- **Do** keep this folder self-contained
- **Do** update assets here if replacing images/audio
- **Do** test in iframe context after changes

## License Compliance
Per WTFPL, we can do anything with this code. Original license preserved in repository files.
