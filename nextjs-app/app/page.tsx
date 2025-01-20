// ./nextjs-app/app/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { WalletModal } from '@/components/WalletModal'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Section, PageContent } from '@/types/content'
import { cn } from '@/lib/utils'

export default function IndexPage() {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [content, setContent] = useState<PageContent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetch('/api/content')
        .then(res => res.json())
        .then(data => setContent(data))
        .catch(console.error)
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  const isAdmin = address?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase()
  console.log({
    address,
    adminAddress: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
    isAdmin
  })

  const handleSave = async () => {
    if (!content || !address) return

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': address
        },
        body: JSON.stringify(content)
      })

      if (!response.ok) throw new Error('Failed to save')
      
      const result = await response.json()
      if (result.success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save content:', error)
    }
  }

  const handleContentUpdate = (sectionId: string, type: Section['type'], updates: Partial<Section['content']>) => {
    if (!content) return;
    
    setContent({
      ...content,
      pages: {
        ...content.pages,
        home: {
          ...content.pages.home,
          sections: content.pages.home.sections.map((section: Section) => 
            section.id === sectionId 
              ? { ...section, content: { ...section.content, ...updates } } as Section
              : section
          )
        }
      }
    });
  };

  const renderSection = (section: Section) => {
    switch (section.type) {
      case 'hero':
        if (section.type !== 'hero') return null;
        return (
          <div className="text-center py-12">
            <h1 
              contentEditable={isEditing}
              className="text-4xl font-bold mb-4"
              suppressContentEditableWarning
              onBlur={(e) => {
                handleContentUpdate(section.id, section.type, { 
                  title: e.currentTarget.textContent || '' 
                });
              }}
            >
              {section.content.title}
            </h1>
            <p 
              contentEditable={isEditing}
              className="mb-4"
              suppressContentEditableWarning
              onBlur={(e) => {
                handleContentUpdate(section.id, section.type, { 
                  description: e.currentTarget.textContent || '' 
                });
              }}
            >
              {section.content.description}
            </p>
          </div>
        )

      case 'card':
        if (section.type !== 'card') return null;
        return (
          <Card>
            <CardHeader>
              <CardTitle 
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => {
                  handleContentUpdate(section.id, section.type, { 
                    title: e.currentTarget.textContent || '' 
                  });
                }}
              >
                {section.content.title}
              </CardTitle>
            </CardHeader>
            <CardContent 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => {
                handleContentUpdate(section.id, section.type, { 
                  content: e.currentTarget.textContent || '' 
                });
              }}
            >
              {section.content.content}
            </CardContent>
          </Card>
        )

      case 'alert':
        if (section.type !== 'alert') return null;
        return (
          <Alert>
            <AlertTitle 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLHeadingElement>) => {
                handleContentUpdate(section.id, section.type, { 
                  title: e.currentTarget.textContent || '' 
                });
              }}
            >
              {section.content.title}
            </AlertTitle>
            <AlertDescription 
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e: React.FocusEvent<HTMLParagraphElement>) => {
                handleContentUpdate(section.id, section.type, { 
                  description: e.currentTarget.textContent || '' 
                });
              }}
            >
              {section.content.description}
            </AlertDescription>
          </Alert>
        )

      case 'tabs':
        if (section.type !== 'tabs') return null;
        return (
          <Tabs defaultValue="0" className="w-full">
            <TabsList>
              {section.content.tabs.map((tab, index) => (
                <TabsTrigger key={index} value={index.toString()}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {section.content.tabs.map((tab, index) => (
              <TabsContent key={index} value={index.toString()}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        )

      default:
        return null; // Handle unknown section types
    }
  }

  const addSection = (type: keyof typeof COMPONENT_TYPES) => {
    if (!content) return

    const newSection = {
      id: crypto.randomUUID(),
      ...COMPONENT_TYPES[type].template
    }

    setContent({
      ...content,
      pages: {
        ...content.pages,
        home: {
          ...content.pages.home,
          sections: [...content.pages.home.sections, newSection]
        }
      }
    })
    setIsSelectorOpen(false)
  }

  const COMPONENT_TYPES = {
    hero: {
      label: 'Hero Section',
      template: {
        type: 'hero' as const,
        content: {
          type: 'hero' as const,
          title: 'Welcome to Our Site',
          description: 'This is a hero section'
        }
      }
    },
    card: {
      label: 'Card',
      template: {
        type: 'card' as const,
        content: {
          type: 'card' as const,
          title: 'Card Title',
          description: 'Card description here',
          content: 'Card content goes here'
        }
      }
    },
    alert: {
      label: 'Alert',
      template: {
        type: 'alert' as const,
        content: {
          type: 'alert' as const,
          title: 'Alert Title',
          description: 'Alert description here',
          variant: 'default' as const
        }
      }
    },
    tabs: {
      label: 'Tabs Section',
      template: {
        type: 'tabs' as const,
        content: {
          type: 'tabs' as const,
          tabs: [
            { title: 'Tab 1', content: 'Tab 1 content' },
            { title: 'Tab 2', content: 'Tab 2 content' }
          ]
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded shadow">
          <h1 className="text-2xl font-bold">Web3 CMS</h1>
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
                {isAdmin && isEditing && (
                  <Button onClick={handleSave}>
                    Save Changes
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
          <div className="container mx-auto p-4">
            {content.pages.home.sections.map((section: Section) => (
              <div 
                key={section.id} 
                className={cn(
                  "relative mb-8 group rounded-lg border p-4 transition-all duration-200",
                  isEditing 
                    ? "hover:border-blue-400 hover:shadow-md border-gray-200" 
                    : "border-transparent hover:border-gray-200"
                )}
              >
                {renderSection(section)}
                {isEditing && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white shadow-sm hover:bg-red-50"
                      onClick={() => {
                        if (!content) return
                        setContent({
                          ...content,
                          pages: {
                            ...content.pages,
                            home: {
                              ...content.pages.home,
                              sections: content.pages.home.sections.filter((s: Section) => s.id !== section.id)
                            }
                          }
                        })
                      }}
                    >
                      <span className="text-red-600">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {isEditing && (
              <Button
                onClick={() => setIsSelectorOpen(true)}
                className="w-full max-w-xs mx-auto block"
                variant="outline"
                size="sm"
              >
                Add Section
              </Button>
            )}
          </div>
        )}

        <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Component Type</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {Object.entries(COMPONENT_TYPES).map(([type, info]) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => addSection(type as keyof typeof COMPONENT_TYPES)}
                  className="justify-start"
                >
                  {info.label}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}