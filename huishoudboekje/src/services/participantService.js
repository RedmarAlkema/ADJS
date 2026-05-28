import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'

export function normalizeParticipantEmail(email) {
  return email.trim().toLowerCase()
}

function mapParticipant(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    budgetBookId: data.budgetBookId,
    email: data.email,
    ownerId: data.ownerId,
  }
}

export function subscribeToParticipantLinks(email, onChange, onError) {
  const participantQuery = query(
    collectionGroup(db, 'participants'),
    where('email', '==', normalizeParticipantEmail(email)),
  )

  return onSnapshot(
    participantQuery,
    (snapshot) => onChange(snapshot.docs.map(mapParticipant)),
    onError,
  )
}

export function subscribeToBudgetBookParticipants(bookId, onChange, onError) {
  return onSnapshot(
    collection(db, 'budgetBooks', bookId, 'participants'),
    (snapshot) => onChange(snapshot.docs.map(mapParticipant)),
    onError,
  )
}

export function addBudgetBookParticipant(book, email) {
  const participantEmail = normalizeParticipantEmail(email)

  return setDoc(doc(db, 'budgetBooks', book.id, 'participants', participantEmail), {
    budgetBookId: book.id,
    createdAt: serverTimestamp(),
    email: participantEmail,
    ownerId: book.ownerId,
  })
}
