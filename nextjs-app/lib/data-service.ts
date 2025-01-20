// ./nextjs-app/lib/data-service.ts
import type { PageContent } from '@/types/content'
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')
const CONTENT_FILE = 'content.json'

export async function getContent(): Promise<PageContent> {
  try {
    const filePath = path.join(DATA_DIR, CONTENT_FILE)
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {
      pages: {
        home: {
          title: "Home",
          sections: [{
            id: "welcome",
            type: "hero",
            content: {
              type: "hero",
              title: "Welcome to Web3 CMS",
              description: "Start editing this page by connecting your wallet"
            }
          }]
        }
      },
      navigation: {
        links: [
          { name: "Home", path: "/" }
        ]
      }
    }
  }
}

export async function saveContent(content: PageContent): Promise<void> {
  const filePath = path.join(DATA_DIR, CONTENT_FILE)
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(content, null, 2))
}