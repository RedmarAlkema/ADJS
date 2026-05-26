export function Alert({ children }) {
  if (!children) {
    return null
  }

  return <p className="alert">{children}</p>
}
