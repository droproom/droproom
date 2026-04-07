'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'gold' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  gold: 'bg-gold text-black hover:bg-gold-dim font-semibold',
  outline: 'border border-border text-foreground hover:bg-surface-hover',
  ghost: 'text-muted hover:text-foreground hover:bg-surface-hover',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gold', loading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm tracking-wide uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant]} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
