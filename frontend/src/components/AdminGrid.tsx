import React, { useState } from 'react'
import styles from './AdminGrid.module.css'

export interface GridColumn {
  key: string
  label: string
  render?: (value: any, item: any) => React.ReactNode
}

export interface GridAction {
  label: string
  onClick: (item: any) => void
  variant?: 'edit' | 'delete' | 'toggle' | 'primary'
  show?: (item: any) => boolean
}

export interface AdminGridProps {
  title: string
  columns: GridColumn[]
  data: any[]
  actions: GridAction[]
  onAdd: () => void
  isLoading?: boolean
  emptyMessage?: string
  onReorder?: (items: any[]) => void
}

export function AdminGrid({
  title,
  columns,
  data,
  actions,
  onAdd,
  isLoading = false,
  emptyMessage = 'No items found',
  onReorder,
}: AdminGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const newItems = [...data]
    const [removed] = newItems.splice(dragIndex, 1)
    newItems.splice(index, 0, removed)
    onReorder?.(newItems)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  if (isLoading) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <h2 className={styles.gridTitle}>{title}</h2>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>
          <h2 className={styles.gridTitle}>{title}</h2>
          <button className={styles.addButton} onClick={onAdd}>
            + Add New
          </button>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📭</div>
          <p className={styles.emptyStateText}>{emptyMessage}</p>
          <button className={styles.addButton} onClick={onAdd}>
            + Create First Item
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridHeader}>
        <h2 className={styles.gridTitle}>{title}</h2>
        <button className={styles.addButton} onClick={onAdd}>
          + Add New
        </button>
      </div>

      <div className={styles.cardsGrid}>
        {data.map((item, index) => {
          const primaryColumn = columns[0]
          const secondaryColumns = columns.slice(1).filter((column) => column.key !== 'active')
          const primaryValue = primaryColumn.render
            ? primaryColumn.render(item[primaryColumn.key], item)
            : item[primaryColumn.key]

          const isDragging = dragIndex === index
          const isDragOver = dragOverIndex === index && dragIndex !== index

          return (
            <article
              key={item.id || index}
              draggable={!!onReorder}
              onDragStart={onReorder ? (e) => handleDragStart(e, index) : undefined}
              onDragOver={onReorder ? (e) => handleDragOver(e, index) : undefined}
              onDrop={onReorder ? (e) => handleDrop(e, index) : undefined}
              onDragEnd={onReorder ? handleDragEnd : undefined}
              className={[
                styles.card,
                item.active === false ? styles.inactive : '',
                isDragging ? styles.dragging : '',
                isDragOver ? styles.dragOver : '',
              ].filter(Boolean).join(' ')}
            >
              <div className={styles.cardHeader}>
                {onReorder && (
                  <span className={styles.dragHandle} title="Drag to reorder">⋮⋮</span>
                )}
                <div className={styles.primaryBlock}>
                  <h3 className={styles.cardTitle}>{primaryValue || 'Untitled'}</h3>
                </div>
                {'active' in item && typeof item.active === 'boolean' && (
                  <span className={`${styles.badge} ${item.active ? styles.activeBadge : styles.inactiveBadge}`}>
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>

              {secondaryColumns.length > 0 && (
                <div className={styles.cardContent}>
                  <div className={styles.metadata}>
                    {secondaryColumns.map((column) => {
                      const value = column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]

                      return (
                        <div key={column.key} className={styles.metaItem}>
                          <span className={styles.metaLabel}>{column.label}:</span>
                          <div className={styles.metaValue}>{value || '—'}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={styles.cardActions}>
                {actions.map((action, actionIndex) => {
                  if (action.show && !action.show(item)) {
                    return null
                  }

                  const buttonClass =
                    action.variant === 'delete'
                      ? styles.buttonDelete
                      : action.variant === 'toggle'
                        ? styles.buttonToggle
                        : styles.buttonEdit

                  return (
                    <button
                      key={actionIndex}
                      className={`${styles.button} ${buttonClass}`}
                      onClick={() => action.onClick(item)}
                      title={action.label}
                    >
                      {action.variant === 'toggle' && 'active' in item && typeof item.active === 'boolean'
                        ? item.active
                          ? 'Deactivate'
                          : 'Activate'
                        : action.label}
                    </button>
                  )
                })}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
