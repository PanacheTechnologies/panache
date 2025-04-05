import { Footer } from './footer'
import { Header, type HeaderProps } from './header/header'
import type { PropsWithChildren } from 'react'

export type MarketingLayoutProps = {} & PropsWithChildren & HeaderProps

export function MarketingLayout({ children, ...headerProps }: MarketingLayoutProps) {
  return (
    <div className="flex flex-col justify-between min-h-screen space-y-4 w-full max-w-5xl mx-auto p-4">
      <Header {...headerProps} />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
