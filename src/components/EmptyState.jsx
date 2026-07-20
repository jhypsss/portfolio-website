function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="admin-empty-state">
      <p>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
