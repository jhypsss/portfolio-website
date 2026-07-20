import Modal from './Modal'

function ConfirmDialog({
  isOpen,
  title = 'Please confirm',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="confirm-dialog-message">{message}</p>
      <div className="admin-form-actions">
        <button
          type="button"
          className={isDanger ? 'btn btn-danger' : 'btn btn-primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
