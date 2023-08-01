import fs from "fs";
import path from "path";
const pinoHttp = require("pino-http")();
import { isMainThread, Worker, workerData } from "worker_threads";

import { environment, logDir } from "../config.js";

// Create directory if it is not present
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logLevel = environment === "development" ? "debug" : "warn";
const fileTransport = pinoHttp.destination(path.join(logDir, "app.log"));

// Check if it's the main thread
if (isMainThread) {
  // Create and start a worker thread for logging
  const worker = new Worker(__filename, {
    workerData: { logFilePath: fileTransport },
  });
  worker.on("error", (err) => console.error("Worker error:", err));
  worker.on("exit", (code) => console.log("Worker exited with code:", code));
}

// Create pino-http logger middleware with custom configuration
const logger = pinoHttp({
  level: logLevel,
  prettyPrint: environment === "development",
  timestamp: pinoHttp.stdTimeFunctions.isoTime,
  redact: ["req.headers.authorization"],
  safe: true,
  // Set transport to null for the main thread (worker handles logging)
  transport: isMainThread
    ? environment === "development" ? pinoHttp.prettyStream() : null
    : workerData.logFilePath,
});

export default logger;
