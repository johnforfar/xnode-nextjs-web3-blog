// /nextjs-app/app/api/content/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getContent, saveContent } from '@/lib/data-service'
import type { PageContent } from '@/types/content'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const content = await getContent()
    return NextResponse.json(content)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const address = headersList.get('x-wallet-address')
    
    if (!address || address.toLowerCase() !== process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const content = await request.json() as PageContent
    await saveContent(content)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}