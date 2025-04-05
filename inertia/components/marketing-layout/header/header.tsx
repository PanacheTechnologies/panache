import { Link } from '@inertiajs/react'
import { NavLink } from './nav-link'
import clsx from 'clsx'

export interface HeaderProps {
  showBottomBorder?: boolean
}

export function Header({ showBottomBorder = false }: HeaderProps) {
  return (
    <div
      className={clsx(
        'w-full flex items-start sm:items-center justify-between gap-2 pb-4',
        showBottomBorder && 'border-b border-neutral-200'
      )}
    >
      <div className="w-full flex items-center gap-6">
        <h1 className="text-2xl italic font-serif">Panache</h1>
      </div>
      <nav className="w-full flex justify-center gap-4">
        <NavLink href="/">Product</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
      </nav>
      <div className="w-full flex flex-wrap justify-end items-center gap-4">
        <Link className="btn btn-secondary" href="/auth/sign-in">
          Sign in
        </Link>
        <Link className="btn btn-primary" href="/auth/sign-up">
          Start for free →
        </Link>
      </div>
    </div>
  )
}
