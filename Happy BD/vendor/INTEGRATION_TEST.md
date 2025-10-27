# Integration Test Checklist

## Testing the Classic Birthday Feature

### Pre-Test Setup
1. Open `index.html` in a local server (not `file://` to avoid CORS)
2. Ensure browser has network access for CDN resources in iframe

### Test Cases

#### ✅ Opening the Overlay
- [ ] Click "经典生日" in top navigation
- [ ] Overlay should appear with dark background
- [ ] Classic birthday page loads in centered iframe
- [ ] Close button (✕ 关闭) appears in top-right
- [ ] Main starfield background pauses (check console for logs)

#### ✅ Classic Page Functionality
Inside the iframe:
- [ ] Loading spinner appears briefly
- [ ] "Turn On Lights" button works → bulbs glow
- [ ] "Play Music" button works → `hbd.mp3` plays (if audio file exists)
- [ ] "Let's Decorate" button works → banner drops
- [ ] "Fly With Balloons" button works → balloons float with H-B-D letters
- [ ] "Most Delicious Cake Ever" button works → cake appears
- [ ] "Light Candle" button works → candle flames appear
- [ ] "Happy Birthday" button works → balloons arrange to spell "HBD XOLA"
- [ ] "A message for you" button works → sequential message reveal

#### ✅ PostMessage Bridge
- [ ] Open browser console
- [ ] Click through to "Happy Birthday" step
- [ ] Console should show: `[Main] 🎉 Milestone event received: Birthday wish shown!`
- [ ] Verify `[HB Classic]` logs appear from iframe

#### ✅ Closing the Overlay
- [ ] Click "✕ 关闭" button → overlay closes
- [ ] Press `Esc` key → overlay closes
- [ ] Audio stops when overlay closes (check `[HB Classic] Audio paused by parent` in console)
- [ ] Main starfield background resumes

#### ✅ Security & Isolation
- [ ] Open DevTools → Application → Frames
- [ ] Verify iframe has `sandbox="allow-scripts allow-same-origin"`
- [ ] Check Network tab: all resources load from same origin or approved CDNs
- [ ] No console errors about CSP violations
- [ ] No mixed-content warnings (all fonts/scripts use HTTPS)

#### ✅ Performance
- [ ] Page load time acceptable (< 3s on decent connection)
- [ ] No animation jank in main page or iframe
- [ ] Memory usage stable (check DevTools Performance Monitor)
- [ ] Starfield pause/resume works without flicker

### Known Limitations
- **Audio**: `hbd.mp3` path must be correct in `vendor/hb-classic/`
- **CDN dependencies**: Requires internet for Bootstrap/jQuery/Fonts
- **Mobile**: Some jQuery animations may need touch event handling
- **Name**: Currently says "HBD XOLA" (original repo name)—edit balloon HTML to customize

### Troubleshooting

**Problem**: Overlay doesn't open
- Check console for errors
- Verify `#navClassic` button exists
- Verify `#hbOverlay` element exists

**Problem**: Iframe blank or CSP error
- Check CSP header allows `frame-src 'self'`
- Verify path: `./vendor/hb-classic/index.html` is correct
- Check Network tab for failed requests

**Problem**: Buttons don't work in iframe
- Check console for jQuery errors
- Verify CDN resources loaded (Bootstrap, jQuery)
- Check `effect.js` loaded correctly

**Problem**: Audio doesn't stop on close
- Check console for postMessage logs
- Verify `.song` audio element exists
- Verify `hb:pause` message is sent

### Success Criteria
All checkboxes ticked = Feature ready for production! 🎉
