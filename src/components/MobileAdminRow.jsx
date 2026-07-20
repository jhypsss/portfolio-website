function MobileAdminRow({ children, isSelected = false, onClick }) {
  return (
    <button
      type="button"
      className={isSelected ? 'mobile-row is-selected' : 'mobile-row'}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {children}
    </button>
  )
}

export default MobileAdminRow