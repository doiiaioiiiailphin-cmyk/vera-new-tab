<p align="center">
  <a href="README_zh.md">中文</a> &nbsp;|&nbsp;
  <a href="README.md">English</a> &nbsp;|&nbsp;
  <b>日本語</b>
</p>

<p align="center">
  <img src="icons/icon128.png" width="96" alt="Vera">
</p>

<h1 align="center">Vera</h1>

<p align="center">Liquid Glass New Tab — アイスクリスタルガラスモーフィズム Chrome/Edge 拡張機能</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue" alt="Manifest V3">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

---

## プレビュー

<p align="center">
  <a href="screenshots/dark.png" target="_blank">
    <img src="screenshots/dark-thumb.png" alt="Dark Mode" width="420">
  </a>
  <a href="screenshots/light.png" target="_blank">
    <img src="screenshots/light-thumb.png" alt="Light Mode" width="420">
  </a>
</p>

<p align="center" style="color: #8a9db5; font-size: 13px; margin-top: 4px;">
  ダークモード &nbsp;·&nbsp; ライトモード &nbsp;·&nbsp; クリックで拡大
</p>

---

## 機能

- **時計と日付** — 大きな液晶風時計、言語に応じた日付フォーマット
- **マルチ検索エンジン** — Google / Bing / DuckDuckGo / Baidu / GitHub
- **クイックリンク** — ドラッグで並べ替え、Favicon 自動取得、カスタム SVG アイコン
- **天気ウィジェット** — wttr.in + Open-Meteo デュアル API、位置情報権限監視
- **ToDo リスト** — ローカルストレージ、クリックで完了/削除
- **今日の名言** — 中国古典 / 英語の名言 / 日本のことわざ、言語に連動
- **3ヶ国語対応** — 中文 / English / 日本語、初回起動時にシステム言語を自動検出
- **ダーク/ライト/システム** — ちらつきなしで即時適用
- **カスタマイズパネル**
  - 透明度 / ぼかし強度 / 角丸サイズ
  - アクセントカラー + 5種の背景プリセット + カスタム背景画像
  - 動的背景の切り替え
  - 各ウィジェットの表示/非表示

## インストール

1. リポジトリをダウンロードまたはクローン
   ```bash
   git clone https://github.com/doiiaioiiiailphin-cmyk/vera-new-tab.git
   ```
2. Chrome/Edge で `chrome://extensions/` を開く
3. 右上の **"デベロッパーモード"** を有効化
4. **"パッケージ化されていない拡張機能を読み込む"** をクリック
5. プロジェクトフォルダを選択

## プロジェクト構造

```
vera-new-tab/
├── manifest.json        # 拡張機能マニフェスト (Manifest V3)
├── index.html           # 新規タブページ
├── i18n.js              # 多言語翻訳
├── script.js            # コアロジック
├── style.css            # UI スタイル
├── preload.js           # ちらつき防止テーマ初期化
├── icons/               # 拡張機能アイコン
├── screenshots/         # プレビュー画像
└── .gitignore
```

## 技術スタック

純粋なフロントエンド — HTML + CSS + JavaScript、依存ライブラリなし。

- CSS `backdrop-filter` ガラスモーフィズム
- CSS カスタムプロパティによる完全テーマ化
- SVG スプライトアイコンシステム（34+ ベクターシンボル）
- `localStorage` による全設定の永続化
- wttr.in + Open-Meteo 天気 API
- Permissions API による地理位置情報監視
- Google Fonts（Sora + Lexend + Noto Sans SC/JP）

## ライセンス

MIT © Vera
