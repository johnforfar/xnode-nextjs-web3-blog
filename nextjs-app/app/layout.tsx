import { WagmiProviderWrapper } from '@/providers/wagmi-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProviderWrapper>
          {children}
        </WagmiProviderWrapper>
      </body>
    </html>
  )
}