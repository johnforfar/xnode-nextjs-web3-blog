// ./nextjs-app/app/page.tsx

'use client'
import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { WalletModal } from '@/components/WalletModal'
import { Button } from '@/components/ui/button'
import type { PageContent } from '@/lib/data-service'

export default function IndexPage() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [content, setContent] = useState<PageContent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const isAdmin = address?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase()

  // Fetch content on load
  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(console.error)
  }, [])

  // Save content
  const handleSave = async (updatedContent: PageContent) => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address || ''
        },
        body: JSON.stringify(updatedContent)
      })

      if (!response.ok) throw new Error('Failed to save')
      
      const result = await response.json()
      if (result.success) {
        setContent(updatedContent)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  // Simple content editor component
  const ContentEditor = ({ content }: { content: PageContent }) => {
    const [editedContent, setEditedContent] = useState(content)

    return (
      <div className="space-y-4 p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-bold">Content Editor</h2>
        {Object.entries(editedContent.pages).map(([pageKey, page]) => (
          <div key={pageKey} className="space-y-2">
            <div className="font-medium">{pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} Page</div>
            <input
              type="text"
              value={page.title}
              onChange={(e) => setEditedContent({
                ...editedContent,
                pages: {
                  ...editedContent.pages,
                  [pageKey]: { ...page, title: e.target.value }
                }
              })}
              className="w-full border p-2 rounded"
              placeholder="Page Title"
            />
            <textarea
              value={page.content}
              onChange={(e) => setEditedContent({
                ...editedContent,
                pages: {
                  ...editedContent.pages,
                  [pageKey]: { ...page, content: e.target.value }
                }
              })}
              className="w-full border p-2 rounded h-32"
              placeholder="Page Content"
            />
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <Button onClick={() => handleSave(editedContent)}>
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Content display component
  const ContentDisplay = ({ content }: { content: PageContent }) => (
    <div className="space-y-6">
      {Object.entries(content.pages).map(([pageKey, page]) => (
        <div key={pageKey} className="border p-4 rounded bg-white shadow">
          <h2 className="text-xl font-bold mb-2">{page.title}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{page.content}</p>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">Web3 Portfolio CMS</h1>
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button onClick={() => setIsWalletModalOpen(true)}>
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                {isAdmin && !isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Content
                  </Button>
                )}
                <Button
                  onClick={() => disconnect()}
                  variant="destructive"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>

        <WalletModal 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)} 
        />

        {content && (
          isEditing && isAdmin 
            ? <ContentEditor content={content} />
            : <ContentDisplay content={content} />
        )}
      </div>
    </div>
  )
}