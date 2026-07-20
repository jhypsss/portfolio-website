import Modal from './Modal'

function AdminDetailModal({ isOpen, onClose, title, fields, onEdit, onDelete, primaryAction }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <dl className="admin-detail-list">
        {fields.map(({ label, value }) => (
          <div className="admin-detail-row" key={label}>
            <dt>{label}</dt>
            <dd>{value === null || value === undefined || value === '' ? 'Not provided' : value}</dd>
          </div>
        ))}
      </dl>

      <div className="admin-form-actions">
        {primaryAction && (
          <button type="button" className="btn btn-secondary" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </button>
        )}
        {onEdit && (
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            Edit
          </button>
        )}
        {onDelete && (
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
        )}
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}

export default AdminDetailModal