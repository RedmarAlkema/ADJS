import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { firebaseConfig } from '../src/services/firebaseConfig.js'

const seedBooks = [
  {
    description: 'Voorbeeldboekje met vaste lasten en dagelijkse uitgaven.',
    expenses: [
      {
        amount: 1240,
        category: 'Wonen',
        date: '2026-05-01',
        note: 'Huur appartement',
        title: 'Huur',
      },
      {
        amount: 86.35,
        category: 'Boodschappen',
        date: '2026-05-04',
        note: 'Weekboodschappen',
        title: 'Supermarkt',
      },
      {
        amount: 28.5,
        category: 'Vervoer',
        date: '2026-05-08',
        note: 'Trein naar school',
        title: 'OV',
      },
      {
        amount: 17.95,
        category: 'Vrije tijd',
        date: '2026-05-12',
        note: 'Filmavond',
        title: 'Bioscoop',
      },
    ],
    name: 'Gezin mei',
  },
  {
    description: 'Kosten voor een korte vakantie.',
    expenses: [
      {
        amount: 320,
        category: 'Vrije tijd',
        date: '2026-06-02',
        note: 'Hotel aanbetaling',
        title: 'Hotel',
      },
      {
        amount: 75,
        category: 'Vervoer',
        date: '2026-06-03',
        note: 'Brandstof',
        title: 'Reiskosten',
      },
      {
        amount: 42.8,
        category: 'Boodschappen',
        date: '2026-06-04',
        note: 'Ontbijt en snacks',
        title: 'Vakantieboodschappen',
      },
    ],
    name: 'Vakantie',
  },
]

const archivedSeedBook = {
  description: 'Gearchiveerd voorbeeld om te laten zien dat dit niet zichtbaar is.',
  name: 'Oud boekje',
}

async function createBudgetBook(db, ownerId, book) {
  return addDoc(collection(db, 'budgetBooks'), {
    archived: false,
    createdAt: serverTimestamp(),
    description: book.description,
    name: book.name,
    ownerId,
    updatedAt: serverTimestamp(),
  })
}

async function createExpense(db, ownerId, bookId, expense) {
  return addDoc(collection(db, 'expenses'), {
    amount: expense.amount,
    budgetBookId: bookId,
    category: expense.category,
    createdAt: serverTimestamp(),
    date: expense.date,
    note: expense.note,
    ownerId,
    title: expense.title,
  })
}

async function seedFirestore() {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const credentials = await signInAnonymously(auth)
  const ownerId = credentials.user.uid

  for (const book of seedBooks) {
    const bookReference = await createBudgetBook(db, ownerId, book)

    for (const expense of book.expenses) {
      await createExpense(db, ownerId, bookReference.id, expense)
    }
  }

  const archivedBookReference = await createBudgetBook(
    db,
    ownerId,
    archivedSeedBook,
  )
  await updateDoc(archivedBookReference, {
    archived: true,
    updatedAt: serverTimestamp(),
  })

  console.log('Seed data toegevoegd.')
  console.log(`Anonymous test user: ${ownerId}`)
  console.log('Start de app opnieuw of refresh de browser om de data te zien.')
}

seedFirestore().catch((error) => {
  console.error('Seeden is mislukt.')
  console.error(error)
  process.exitCode = 1
})
