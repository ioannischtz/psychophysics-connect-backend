import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export class MockMongoMemoryDb {
  private static instance: MockMongoMemoryDb;
  private mongod: MongoMemoryServer | null;

  private constructor() {
    this.mongod = null;
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = new MockMongoMemoryDb();
      this.instance.mongod = await MongoMemoryServer.create();
    }
    return this.instance;
  }

  async start() {
    if (this.mongod !== null) {
      const uri = this.mongod.getUri();
      await mongoose.connect(uri);
    }
  }

  async stop() {
    if (this.mongod !== null) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await this.mongod.stop();
    }
  }

  async clearCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}
