import {
  addDoc,
  collection,
  doc,
  documentId,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const budgetBooksCollection = collection(db, 'budgetBooks')

function mapBudgetBook(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    name: data.name,
    description: data.description ?? '',
    ownerId: data.ownerId,
    archived: Boolean(data.archived),
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  }
}

export function subscribeToActiveBudgetBooks(ownerId, onChange, onError) {
  return subscribeToBudgetBooks(ownerId, false, onChange, onError)
}

export function subscribeToArchivedBudgetBooks(ownerId, onChange, onError) {
  return subscribeToBudgetBooks(ownerId, true, onChange, onError)
}

function subscribeToBudgetBooks(ownerId, archived, onChange, onError) {
  const booksQuery = query(
    budgetBooksCollection,
    where('ownerId', '==', ownerId),
    where('archived', '==', archived),
  )

  return onSnapshot(
    booksQuery,
    (snapshot) =>
      onChange(
        snapshot.docs
          .map(mapBudgetBook)
          .sort((first, second) => second.createdAt - first.createdAt),
      ),
    onError,
  )
}

export function subscribeToBudgetBooksByIds(ids, archived, onChange, onError) {
  if (ids.length === 0) {
    onChange([])
    return () => {}
  }

  const booksQuery = query(
    budgetBooksCollection,
    where(documentId(), 'in', ids.slice(0, 30)),
    where('archived', '==', archived),
  )

  return onSnapshot(
    booksQuery,
    (snapshot) =>
      onChange(
        snapshot.docs
          .map(mapBudgetBook)
          .sort((first, second) => second.createdAt - first.createdAt),
      ),
    onError,
  )
}

export function createBudgetBook(ownerId, values) {
  return addDoc(budgetBooksCollection, {
    name: values.name.trim(),
    description: values.description.trim(),
    ownerId,
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateBudgetBook(book, values) {
  return updateDoc(doc(db, 'budgetBooks', book.id), {
    name: values.name.trim(),
    description: values.description.trim(),
    updatedAt: serverTimestamp(),
  })
}

export function archiveBudgetBook(book) {
  return updateDoc(doc(db, 'budgetBooks', book.id), {
    archived: true,
    updatedAt: serverTimestamp(),
  })
}

export function restoreBudgetBook(book) {
  return updateDoc(doc(db, 'budgetBooks', book.id), {
    archived: false,
    updatedAt: serverTimestamp(),
  })
}
