const variants = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  brand:   'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
  green:   'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  red:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  amber:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
}

export default function Badge({ variant = 'default', className = '', children }) {
  return (
    <span className={['inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variants[variant], className].join(' ')}>
      {children}
    </span>
  )
}
