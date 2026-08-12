import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached =
  global.mongooseCache ??
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });
  }

  try {
    cached.conn = await cached.promise;

    if (process.env.NODE_ENV === "development") {
      console.log("MongoDB connected");
    }

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}