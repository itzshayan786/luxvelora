import { MongoClient } from 'mongodb'

let client
let db

export async function getDb() {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is not configured')
  }

  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
  }

  if (!db) {
    await client.connect()
    db = client.db(process.env.DB_NAME || 'velora')
  }

  return db
}
