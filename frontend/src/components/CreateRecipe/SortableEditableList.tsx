import type { ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

type Row = { id: number }

type SortableEditableListProps<T extends Row> = {
  heading: string
  items: T[]
  addLabel: string
  onAdd: () => void
  onRemove: (id: number) => void
  onReorder: (items: T[]) => void
  renderRow: (item: T, index: number) => ReactNode
}

function SortableRow<T extends Row>({
  item,
  index,
  itemCount,
  onRemove,
  heading,
  renderRow,
}: {
  item: T
  index: number
  itemCount: number
  onRemove: (id: number) => void
  heading: string
  renderRow: (item: T, index: number) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className={`list-entry${isDragging ? ' list-entry--dragging' : ''}`}>
      <button
        type="button"
        className="drag-handle"
        aria-label={`Drag to reorder ${heading.toLowerCase()} ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      {renderRow(item, index)}
      {itemCount > 1 && (
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
  )
}

export default function SortableEditableList<T extends Row>({
  heading,
  items,
  addLabel,
  onAdd,
  onRemove,
  onReorder,
  renderRow,
}: SortableEditableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <section className="section-card">
      <h2 className="section-card__heading">{heading}</h2>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="section-card__list">
            {items.map((item, index) => (
              <SortableRow
                key={item.id}
                item={item}
                index={index}
                itemCount={items.length}
                onRemove={onRemove}
                heading={heading}
                renderRow={renderRow}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button type="button" className="add-button" onClick={onAdd}>
        {addLabel}
      </button>
    </section>
  )
}
