import { useState } from 'react'
import { format, isPast, parseISO } from 'date-fns'
import { Calendar, Pencil, Trash2, CheckCircle2, Clock, Circle } from 'lucide-react'

const STATUS_ICON = {
  pending:     <Circle size={10} />,
  'in-progress': <Clock size={10} />,
  completed:   <CheckCircle2 size={10} />,
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const [deleting, setDeleting]   = useState(false)
  const [changing, setChanging]   = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
  }

  const nextStatus = {
    pending:     'in-progress',
    'in-progress': 'completed',
    completed:   'pending',
  }

  const handleStatusCycle = async () => {
    setChanging(true)
    await onStatusChange(task.id, nextStatus[task.status] || 'pending')
    setChanging(false)
  }

  const isOverdue = task.due_date && task.status !== 'completed'
    && isPast(parseISO(task.due_date))

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            className="btn-icon"
            title="Edit task"
            onClick={() => onEdit(task)}
          >
            <Pencil size={14} />
          </button>
          <button
            className="btn-icon danger"
            title="Delete task"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <button
          className={`status-badge ${task.status}`}
          title="Click to cycle status"
          onClick={handleStatusCycle}
          disabled={changing}
          style={{ cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {STATUS_ICON[task.status]}
          {changing ? '…' : task.status}
        </button>

        {task.due_date && (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            <Calendar size={11} />
            {isOverdue ? '⚠ ' : ''}
            {format(parseISO(task.due_date), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  )
}
