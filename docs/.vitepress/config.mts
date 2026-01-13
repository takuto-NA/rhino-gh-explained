import { defineConfig } from 'vitepress'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'

export default defineConfig({
  lang: 'ja-JP',
  title: "Rhino & Grasshopper 解説",
  description: "RhinoとGrasshopperの使い方を解説するサイトです。",

  // Windows 環境で build 時にページチャンク解決に失敗するケースがあるため、
  // realpath によるパス変換を避けて、Rollup の facadeModuleId と一致させる
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },
  
  // GitHub Pages用のベースパス設定
  // リポジトリ名に合わせて変更が必要な場合があります
  base: '/rhino-gh-explained/',

  themeConfig: {
    nav,
    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/takuto_takahashi/rhino-gh-explained' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Takuto Takahashi'
    }
  }
})
