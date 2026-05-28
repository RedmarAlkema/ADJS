export function BudgetBookList({
  currentUserId,
  emptyMessage = 'Maak je eerste huishoudboekje aan.',
  budgetBooks,
  countLabel = 'actief',
  isArchive = false,
  onRestore,
  selectedBook,
  onArchive,
  onEdit,
  onSelect,
  title = 'Huishoudboekjes',
}) {
  return (
    <section className="panel list-panel" aria-labelledby="books-title">
      <div className="section-heading">
        <div>
          <h2 id="books-title">{title}</h2>
          <p>
            {budgetBooks.length} {countLabel}
          </p>
        </div>
      </div>

      {budgetBooks.length === 0 ? (
        <p className="empty-state">{emptyMessage}</p>
      ) : (
        <ul className="book-list">
          {budgetBooks.map((book) => (
            <li key={book.id} className={selectedBook?.id === book.id ? 'selected' : ''}>
              <button type="button" onClick={() => onSelect(book)}>
                <strong>{book.name}</strong>
                <span>{book.description || 'Geen omschrijving'}</span>
                {book.ownerId !== currentUserId ? (
                  <small>Gedeeld met jou</small>
                ) : null}
              </button>
              <div className="row-actions">
                {book.ownerId !== currentUserId ? null : isArchive ? (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => onRestore(book)}
                  >
                    Herstel
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
