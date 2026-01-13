import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja-JP',
  title: "Rhino & Grasshopper 解説",
  description: "RhinoとGrasshopperの使い方を解説するサイトです。",
  
  // GitHub Pages用のベースパス設定
  // リポジトリ名に合わせて変更が必要な場合があります
  base: '/rhino-gh-explained/',

  themeConfig: {
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'Rhino', link: '/rhino/' },
      { text: 'Grasshopper', link: '/grasshopper/' }
    ],

    sidebar: [
      {
        text: 'Rhino',
        items: [
          { text: 'はじめに', link: '/rhino/' },
        ]
      },
      {
        text: 'Grasshopper',
        items: [
          { text: 'はじめに', link: '/grasshopper/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/takuto_takahashi/rhino-gh-explained' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Takuto Takahashi'
    }
  }
})
