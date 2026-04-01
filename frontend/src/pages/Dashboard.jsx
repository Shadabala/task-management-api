import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Plus, Filter, X, ClipboardList } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

// ─── helpers ────────────────────────────────────────────────────────────────
const fetchTasks = async ({ status, due_date, page }) => {
  const params = { page }
  if (status)   params.status   = status
  if (due_date) params.due_date = due_date
  const { data } = await api.get('/tasks', { params })
  return data.data   // paginated Laravel resource
}

export default function Dashboard() {
  const { user } = useAuth()
  const qc       = useQueryClient()

  // ── filter state
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter,   setDateFilter]   = useState('')
  const [page,         setPage]         = useState(1)

  // ── modal state
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTask,   setEditTask]   = useState(null)   // null = create mode
  const [saving,     setSaving]     = useState(false)

  // ── query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', statusFilter, dateFilter, page],
    queryFn:  () => fetchTasks({ status: statusFilter, due_date: dateFilter, page }),
    keepPreviousData: true,
  })

  const tasks      = data?.data          ?? []
  const totalPages = data?.last_page     ?? 1
  const total      = data?.total         ?? 0
  const counts     = {
    total,
    pending:    tasks.filter(t => t.status === 'pending').length,
    inprogress: tasks.filter(t => t.status === 'in-progress').length,
    completed:  tasks.filter(t => t.status === 'completed').length,
  }

  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] })

  // ── create / update
  const handleSave = useCallback(async (payload) => {
    setSaving(true)
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload)
        toast.success('Task updated ✓')
      } else {
        await api.post('/tasks', payload)
        toast.success('Task created ✓')
      }
      invalidate()
      closeModal()
      return null   // no errors
    } catch (err) {
      const res = err.response
      if (res?.status === 422) return res.data.errors
      toast.error(res?.data?.message || 'Something went wrong')
      return null
    } finally {
      setSaving(false)
    }
  }, [editTask])

  // ── delete
  const handleDelete = useCallback(async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      invalidate()
    } catch {
      toast.error('Failed to delete task')
    }
  }, [])

  // ── status cycle
  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus })
      toast.success(`Marked as ${newStatus}`)
      invalidate()
    } catch {
      toast.error('Failed to update status')
    }
  }, [])

  // ── modal helpers
  const openCreate = () => { setEditTask(null); setModalOpen(true) }
  const openEdit   = (t) => { setEditTask(t);   setModalOpen(true) }
  const closeModal = ()  => { setModalOpen(false); setEditTask(null) }

  const clearFilters = () => { setStatusFilter(''); setDateFilter(''); setPage(1) }
  const hasFilters   = statusFilter || dateFilter

  return (
    <>
      <Navbar />

      <main className="dashboard">
        {/* ── Header ─────────────────────────── */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h2>My Tasks</h2>
            <p>Hello, {user?.name?.split(' ')[0]} 👋 — here's your workspace</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={openCreate}>
            <Plus size={18} /> New Task
          </button>
        </div>

        {/* ── Stats ──────────────────────────── */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-value total">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value pending">
              {data ? tasks.filter(t => t.status === 'pending').length : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In Progress</div>
            <div className="stat-value progress">
              {data ? tasks.filter(t => t.status === 'in-progress').length : '—'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value done">
              {data ? tasks.filter(t => t.status === 'completed').length : '—'}
            </div>
          </div>
        </div>

        {/* ── Filters ────────────────────────── */}
        <div className="filters-bar">
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            className="filter-date"
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setPage(1) }}
            title="Filter by due date"
          />

          {hasFilters && (
            <button className="btn-filter-clear" onClick={clearFilters}>
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        {/* ── Task Grid ──────────────────────── */}
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : isError ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: 'var(--danger)' }}>⚠</div>
            <h3>Failed to load tasks</h3>
            <p>Check your connection and try refreshing.</p>
          </div>
        ) : (
          <>
            <div className="tasks-grid">
              {tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <ClipboardList size={32} style={{ color: 'var(--accent-light)' }} />
                  </div>
                  <h3>{hasFilters ? 'No tasks match your filters' : 'No tasks yet'}</h3>
                  <p>
                    {hasFilters
                      ? 'Try adjusting or clearing the filters above.'
                      : 'Click "New Task" to add your first task and get started.'}
                  </p>
                  {!hasFilters && (
                    <button className="btn btn-primary" style={{ width: 'auto', marginTop: '8px' }} onClick={openCreate}>
                      <Plus size={16} /> Create First Task
                    </button>
                  )}
                </div>
              ) : (
                tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </div>

            {/* ── Pagination ───────────────────── */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Create / Edit Modal ─────────────── */}
      {modalOpen && (
        <TaskModal
          task={editTask}
          onSave={handleSave}
          onClose={closeModal}
          loading={saving}
        />
      )}
    </>
  )
}
