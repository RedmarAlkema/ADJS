import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

const expensesCollection = collection(db, 'expenses')

function mapExpense(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    budgetBookId: data.budgetBookId,
    ownerId: data.ownerId,
    title: data.title,
    category: data.category,
    amount: Number(data.amount),
    date: data.date,
    note: data.note ?? '',
    createdAt: data.createdAt?.toDate?.() ?? null,
  }
}

export function subscribeToExpenses(bookId, ownerId, onChange, onError) {
  const expensesQuery = query(
    expensesCollection,
    where('budgetBookId', '==', bookId),
    where('ownerId', '==', ownerId),
  )

  return onSnapshot(
    expensesQuery,
    (snapshot) =>
      onChange(
        snapshot.docs
          .map(mapExpense)
          .sort((first, second) => second.date.localeCompare(first.date)),
      ),
    onError,
  )
}

export function createExpense(book, ownerId, values) {
  return addDoc(expensesCollection, {
    budgetBookId: book.id,
    ownerId,
    title: values.title.trim(),
    category: values.category,
    amount: Number(values.amount),
    date: values.date,
    note: values.note.trim(),
    createdAt: serverTimestamp(),
  })
}

export function deleteExpense(expense) {
  return deleteDoc(doc(db, 'expenses', expense.id))
}
