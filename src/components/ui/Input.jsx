import { forwardRef } from 'react'

const Input = forwardRef(function Input({
  label, error, hint, className = '', ...props
}, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={[
          'w-full px-3 py-2.5 rounded-xl text-sm font-sans',
          'border focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent',
          'transition-all duration-150',
          'placeholder:opacity-40',
          error ? 'border-red-400 focus:ring-red-400' : '',
          className,
        ].join(' ')}
        style={{ background: 'var(--bg-muted)', borderColor: error ? undefined : 'var(--border)', color: 'var(--fg)' }}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--fg)', opacity: 0.5 }}>{hint}</p>}
    </div>
  )
})

export default Input
