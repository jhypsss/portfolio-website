function AdminAddButton({ label, onClick }) {
  return (
    <button type="button" className="btn btn-primary admin-add-fab" onClick={onClick}>
      <span className="admin-add-fab-icon" aria-hidden="true">
        +
      </span>
      <span className="admin-add-fab-label">{label}</span>
    </button>
  )
}

export default AdminAddButton