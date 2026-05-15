<p align="center">
  <img src="icons/icon128.png" width="96" alt="Vera">
</p>

<h1 align="center">Vera</h1>

<p align="center">Liquid Glass New Tab — 冰晶液态玻璃风格 Chrome 新标签页</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v2-blue" alt="Manifest V2">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## 预览

深色/浅色双模式，毛玻璃 + 动态流体背景，圆角现代设计。

## 功能

- **时钟与日期** — 大号液晶感时钟，日期随语言格式化
- **多引擎搜索** — Google / Bing / DuckDuckGo / 百度 / GitHub，引擎 Logo 自动获取
- **快捷链接** — 拖拽排序，自动拉取网站 favicon，支持自定义 SVG 图标
- **天气组件** — Open-Meteo 免费 API，Permissions API 监听权限变化，图标覆盖全部 WMO 天气代码
- **待办事项** — 本地存储，点击完成/删除
- **每日名言** — 中文古诗词 / 英文经典 / 日本谚语，随语言切换
- **三语言界面** — 中文 / English / 日本語，首次自动跟随系统语言
- **深色/浅色/跟随系统** — 启动即生效无闪烁，所有 CSS 变量二套配色
- **高自定义设置面板**
  - 玻璃透明度 / 模糊强度 / 圆角大小
  - 强调色 + 5 套背景预设 + 自定义背景图
  - 动态背景开关
  - 所有组件独立显隐

## 安装

1. 下载或克隆本仓库
   ```bash
   git clone https://github.com/doiiaioiiiailphin-cmyk/vera-new-tab.git
   ```
2. 打开 Chrome，地址栏输入 `chrome://extensions/`
3. 开启右上角 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择项目文件夹，完成

## 项目结构

```
vera-new-tab/
├── manifest.json        # Chrome 扩展清单
├── index.html           # 新标签页（全功能单文件）
├── icons/               # 扩展图标
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── .gitignore
```

## 技术栈

纯前端 — HTML + CSS + JavaScript，零依赖，单文件架构。

- CSS `backdrop-filter` 毛玻璃效果
- CSS 自定义属性全主题化
- SVG Sprite 图标系统（34 个矢量符号）
- `localStorage` 持久化所有设置
- Open-Meteo 免费天气 API
- Permissions API 监听地理位置授权
- Google Fonts（Sora + Lexend + Noto Sans SC/JP）

## License

MIT © Vera
