import { MongoClient } from 'mongodb';

declare const global: {
  _mongoClientPromise: Promise<MongoClient> | undefined;
};

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NEXT_PUBLIC_ENVIROMENT === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
