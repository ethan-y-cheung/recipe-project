import { useEffect, useRef, useState } from 'react'
import { Users, Clock, Tag } from 'lucide-react'
import '../styles/common.css'
import '../styles/CreateRecipe.css'

import Dropdown from '../components/CreateRecipe/Dropdown'
import EditableList from '../components/CreateRecipe/EditableList'
import TagPicker from '../components/CreateRecipe/TagPicker'
import { useAuth } from '../contexts/AuthContext'
import type { Recipe } from '../../../shared/types/index.ts'

// Defaults
const DEFAULT_TAGS = [
  'Breakfast', 'Lunch', 'Dinner', 'Lactose-free', 'Gluten-free',
  'Vegetarian', 'Vegan', 'Quick', 'Medium', 'Challenging',
]
const SERVING_PRESETS = ['1', '2', '4', '6', '8']
const TIME_PRESETS = ['15 min', '30 min', '45 min', '1 hour', '2+ hours']
const QTY_PRESETS = ['1', '2', '3', '1/2', '1/3', '1/4']
const UNIT_PRESETS = ['g', 'ml', 'cup', 'tbsp', 'oz']

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000'

type Ingredient = { id: number; name: string; qty: string; units: string }
// imageUrl is a local blob: preview; file is the actual bytes we upload to S3.
type Direction = { id: number; text: string; imageUrl: string | null; file: File | null }

// Downscale an image to fit within maxDim (longest side) and re-encode as JPEG
// so we never upload full-resolution phone photos. Big images make uploads,
// storage, and later <img> rendering slow; capping the dimension fixes all
// three. Images already within the cap pass through untouched (no upscaling, no
// pointless re-encode). Falls back to the original file if anything goes wrong
// so a decode quirk never blocks an upload.
async function downscaleImage(file: File, maxDim = 1600, quality = 0.8): Promise<File> {
  // Only attempt to downscale raster images; leave anything else (e.g. SVG) be.
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    if (scale === 1) {
      bitmap.close()
      return file // already small enough
    }

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

// Upload a single file to S3 via a presigned URL and return its permanent
// fileKey, which is what we persist on the recipe. Throws on any failure so the
// caller can surface a single "upload failed" message.
async function uploadImage(file: File): Promise<string> {
  // Shrink oversized images before they ever leave the browser.
  const upload = await downscaleImage(file)

  const signRes = await fetch(`${API_BASE}/aws/generate-upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: upload.name, fileType: upload.type }),
  })
  if (!signRes.ok) {
    const data = await signRes.json().catch(() => null)
    throw new Error(data?.error ?? 'Could not get an upload URL')
  }
  const { uploadUrl, fileKey } = (await signRes.json()) as {
    uploadUrl: string
    fileKey: string
  }

  // PUT the (possibly downscaled) bytes straight to S3. Content-Type must match
  // what the URL was signed with above, or S3 rejects the request.
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': upload.type },
    body: upload,
  })
  if (!putRes.ok) {
    throw new Error('Image upload to storage failed')
  }
  return fileKey
}

// Monotonic id generators for list rows
let nextId = 0
const newId = () => (nextId += 1)

export default function CreateRecipe() {
  const { currentUser } = useAuth()
  const [title, setTitle] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [servings, setServings] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS)
  const [tags, setTags] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: newId(), name: '', qty: '', units: '' },
  ])
  const [directions, setDirections] = useState<Direction[]>([
    { id: newId(), text: '', imageUrl: null, file: null },
  ])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const dirInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Cover Image
  const setCover = (file: File | undefined) => {
    if (!file) return
    setCoverUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setCoverFile(file)
  }
  const removeCover = () => {
    setCoverUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setCoverFile(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  const addIngredient = () =>
    setIngredients((p) => [...p, { id: newId(), name: '', qty: '', units: '' }])
  
  const updateIngredient = (id: number, patch: Partial<Ingredient>) =>
    setIngredients((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  
  const removeIngredient = (id: number) =>
    setIngredients((p) => p.filter((i) => i.id !== id))
  
  const addDirection = () =>
    setDirections((p) => [...p, { id: newId(), text: '', imageUrl: null, file: null }])
  
  const updateDirection = (id: number, text: string) =>
    setDirections((p) => p.map((d) => (d.id === id ? { ...d, text } : d)))
  
  const setDirectionImage = (id: number, file: File | undefined) => {
    if (!file) return
    setDirections((p) =>
      p.map((d) => {
        if (d.id !== id) return d
        if (d.imageUrl) URL.revokeObjectURL(d.imageUrl)
        return { ...d, imageUrl: URL.createObjectURL(file), file }
      })
    )
  }
  
  const removeDirectionImage = (id: number) => {
    setDirections((p) =>
      p.map((d) => {
        if (d.id !== id) return d
        if (d.imageUrl) URL.revokeObjectURL(d.imageUrl)
        return { ...d, imageUrl: null, file: null }
      })
    )
    const input = dirInputRefs.current[id]
    if (input) input.value = ''
  }
  
  const removeDirection = (id: number) =>
    setDirections((p) => {
      const target = p.find((d) => d.id === id)
      if (target?.imageUrl) URL.revokeObjectURL(target.imageUrl)
      return p.filter((d) => d.id !== id)
    })

  // Release any object URLs still held when the page unmounts
  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl)
      directions.forEach((d) => d.imageUrl && URL.revokeObjectURL(d.imageUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tags
  const toggleTag = (tag: string) =>
    setTags((p) => (p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]))
  const removeTag = (tag: string) => setTags((p) => p.filter((t) => t !== tag))
  const createTag = (tag: string) => {
    setAvailableTags((p) => (p.includes(tag) ? p : [...p, tag]))
    setTags((p) => (p.includes(tag) ? p : [...p, tag]))
  }

  // Create
  // Images are uploaded to S3 first, then the recipe is saved with a positional
  // array of fileKeys: index 0 is the cover, indices 1..N align to the direction
  // steps. Entries are null where the cover/step has no image so the alignment
  // never drifts. created_at is stamped server-side; the backend normalizes tags.
  const handleConfirm = async () => {
    // Each listed ingredient needs a name plus both a qty and units.
    const incompleteIngredient = ingredients.some(
      (i) =>
        (i.name.trim() || i.qty.trim() || i.units.trim()) &&
        !(i.name.trim() && i.qty.trim() && i.units.trim())
    )
    if (incompleteIngredient) {
      setSubmitError('Each ingredient needs a name, quantity, and units.')
      return
    }

    // Total time, if given, must include a unit like sec, min(s), or hour(s).
    const TIME_UNIT = /\b(sec|secs|second|seconds|min|mins|minute|minutes|hr|hrs|hour|hours)\b/i
    if (totalTime.trim() && !TIME_UNIT.test(totalTime)) {
      setSubmitError('Total time needs a unit, e.g. "30 min" or "1 hour".')
      return
    }

    // The create endpoint requires auth, so we need a signed-in user's token.
    if (!currentUser) {
      setSubmitError('You must be signed in to create a recipe.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const token = await currentUser.getIdToken()

      // Upload every image (cover first, then each step) in parallel. The array
      // stays positional: a step with no image resolves to null. One file's
      // failure rejects the whole batch so we never persist a partial image set.
      const images = await Promise.all(
        [coverFile, ...directions.map((d) => d.file)].map((file) =>
          file ? uploadImage(file) : Promise.resolve(null)
        )
      )

      // The fields the create form is responsible for. The server stamps the
      // rest of the Recipe (id, creator_ID, created_at, approved, rating,
      // user_generated) from the verified token, so we only send this subset.
      const recipe: Pick<Recipe, 'title' | 'ingredients' | 'instructions' | 'images'> & {
        tags: string[]
        servings?: number
        total_time?: string
      } = {
        title: title.trim(),
        ingredients: ingredients
          .filter((i) => i.name.trim() || i.qty.trim() || i.units.trim())
          .map((i) => ({
            name: i.name.trim(),
            quantity: [i.qty.trim(), i.units.trim()].filter(Boolean).join(' '),
          })),
        instructions: directions.map((d) => d.text.trim()).filter(Boolean),
        tags,
        servings: servings.trim() ? Number(servings.trim()) : undefined,
        total_time: totalTime.trim() || undefined,
        images,
      }

      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recipe),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? `Request failed (${res.status})`)
      }
      // The backend returns the persisted recipe; surface it as a typed Recipe.
      const { recipe: createdRecipe } = (await res.json()) as { recipe: Recipe }
      console.log('Created recipe:', createdRecipe)
      setConfirmOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create recipe')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!confirmOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [confirmOpen])

  return (
    <div className="create-recipe">
      <header className="app-header">
        <h1 className="create-recipe__title">Create <span className="recipe-heading__title--red">Recipe</span></h1>
      </header>

      <div className="create-card">
        {/* Title + cover + submit */}
        <div className="create-card__top">
          <input
            type="text"
            className="recipe-title-input"
            placeholder="Recipe title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              aria-label="Remove cover image"
            >
              ×
            </button>
          )}
          <button type="button" className="create-button" onClick={() => setConfirmOpen(true)}>
            Create
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={(e) => setCover(e.target.files?.[0])}
          />
        </div>

        {/* Meta: servings, total time, tags */}
        <div className="create-meta">
          <div className="meta-field">
            <label className="meta-field__label">
              <Users size={16} aria-hidden="true" />
              Servings
            </label>
            <Dropdown value={servings} onChange={setServings} options={SERVING_PRESETS} placeholder="Select or type" />
          </div>
          <div className="meta-field">
            <label className="meta-field__label">
              <Clock size={16} aria-hidden="true" />
              Total time
            </label>
            <Dropdown value={totalTime} onChange={setTotalTime} options={TIME_PRESETS} placeholder="Select or type" />
          </div>
          <div className="meta-field meta-field--tags">
            <label className="meta-field__label">
              <Tag size={16} aria-hidden="true" />
              Tags
            </label>
            <TagPicker
              availableTags={availableTags}
              selectedTags={tags}
              onToggle={toggleTag}
              onRemove={removeTag}
              onCreate={createTag}
            />
          </div>
        </div>

        {/* Ingredients + directions */}
        <div className="create-sections">
          <EditableList
            heading="Ingredients"
            items={ingredients}
            addLabel="+ Add Ingredient"
            onAdd={addIngredient}
            onRemove={removeIngredient}
            renderRow={(ing) => (
              <>
                <input
                  type="text"
                  className="ingredient-entry__name"
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, { name: e.target.value })}
                />
                <Dropdown
                  className="combo--compact"
                  value={ing.qty}
                  onChange={(qty) => updateIngredient(ing.id, { qty })}
                  options={QTY_PRESETS}
                  placeholder="Qty"
                />
                <Dropdown
                  className="combo--compact"
                  value={ing.units}
                  onChange={(units) => updateIngredient(ing.id, { units })}
                  options={UNIT_PRESETS}
                  placeholder="Units"
                />
              </>
            )}
          />

          <EditableList
            heading="Directions"
            items={directions}
            addLabel="+ Add Direction"
            onAdd={addDirection}
            onRemove={removeDirection}
            renderRow={(dir, index) => (
              <>
                <span className="direction-entry__number">{index + 1}</span>
                <input
                  type="text"
                  className="direction-entry__input"
                  placeholder="Start typing..."
                  value={dir.text}
                  onChange={(e) => updateDirection(dir.id, e.target.value)}
                />
                <button
                  type="button"
                  className={`direction-image-button${dir.imageUrl ? ' direction-image-button--set' : ''}`}
                  title={dir.imageUrl ? 'Change step image' : 'Add a step image'}
                  onClick={() =>
                    dir.imageUrl
                      ? removeDirectionImage(dir.id)
                      : dirInputRefs.current[dir.id]?.click()
                  }
                  aria-label={dir.imageUrl ? `Remove image from step ${index + 1}` : `Add image to step ${index + 1}`}
                >
                  {dir.imageUrl ? '× Image' : '+ Image'}
                </button>
                <input
                  ref={(el) => {
                    dirInputRefs.current[dir.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="visually-hidden"
                  onChange={(e) => setDirectionImage(dir.id, e.target.files?.[0])}
                />
              </>
            )}
          />
        </div>
      </div>

      {/* Create confirmation dialog */}
      {confirmOpen && (
        <div className="modal-overlay" onClick={() => setConfirmOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" className="modal__title">Create this recipe?</h2>
            <p className="modal__body">
              Once created, your recipe will be saved. You can keep editing if
              you’re not ready yet.
            </p>
            {submitError && <p className="modal__error" role="alert">{submitError}</p>}
            <div className="modal__actions">
              <button
                type="button"
                className="modal__button modal__button--secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="modal__button modal__button--primary"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Create recipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
