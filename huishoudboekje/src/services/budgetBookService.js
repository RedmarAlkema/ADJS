import {
  addDoc,
  collection,
  doc,
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
  const activeBooksQuery = query(
    budgetBooksCollection,
    where('ownerId', '==', ownerId),
    where('archived', '==', false),
  )

  return onSnapshot(
    activeBooksQuery,
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
