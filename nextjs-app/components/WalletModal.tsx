'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { injected } from '@wagmi/connectors'
import { useConnect } from 'wagmi'

const WALLET_OPTIONS = [
  {
    name: 'MetaMask',
    connector: () => injected({ target: 'metaMask' })
  },
  {
    name: 'Brave Wallet',
    connector: () => injected({ target: 'braveWallet' })
  },
  {
    name: 'Coinbase Wallet',
    connector: () => injected({ target: 'coinbaseWallet' })
  },
  {
    name: 'Phantom',
    connector: () => injected({ target: 'phantom' })
  },
  {
    name: 'Trust Wallet',
    connector: () => injected({ target: 'trust' })
  },
  {
    name: 'Rabby',
    connector: () => injected({ target: 'rabby' })
  },
//  {
//    name: 'OKX Wallet',
//    connector: () => injected({ target: 'okxwallet' })
//  },
  {
    name: 'Enkrypt',
    connector: () => injected({ target: 'enkrypt' })
  },
  {
    name: 'Frame',
    connector: () => injected({ target: 'frame' })
  },
  {
    name: 'Dawn',
    connector: () => injected({ target: 'dawn' })
  },
//  {
//    name: 'Taho',
//    connector: () => injected({ target: 'taho' })
//  },
  {
    name: 'TokenPocket',
    connector: () => injected({ target: 'tokenPocket' })
  },
//  {
//    name: 'Bitget',
//    connector: () => injected({ target: 'bitget' })
//  },
  {
    name: 'BitKeep',
    connector: () => injected({ target: 'bitKeep' })
  },
  {
    name: 'Zerion',
    connector: () => injected({ target: 'zerion' })
  },
  {
    name: 'Rainbow',
    connector: () => injected({ target: 'rainbow' })
  },
  {
    name: 'ImToken',
    connector: () => injected({ target: 'imToken' })
  },
  {
    name: 'Block Wallet',
    connector: () => injected({ target: 'blockWallet' })
  },
  {
    name: 'Math Wallet',
    connector: () => injected({ target: 'mathWallet' })
  },
//  {
//    name: 'GameStop',
//    connector: () => injected({ target: 'gamestore' })
//  },
  {
    name: 'Exodus',
    connector: () => injected({ target: 'exodus' })
  },
  {
    name: 'Frontier',
    connector: () => injected({ target: 'frontier' })
  },
  {
    name: 'Tally Ho',
    connector: () => injected({ target: 'tally' })
  }
]

interface WalletModalProps {
    isOpen: boolean
    onClose: () => void
  }
  
  export function WalletModal({ isOpen, onClose }: WalletModalProps) {
    const { connect } = useConnect()
  
    const handleConnect = async (connector: () => ReturnType<typeof injected>) => {
      try {
        const result = await connect({ connector: connector() })
        console.log('Connection result:', result)
        onClose()
      } catch (error) {
        console.error('Connection error details:', error)
      }
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {WALLET_OPTIONS.map((wallet) => (
              <Button
                key={wallet.name}
                variant="outline"
                className="w-full p-4 h-auto"
                onClick={() => handleConnect(wallet.connector)}
              >
                {wallet.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }