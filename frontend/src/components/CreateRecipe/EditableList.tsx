import type { ReactNode } from 'react'

type Row = { id: number }

type EditableListProps<T extends Row> = {
  heading: string
  items: T[]
  addLabel: string
  onAdd: () => void
  /** Render a single row's fields. Removal is handled by the wrapper. */
  renderRow: (item: T, index: number) => ReactNode
  onRemove: (id: number) => void
}

/**
 * Section card with a scrollable list of rows and an add button.
 * Each row gets a remove control (hidden when only one row remains).
 */
export default function EditableList<T extends Row>({
  heading,
  items,
  addLabel,
  onAdd,
  renderRow,
  onRemove,
}: EditableListProps<T>) {
  return (
    <section className="section-card">
      <h2 className="section-card__heading">{heading}</h2>
      <div className="section-card__list">
        {items.map((item, index) => (
          <div key={item.id} className="list-entry">
            {renderRow(item, index)}
            {items.length > 1 && (
              <button
                type="button"
                className="entry-remove-button"
                aria-label={`Remove ${heading.toLowerCase()} ${index + 1}`}
                title="Remove"
                onClick={() => onRemove(item.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="add-button" onClick={onAdd}>
        {addLabel}
      </button>
    </section>
  )
}
