import { useEffect, useRef, useState } from 'react'

type DropdownProps = {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  className?: string
}

function getFixedStyle(el: HTMLElement): React.CSSProperties {
  const rect = el.getBoundingClientRect()
  return {
    position: 'fixed',
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
    zIndex: 9999,
  }
}

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [listStyle, setListStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const openDropdown = () => {
    if (ref.current) setListStyle(getFixedStyle(ref.current))
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (e: MouseEvent) => {
      // keep open if clicking inside the combo input or the list
      if (ref.current?.contains(e.target as Node)) return
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }

    const handleScroll = (e: Event) => {
      // ignore scrolls that happen inside the dropdown list itself
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <div className={`combo ${className}`.trim()} ref={ref}>
      <input
        type="text"
        className="combo__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={openDropdown}
      />
      <button
        type="button"
        className="combo__toggle"
        aria-label="Show options"
        tabIndex={-1}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!open) openDropdown()
          else setOpen(false)
        }}
      />
      {open && (
        <ul className="combo__list" style={listStyle} ref={listRef}>
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`combo__option${opt === value ? ' combo__option--active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
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
