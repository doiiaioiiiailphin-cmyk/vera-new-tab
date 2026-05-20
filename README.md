<p align="center">
  <a href="README_zh.md">中文</a> &nbsp;|&nbsp;
  <b>English</b> &nbsp;|&nbsp;
  <a href="README_ja.md">日本語</a>
</p>

<p align="center">
  <img src="icons/icon128.png" width="96" alt="Vera">
</p>

<h1 align="center">Vera</h1>

<p align="center">Liquid Glass New Tab — Ice crystal glassmorphism Chrome/Edge extension</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## Preview

<p align="center">
  <a href="screenshots/dark.png" target="_blank">
    <img src="screenshots/dark-thumb.png" alt="Dark Mode" width="420">
  </a>
  <a href="screenshots/light.png" target="_blank">
    <img src="screenshots/light-thumb.png" alt="Light Mode" width="420">
  </a>
</p>

<p align="center" style="color: #8a9db5; font-size: 13px; margin-top: 4px;">
  Dark Mode &nbsp;·&nbsp; Light Mode &nbsp;·&nbsp; Click to view full size
</p>

---

## Features

- **Clock & Date** — Large liquid-crystal style clock, date formatted by locale
- **Multi-engine Search** — Google / Bing / DuckDuckGo / Baidu / GitHub, auto-fetched engine logos
- **Quick Links** — Drag-to-sort, auto-fetch website favicons, custom SVG icons
- **Weather Widget** — wttr.in + Open-Meteo APIs, Permissions API for location, full weather code coverage
- **To-Do List** — Local storage, click to complete/delete
- **Daily Quotes** — Classical Chinese poetry / English classics / Japanese proverbs, switch with language
- **Three Languages** — 中文 / English / 日本語, auto-detect system language on first launch
- **Dark / Light / System** — Instant theme apply with no flicker, dual CSS variable sets
- **Customization Panel**
  - Glass opacity / blur strength / border radius
  - Accent color + 5 background presets + custom background image
  - Dynamic blob background toggle
  - Individual widget visibility toggles

## Install

1. Download or clone this repo
   ```bash
   git clone https://github.com/doiiaioiiiailphin-cmyk/vera-new-tab.git
   ```
2. Open Chrome/Edge, go to `chrome://extensions/`
3. Enable **"Developer mode"** (top right)
4. Click **"Load unpacked"**
5. Select the project folder

## Project Structure

```
vera-new-tab/
├── manifest.json        # Extension manifest (Manifest V3)
├── index.html           # New tab page
├── i18n.js              # All UI translations
├── script.js            # Core logic (search, weather, todos, settings)
├── style.css            # UI styles (glassmorphism, theme variables, animations)
├── preload.js           # Anti-flicker theme init
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── screenshots/         # Preview screenshots
└── .gitignore
```

## Tech Stack

Pure frontend — HTML + CSS + JavaScript, zero dependencies.

- CSS `backdrop-filter` glassmorphism
- CSS custom properties for full theming
- SVG Sprite icon system (34+ vector symbols)
- `localStorage` for all settings persistence
- wttr.in + Open-Meteo weather APIs
- Permissions API for geolocation
- Google Fonts (Sora + Lexend + Noto Sans SC/JP)

## License

MIT © Vera
