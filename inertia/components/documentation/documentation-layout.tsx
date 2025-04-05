import type { PropsWithChildren } from 'react'
import { MarketingLayout } from '../marketing-layout/marketing-layout'

export function DocumentationLayout({ children }: PropsWithChildren) {
  return <MarketingLayout showBottomBorder>{children}</MarketingLayout>
}
