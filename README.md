# Douyin Video Link Extractor — Chrome Extension

Extract all video links from any Douyin user profile page and save them to a `.txt` file.

## Setup

1. Add 3 icon files to the `icons/` folder:
   - `icon16.png`, `icon48.png`, `icon128.png`
   - Any simple PNG works — just rename them.

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked** → select the `douyin-downloader` folder

## Usage

1. Go to a Douyin user profile: `https://www.douyin.com/user/XXXXXXX`
2. Click the extension icon in the toolbar
3. Click **▶ Start Extracting**
4. Wait for extraction to complete (progress shown in real-time)
5. Click **⬇ Download Links (.txt)** to save all URLs

## Notes

- The extension uses Douyin's own API (same as the website), so you must be **logged in** to Douyin for it to work.
- A 1-second delay between requests is added to avoid rate limiting.
- If the page returns errors 5 times in a row, extraction stops automatically.
- Video URLs are `https://` links to the raw `.mp4` files.
