import { useEffect, useRef, useState } from 'react'

type TagPickerProps = {
  availableTags: string[]
  selectedTags: string[]
  onToggle: (tag: string) => void
  onRemove: (tag: string) => void
  onCreate: (tag: string) => void
}

export default function TagPicker({
  availableTags,
  selectedTags,
  onToggle,
  onRemove,
  onCreate,
}: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const trimmed = query.trim()
  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(trimmed.toLowerCase())
  )
  const exactMatch = availableTags.some(
    (tag) => tag.toLowerCase() === trimmed.toLowerCase()
  )

  const handleCreate = () => {
    if (!trimmed || exactMatch) return
    onCreate(trimmed)
    setQuery('')
  }

  // Close the popover when clicking outside of it
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="tag-chips">
      {selectedTags.map((tag) => (
        <span key={tag} className="tag-chip tag-chip--selected">
          {tag}
          <button
            type="button"
            className="tag-chip__remove"
            aria-label={`Remove ${tag}`}
            onClick={() => onRemove(tag)}
          > × </button>
        </span>
      ))}

      <div className="tag-picker" ref={ref}>
        <button
          type="button"
          className="tag-add-button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        > + Add tag </button>

        {open && (
          <div className="tag-popover" role="dialog" aria-label="Add tags">
            <input
              type="text"
              className="tag-popover__search"
              placeholder="Search or create…"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreate()
                }
              }}
            />
            <ul className="tag-popover__list">
              {trimmed && !exactMatch && (
                <li>
                  <button
                    type="button"
                    className="tag-option tag-option--create"
                    onClick={handleCreate}
                  >
                    <span className="tag-option__check" />
                    {trimmed}
                    <span className="tag-option__hint">new tag</span>
                  </button>
                </li>
              )}

              {filteredTags.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <li key={tag}>
                    <button
                      type="button"
                      className={`tag-option${active ? ' tag-option--active' : ''}`}
                      onClick={() => onToggle(tag)}
                    >
                      <span className="tag-option__check">{active ? '✓' : ''}</span>
                      {tag}
                    </button>
                  </li>
                )
              })}

              {filteredTags.length === 0 && !trimmed && (
                <li className="tag-popover__empty">No tags yet</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
