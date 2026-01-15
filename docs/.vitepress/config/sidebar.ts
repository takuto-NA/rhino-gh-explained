import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultTheme } from 'vitepress'

type SidebarItem = DefaultTheme.SidebarItem
type SidebarGroup = DefaultTheme.SidebarItem

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// This file lives at: docs/.vitepress/config/sidebar.ts
// docsDir: docs/
const docsDir = path.resolve(__dirname, '..', '..')

function readTitleAndOrder(filePath: string): { title?: string; order?: number } {
  const content = fs.readFileSync(filePath, 'utf-8')

  // optional frontmatter: ---
  // order: 10
  // ---
  let order: number | undefined
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3)
    if (end !== -1) {
      const fm = content.slice(3, end)
      const m = fm.match(/^\s*order:\s*(\d+)\s*$/m)
      if (m) order = Number(m[1])
    }
  }

  // first markdown H1
  const titleMatch = content.match(/^#\s+(.+)\s*$/m)
  const title = titleMatch?.[1]?.trim()

  return { title, order }
}

function toTitleFromFileName(stem: string): string {
  // Keep it simple: turn "getting-started" -> "Getting started"
  const s = stem.replace(/[-_]+/g, ' ').trim()
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : stem
}

function createSectionGroup(section: 'rhino' | 'grasshopper', label: string): SidebarItem[] {
  const dir = path.join(docsDir, section)
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []

  const pages = files
    .filter((f) => f.endsWith('.md'))
    .filter((f) => f.toLowerCase() !== 'index.md')
    .map((file) => {
      const stem = file.replace(/\.md$/i, '')
      const filePath = path.join(dir, file)
      const { title, order } = readTitleAndOrder(filePath)
      return {
        file,
        stem,
        order,
        title: title || toTitleFromFileName(stem),
        link: `/${section}/${stem}`
      }
    })
    .sort((a, b) => {
      const ao = a.order ?? Number.POSITIVE_INFINITY
      const bo = b.order ?? Number.POSITIVE_INFINITY
      if (ao !== bo) return ao - bo
      return a.file.localeCompare(b.file)
    })

  const items: DefaultTheme.SidebarItem[] = [
    { text: '概要', link: `/${section}/` },
    ...pages.map((p) => ({ text: p.title, link: p.link }))
  ]

  const group: SidebarGroup = {
    text: label,
    items
  }

  return [group]
}

export const sidebar: DefaultTheme.Sidebar = {
  '/rhino/': createSectionGroup('rhino', 'Rhino'),
  '/grasshopper/': createSectionGroup('grasshopper', 'Grasshopper'),
  '/': [
    {
      text: 'ガイド',
      items: [
        { text: '前提・用語（最初に揃えること）', link: '/prerequisites-and-glossary' },
        { text: '執筆方針（文章のルール）', link: '/writing-guidelines' }
      ]
    },
    {
      text: '参考資料',
      items: [
        { text: '参考資料・公式ドキュメント', link: '/references' }
      ]
    }
  ]
}

