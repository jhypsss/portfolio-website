function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p>&copy; {year} Patrick Torres. All rights reserved.</p>
    </footer>
  )
}

export default Footer
