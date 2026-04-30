import { ReactNode } from 'react'
import Phase1Header from '../../components/Phase1Header'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Phase1Header />
      <main>{children}</main>
    </div>
  )
}
