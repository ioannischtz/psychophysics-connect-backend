import mongoose, { Connection, Error } from "mongoose";
import { db } from "../config.js";

const dbURI = `mongodb+srv://${db.user}:${
  encodeURIComponent(db.password)
}@${db.host}/${db.name}?retryWrites=true&w=majority`;

async function initDB(): Promise<Connection> {
  // Create dB connection
  try {
    const connectionObj = await mongoose.connect(dbURI);
    console.info(`MongoDB connected: ${connectionObj.connection.host}`);
  } catch (error: any) {
    if (error instanceof Error) {
      console.error(`DB connection Error: ${error.message}`);
    } else {
      console.error(`Error: ${error}`);
    }
  }

  // Setup dB connection events

  // Connection: Success
  mongoose.connection.on("connected", () => {
    console.debug(`MongoDB connection open: ${dbURI}`);
  });

  // Connection: Error
  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB connection error: ${error}`);
  });

  // Connection: Disconnect
  mongoose.connection.on("disconnected", () => {
    console.info(`MongoDB connection disconnected`);
  });

  // Node process: End
  process.on("SIGINT", () => {
    setTimeout(() => {
      console.info(
        "MongoDB connection disconnected due to Node process termination",
      );
      mongoose.disconnect();
      process.exit(0);
    }, 500);
  });

  return mongoose.connection;
}

export default initDB;
