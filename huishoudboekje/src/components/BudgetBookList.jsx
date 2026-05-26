export function BudgetBookList({
  budgetBooks,
  selectedBook,
  onArchive,
  onEdit,
  onSelect,
}) {
  return (
    <section className="panel list-panel" aria-labelledby="books-title">
      <div className="section-heading">
        <div>
          <h2 id="books-title">Huishoudboekjes</h2>
          <p>{budgetBooks.length} actief</p>
        </div>
      </div>

      {budgetBooks.length === 0 ? (
        <p className="empty-state">Maak je eerste huishoudboekje aan.</p>
      ) : (
        <ul className="book-list">
          {budgetBooks.map((book) => (
            <li
              key={book.id}
              className={selectedBook?.id === book.id ? 'selected' : ''}
            >
              <button type="button" onClick={() => onSelect(book)}>
                <strong>{book.name}</strong>
                <span>{book.description || 'Geen omschrijving'}</span>
              </button>
              <div className="row-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onEdit(book)}
                >
                  Bewerk
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onArchive(book)}
                >
                  Archiveer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
