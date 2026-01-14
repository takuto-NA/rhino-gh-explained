import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'

export default withMermaid(defineConfig({
  lang: 'ja-JP',
  title: "Rhino & Grasshopper 解説",
  description: "RhinoとGrasshopperの使い方を解説するサイトです.",

  markdown: {
    math: true
  },

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

  // Mermaid: ```mermaid フェンスをSVGとしてレンダリング
  // できるだけVitePressのCSS変数を使い、ライト/ダークで破綻しにくくする
  mermaid: {
    theme: 'base',
    themeVariables: {
      fontFamily: 'var(--vp-font-family-base)',
      background: 'transparent',
      primaryColor: 'var(--vp-c-bg-soft)',
      primaryTextColor: 'var(--vp-c-text-1)',
      primaryBorderColor: 'var(--vp-c-divider)',
      lineColor: 'var(--vp-c-text-2)',
      secondaryColor: 'var(--vp-c-bg-alt)',
      tertiaryColor: 'var(--vp-c-bg)'
    },
    flowchart: {
      curve: 'linear'
    }
  },

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
}))
