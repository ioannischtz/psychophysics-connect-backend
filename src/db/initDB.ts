import mongoose, { Connection, Error } from "mongoose";
import { db } from "../config.js";
import logger from "../middleware/logger.js";

const dbURI = `mongodb+srv://${db.user}:${
  encodeURIComponent(db.password)
}@${db.host}/${db.name}?retryWrites=true&w=majority`;

// Create dB connection
mongoose
  .connect(dbURI)
  .then(() => {
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  })
  .catch((error) => {
    if (error instanceof Error) {
      logger.error(`DB connection Error: ${error.message}`);
    } else {
      logger.error(`Error: ${error}`);
    }
  });

// Setup dB connection events

// Connection: Success
mongoose.connection.on("connected", () => {
  logger.debug(`MongoDB connection open: ${dbURI}`);
});

// Connection: Error
mongoose.connection.on("error", (error) => {
  logger.error(`MongoDB connection error: ${error}`);
});

// Connection: Disconnect
mongoose.connection.on("disconnected", () => {
  logger.info(`MongoDB connection disconnected`);
});

// Node process: End
process.on("SIGINT", () => {
  setTimeout(() => {
    logger.info(
      "MongoDB connection disconnected due to Node process termination",
    );
    mongoose.disconnect();
    process.exit(0);
  }, 500);
});

export const dbConnection = mongoose.connection;
