import mongoose from "mongoose";

/**
 * Shape of the cached connection. `conn` holds the resolved connection once
 * established; `promise` holds the in-flight connection attempt so concurrent
 * callers share a single `connect()` call instead of creating duplicates.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Attach the cache to `globalThis` so it survives Next.js hot module reloads
 * in development and is shared across serverless function invocations.
 */
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

/**
 * Validate the connection string up front so a misconfigured environment
 * fails fast (at import time) rather than with an obscure error on first use.
 */
// The `!` is safe: the guard below throws if the variable is missing. It is
// required because the narrowing from that guard does not flow into the
// `dbConnect` function body below.
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Reuse an existing cache if present, otherwise initialize and store it.
const cached: MongooseCache = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = cached;
}

/**
 * Connects to MongoDB, reusing an existing connection when possible.
 *
 * @returns The connected Mongoose instance.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Return the cached connection immediately if one is already open.
  if (cached.conn) {
    return cached.conn;
  }

  // Kick off a single connection attempt and cache its promise so concurrent
  // callers await the same attempt instead of each opening a new connection.
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      // Prevent buffering commands while disconnected so API routes fail fast
      // instead of hanging on unfulfilled queries.
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the failed promise so a subsequent call can retry the connection.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
