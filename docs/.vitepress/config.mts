import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'
import mathjax3 from 'markdown-it-mathjax3'

export default withMermaid(defineConfig({
  lang: 'ja-JP',
  title: "Rhino & Grasshopper 解説",
  description: "RhinoとGrasshopperの使い方を解説するサイトです.",

  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },

  head: [
    ['script', { 
      type: 'text/javascript', 
      id: 'MathJax-script', 
      async: '', 
      src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js' 
    }]
  ],

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
  // MermaidはCSS変数を直接サポートしていないため、デフォルトテーマを使用
  mermaid: {
    theme: 'default',
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
