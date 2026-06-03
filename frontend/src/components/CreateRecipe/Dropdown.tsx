import { useEffect, useRef, useState } from 'react'

type DropdownProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  className?: string
}

/** Text input with a dropdown of presets; the user can also type a free value. */
export default function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className={`combo ${className}`.trim()} ref={ref}>
      <input
        type="text"
        className="combo__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
      />
      <button
        type="button"
        className="combo__toggle"
        aria-label="Show options"
        tabIndex={-1}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <ul className="combo__list">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`combo__option${opt === value ? ' combo__option--active' : ''}`}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
