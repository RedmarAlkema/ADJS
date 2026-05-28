import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { firebaseConfig } from '../src/services/firebaseConfig.js'

const seedBooks = [
  {
    description: 'Uitgebreide testdata met vaste lasten en dagelijkse uitgaven.',
    expenses: [
      ['2026-05-01', 'Huur', 'Wonen', 1240, 'Appartement'],
      ['2026-05-02', 'Supermarkt', 'Boodschappen', 78.45, 'Weekboodschappen'],
      ['2026-05-03', 'Trein', 'Vervoer', 18.2, 'Naar school'],
      ['2026-05-04', 'Apotheek', 'Zorg', 11.95, 'Medicijnen'],
      ['2026-05-05', 'Lunch', 'Boodschappen', 9.75, 'Broodjes'],
      ['2026-05-06', 'Streaming', 'Vrije tijd', 14.99, 'Abonnement'],
      ['2026-05-07', 'Bus', 'Vervoer', 6.4, 'Stadsrit'],
      ['2026-05-08', 'Sport', 'Vrije tijd', 24.5, 'Klimhal'],
      ['2026-05-09', 'Markt', 'Boodschappen', 31.1, 'Groente en fruit'],
      ['2026-05-10', 'Tandarts', 'Zorg', 42.75, 'Controle'],
      ['2026-05-11', 'Koffie', 'Overig', 4.5, 'Afspraak'],
      ['2026-05-12', 'Energie', 'Wonen', 168.3, 'Voorschot'],
      ['2026-05-13', 'Bioscoop', 'Vrije tijd', 17.95, 'Filmavond'],
      ['2026-05-14', 'Supermarkt', 'Boodschappen', 64.8, 'Aanvulling'],
    ],
    name: 'Huishouden mei',
  },
  {
    description: 'Planning en kosten voor een korte reis.',
    expenses: [
      ['2026-06-01', 'Hotel', 'Vrije tijd', 320, 'Aanbetaling'],
      ['2026-06-02', 'Brandstof', 'Vervoer', 75, 'Heenreis'],
      ['2026-06-03', 'Ontbijt', 'Boodschappen', 18.25, 'Bakker'],
      ['2026-06-04', 'Museum', 'Vrije tijd', 36, 'Tickets'],
      ['2026-06-05', 'Parkeren', 'Vervoer', 22.5, 'Centrum'],
      ['2026-06-06', 'Snacks', 'Boodschappen', 24.55, 'Onderweg'],
      ['2026-06-07', 'Souvenir', 'Overig', 15, 'Cadeau'],
    ],
    name: 'Vakantie juni',
  },
  {
    description: 'Losse studiekosten en schooldagen.',
    expenses: [
      ['2026-05-15', 'Boeken', 'Overig', 89.95, 'Studieboeken'],
      ['2026-05-16', 'Trein', 'Vervoer', 28.5, 'College'],
      ['2026-05-17', 'Lunch', 'Boodschappen', 8.75, 'Kantine'],
      ['2026-05-18', 'Software', 'Overig', 12, 'Studentenlicentie'],
      ['2026-05-19', 'Koffie', 'Vrije tijd', 3.8, 'Studiegroep'],
    ],
    name: 'Studie',
  },
]

const archivedSeedBook = {
  description: 'Gearchiveerd voorbeeld. De inhoud hoort verborgen te blijven.',
  expenses: [
    ['2026-04-01', 'Oude huur', 'Wonen', 1200, 'Verborgen archiefdata'],
    ['2026-04-02', 'Oude boodschappen', 'Boodschappen', 52, 'Niet tonen'],
  ],
  name: 'Oud boekje april',
}

function getArgumentValue(name) {
  const argument = process.argv.find((value) => value.startsWith(`${name}=`))

  return argument?.slice(name.length + 1) ?? ''
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function getParticipantEmails() {
  return getArgumentValue('--participants')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean)
}

async function signInForSeed(auth) {
  const email = getArgumentValue('--email')
  const password = getArgumentValue('--password')

  if (email && password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  return signInAnonymously(auth)
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
  const [date, title, category, amount, note] = expense

  return addDoc(collection(db, 'expenses'), {
    amount,
    budgetBookId: bookId,
    category,
    createdAt: serverTimestamp(),
    date,
    note,
    ownerId,
    title,
  })
}

async function addParticipant(db, ownerId, bookId, email) {
  return setDoc(doc(db, 'budgetBooks', bookId, 'participants', email), {
    budgetBookId: bookId,
    createdAt: serverTimestamp(),
    email,
    ownerId,
  })
}

async function seedBook(db, ownerId, book, participantEmails = []) {
  const bookReference = await createBudgetBook(db, ownerId, book)

  for (const expense of book.expenses) {
    await createExpense(db, ownerId, bookReference.id, expense)
  }

  for (const participantEmail of participantEmails) {
    await addParticipant(db, ownerId, bookReference.id, participantEmail)
  }

  return bookReference
}

async function seedFirestore() {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)
  const credentials = await signInForSeed(auth)
  const ownerId = credentials.user.uid
  const participantEmails = getParticipantEmails()

  for (const [index, book] of seedBooks.entries()) {
    await seedBook(db, ownerId, book, index === 0 ? participantEmails : [])
  }

  const archivedBookReference = await seedBook(db, ownerId, archivedSeedBook)
  await updateDoc(archivedBookReference, {
    archived: true,
    updatedAt: serverTimestamp(),
  })

  console.log('Seed data toegevoegd.')
  console.log(`Seed user: ${ownerId}`)

  if (participantEmails.length > 0) {
    console.log(`Deelnemers toegevoegd: ${participantEmails.join(', ')}`)
  }
}

seedFirestore().catch((error) => {
  console.error('Seeden is mislukt.')
  console.error(error)
  process.exitCode = 1
})
