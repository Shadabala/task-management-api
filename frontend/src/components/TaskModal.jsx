import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

const EMPTY = { title: '', description: '', status: 'pending', due_date: '' }

export default function TaskModal({ task, onSave, onClose, loading }) {
  const isEdit = !!task
  const [form, setForm]     = useState(isEdit ? {
    title:       task.title,
    description: task.description || '',
    status:      task.status,
    due_date:    task.due_date ? task.due_date.slice(0, 10) : '',
  } : EMPTY)
  const [errors, setErrors] = useState({})

  // Trap focus in modal — close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Client-side required check
    if (!form.title.trim()) {
      setErrors({ title: ['Title is required.'] })
      return
    }
    const payload = {
      title:       form.title.trim(),
      description: form.description || null,
      status:      form.status || 'pending',
      due_date:    form.due_date || null,
    }
    const apiErrors = await onSave(payload)
    if (apiErrors) setErrors(apiErrors)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3>{isEdit ? '✏️ Edit Task' : '✨ New Task'}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">

            {/* Title */}
            <div className="form-group">
              <label htmlFor="task-title">Title *</label>
              <input
                id="task-title"
                name="title"
                type="text"
                className={`form-input no-icon ${errors.title ? 'error' : ''}`}
                placeholder="What needs to be done?"
                value={form.title}
                onChange={handleChange}
                autoFocus
                maxLength={255}
              />
              {errors.title && <p className="form-error">{errors.title[0]}</p>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                name="description"
                className="form-input no-icon"
                placeholder="Add more details… (optional)"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-row">
              {/* Status */}
              <div className="form-group">
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  name="status"
                  className="form-input no-icon filter-select"
                  value={form.status}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label htmlFor="task-due">Due Date</label>
                <input
                  id="task-due"
                  name="due_date"
                  type="date"
                  className="form-input no-icon filter-date"
                  value={form.due_date}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
                {errors.due_date && <p className="form-error">{errors.due_date[0]}</p>}
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: 'auto', minWidth: '120px' }}
            >
              {loading
                ? <><Loader2 size={15} className="spin-icon" /> Saving…</>
                : isEdit ? 'Save Changes' : '+ Create Task'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
