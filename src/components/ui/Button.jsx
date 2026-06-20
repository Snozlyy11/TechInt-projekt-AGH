import { forwardRef } from 'react'

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  secondary: 'bg-brand-100 hover:bg-brand-200 text-brand-700',
  outline:   'border-2 border-brand-600 text-brand-600 hover:bg-brand-50',
  ghost:     'hover:bg-brand-100 text-brand-700',
  danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
}
const sizes = {
  sm:   'px-3 py-1.5 text-sm gap-1.5',
  md:   'px-4 py-2 text-sm gap-2',
  lg:   'px-6 py-3 text-base gap-2',
  icon: 'p-2',
}

const Button = forwardRef(function Button({
  variant = 'primary', size = 'md', className = '',
  disabled, loading, children, ...props
}, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        'font-sans',
        variants[variant], sizes[size], className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
      )}
      {children}
    </button>
  )
})

export default Button
