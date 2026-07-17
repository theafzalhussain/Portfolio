import mongoose from 'mongoose'

/**
 * Reuses a single Mongoose connection across requests / hot reloads.
 *
 * In Next.js (dev mode especially), every file change reloads modules,
 * which would otherwise call mongoose.connect() again and again and
 * exhaust MongoDB Atlas' connection limit. Caching the connection on
 * `global` avoids that.
 */

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null }

if (!global._mongooseCache) {
  global._mongooseCache = cached
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error(
      'Missing MONGODB_URI environment variable. Add your MongoDB Atlas connection string to .env.local',
    )
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Reset so the next request can retry instead of being stuck on a rejected promise.
    cached.promise = null
    throw err
  }

  return cached.conn
}

export default connectToDatabase
