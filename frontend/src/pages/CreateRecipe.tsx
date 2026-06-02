import { useEffect, useRef, useState } from 'react'
import '../styles/common.css'
import './CreateRecipe.css'

const DEFAULT_TAGS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Lactose-free',
  'Gluten-free',
  'Vegetarian',
  'Vegan',
  'Quick',
  'Medium',
  'Challenging'
]

const SERVING_PRESETS = ['1', '2', '4', '6', '8']
const TIME_PRESETS = ['15 min', '30 min', '45 min', '1 hour', '2+ hours']
const QTY_PRESETS = ['1', '2', '3', '1/2', '1/3', '1/4']
const UNIT_PRESETS = ['g', 'ml', 'cup', 'tbsp', 'oz']

function ComboBox({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
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
                className={`combo__option${
                  opt === value ? ' combo__option--active' : ''
                }`}
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


type Direction = {
  id: number
  text: string
  /** Object URL for a locally selected image preview, or null. */
  imageUrl: string | null
}

let directionId = 1

export default function CreateRecipe() {
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagPickerOpen, setTagPickerOpen] = useState(false)
  const [tagQuery, setTagQuery] = useState('')
  const tagPickerRef = useRef<HTMLDivElement>(null)
  const [servings, setServings] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [qty, setQty] = useState('')
  const [units, setUnits] = useState('')

  // Cover image (local preview only — uploaded when the save flow exists)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [directions, setDirections] = useState<Direction[]>([
    { id: directionId, text: '', imageUrl: null },
  ])
  // One hidden file input per direction, keyed by direction id
  const directionInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const setCoverImage = (file: File | undefined) => {
    if (!file) return
    setCoverUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const removeCover = () => {
    setCoverUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  // TODO: re-wire to the "+ Add Direction" button once each direction has its
  // own per-entry state (today the qty/units ComboBoxes share single state, so
  // added rows would mirror the same values). Prefixed with _ to keep it from
  // tripping noUnusedLocals while intentionally unwired.
  const _addDirection = () => {
    directionId += 1
    setDirections((prev) => [
      ...prev,
      { id: directionId, text: '', imageUrl: null },
    ])
  }
  void _addDirection

  const updateDirectionText = (id: number, text: string) => {
    setDirections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, text } : d))
    )
  }

  const setDirectionImage = (id: number, file: File | undefined) => {
    if (!file) return
    setDirections((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        if (d.imageUrl) URL.revokeObjectURL(d.imageUrl)
        return { ...d, imageUrl: URL.createObjectURL(file) }
      })
    )
  }

  const removeDirectionImage = (id: number) => {
    setDirections((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        if (d.imageUrl) URL.revokeObjectURL(d.imageUrl)
        return { ...d, imageUrl: null }
      })
    )
    const input = directionInputRefs.current[id]
    if (input) input.value = ''
  }

  const removeDirection = (id: number) => {
    setDirections((prev) => {
      const target = prev.find((d) => d.id === id)
      if (target?.imageUrl) URL.revokeObjectURL(target.imageUrl)
      return prev.filter((d) => d.id !== id)
    })
  }

  // Release any object URLs still held when the page unmounts
  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl)
      directions.forEach((d) => {
        if (d.imageUrl) URL.revokeObjectURL(d.imageUrl)
      })
    }
    // Cleanup only on unmount; per-image revokes are handled at replace time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const query = tagQuery.trim()
  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(query.toLowerCase())
  )
  const exactMatch = availableTags.some(
    (tag) => tag.toLowerCase() === query.toLowerCase()
  )

  const createTag = () => {
    if (!query || exactMatch) return
    setAvailableTags((prev) => [...prev, query])
    setSelectedTags((prev) => [...prev, query])
    setTagQuery('')
  }

  // Close the popover when clicking outside of it
  useEffect(() => {
    if (!tagPickerOpen) return
    const handleClick = (e: MouseEvent) => {
      if (
        tagPickerRef.current &&
        !tagPickerRef.current.contains(e.target as Node)
      ) {
        setTagPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [tagPickerOpen])

  return (
    <div className="create-recipe">
      <h1 className="create-recipe__title">Create Recipe</h1>

      <div className="create-card">
        {/* Title + submit */}
        <div className="create-card__top">
          <input
            type="text"
            className="recipe-title-input"
            placeholder="Recipe title"
          />
          <button
            type="button"
            className={`cover-button${coverUrl ? ' cover-button--set' : ''}`}
            onClick={() => coverInputRef.current?.click()}
            title={coverUrl ? 'Change cover image' : 'Add a cover image'}
          >
            <span aria-hidden="true">+</span>
            {coverUrl ? 'Cover added' : 'Cover image'}
          </button>
          {coverUrl && (
            <button
              type="button"
              className="cover-button cover-button--remove"
              onClick={removeCover}
              title="Remove cover image"
              aria-label="Remove cover image"
            >
              ×
            </button>
          )}
          <button type="button" className="create-button">
            Create
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => setCoverImage(e.target.files?.[0])}
          />
        </div>

        {/* Meta dropdowns */}
        <div className="create-meta">
          <div className="meta-field">
            <label className="meta-field__label">Servings</label>
            <ComboBox
              value={servings}
              onChange={setServings}
              options={SERVING_PRESETS}
              placeholder="Select or type"
            />
          </div>

          <div className="meta-field">
            <label className="meta-field__label">Total time</label>
            <ComboBox
              value={totalTime}
              onChange={setTotalTime}
              options={TIME_PRESETS}
              placeholder="Select or type"
            />
          </div>

          <div className="meta-field meta-field--tags">
            <label className="meta-field__label">Tags</label>
            <div className="tag-chips">
              {selectedTags.map((tag) => (
                <span key={tag} className="tag-chip tag-chip--selected">
                  {tag}
                  <button
                    type="button"
                    className="tag-chip__remove"
                    aria-label={`Remove ${tag}`}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="tag-picker" ref={tagPickerRef}>
                <button
                  type="button"
                  className="tag-add-button"
                  aria-expanded={tagPickerOpen}
                  onClick={() => setTagPickerOpen((open) => !open)}
                >
                  + Add tag
                </button>

                {tagPickerOpen && (
                  <div className="tag-popover" role="dialog" aria-label="Add tags">
                    <input
                      type="text"
                      className="tag-popover__search"
                      placeholder="Search or create…"
                      value={tagQuery}
                      autoFocus
                      onChange={(e) => setTagQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          createTag()
                        }
                      }}
                    />
                    <ul className="tag-popover__list">
                      {query && !exactMatch && (
                        <li>
                          <button
                            type="button"
                            className="tag-option tag-option--create"
                            onClick={createTag}
                          >
                            <span className="tag-option__check" />
                            {query}
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
                              onClick={() => toggleTag(tag)}
                            >
                              <span className="tag-option__check">
                                {active ? '✓' : ''}
                              </span>
                              {tag}
                            </button>
                          </li>
                        )
                      })}

                      {filteredTags.length === 0 && !query && (
                        <li className="tag-popover__empty">No tags yet</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients + directions */}
        <div className="create-sections">
          {/* Ingredients */}
          <section className="section-card">
            <h2 className="section-card__heading">Ingredients</h2>
            <div className="section-card__list">
              <div className="ingredient-entry">
                <input
                  type="text"
                  className="ingredient-entry__name"
                  placeholder="Ingredient name"
                />
                <ComboBox
                  className="combo--compact"
                  value={qty}
                  onChange={setQty}
                  options={QTY_PRESETS}
                  placeholder="Qty"
                />
                <ComboBox
                  className="combo--compact"
                  value={units}
                  onChange={setUnits}
                  options={UNIT_PRESETS}
                  placeholder="Units"
                />
              </div>
            </div>
            <button type="button" className="add-button">
              + Add Ingredient
            </button>
          </section>

          {/* Directions */}
          <section className="section-card">
            <h2 className="section-card__heading">Directions</h2>
            <div className="section-card__list">
              {directions.map((direction, index) => (
                <div key={direction.id} className="direction-entry">
                  <div className="direction-entry__row">
                    <span className="direction-entry__number">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      className="direction-entry__input"
                      placeholder="Start typing..."
                      value={direction.text}
                      onChange={(e) =>
                        updateDirectionText(direction.id, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="direction-image-button"
                      aria-label={`Attach image to step ${index + 1}`}
                      title="Attach image"
                      onClick={() =>
                        directionInputRefs.current[direction.id]?.click()
                      }
                    >
                      ＋
                    </button>
                    {directions.length > 1 && (
                      <button
                        type="button"
                        className="direction-remove-button"
                        aria-label={`Remove step ${index + 1}`}
                        title="Remove step"
                        onClick={() => removeDirection(direction.id)}
                      >
                        ×
                      </button>
                    )}
                    <input
                      ref={(el) => {
                        directionInputRefs.current[direction.id] = el
                      }}
                      type="file"
                      accept="image/*"
                      className="visually-hidden"
                      onChange={(e) =>
                        setDirectionImage(direction.id, e.target.files?.[0])
                      }
                    />
                  </div>

                  {direction.imageUrl && (
                    <div className="direction-image">
                      <img
                        className="direction-image__img"
                        src={direction.imageUrl}
                        alt={`Step ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="direction-image__remove"
                        aria-label={`Remove image from step ${index + 1}`}
                        onClick={() => removeDirectionImage(direction.id)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* TODO: Add Direction is unwired. Re-enable onClick={_addDirection}
                once the shared-state bug is fixed — multiple direction entries
                currently collide on the same combo/input state (e.g. the qty and
                units ComboBoxes are driven by single shared `qty`/`units` state,
                so every row would mirror the same value). Each direction needs
                its own per-entry state before adding more rows is safe. */}
            <button
              type="button"
              className="add-button"
            >
              + Add Direction
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
