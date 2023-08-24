import fs from "fs";
import path from "path";
import "pino-pretty";
import { pino } from "pino";
import { isMainThread, Worker, workerData } from "worker_threads";
import { __dirname, __filename, environment, logDir } from "../config.js";

// Create directory if it is not present

// const LogDir = `${__dirname}/logs`;
//

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logLevel = environment === "development" ? "debug" : "warn";
// const fileTransport = pino.destination(path.join(logDir, "app.log"));

// Check if it's the main thread
if (isMainThread) {
  // Create and start a worker thread for logging
  const worker = new Worker(__filename, {
    workerData: { logFilePath: path.join(logDir, "app.log") },
  });
  worker.on("error", (err) => console.error("Worker error:", err));
  worker.on("exit", (code) => console.log("Worker exited with code:", code));
}

// Create pino-http logger middleware with custom configuration
// const loggerTransport = isMainThread
//   ? environment === "development"
//     ? pino.transport({ target: "pino-pretty" })
//     : null
//   : pino.transport({ target: workerData.logFilePath });

const logger = pino({
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ["req.headers.authorization"],
  safe: true,
  // Set transport to null for the main thread (worker handles logging)
  // transport: isMainThread
  //   ? environment === "development" ? pinoPretty() : null
  //   : workerData.logFilePath,
  transport: {
    target: isMainThread
      ? environment === "development" ? "pino-pretty" : null
      : workerData.logFilePath,
  },
  /* transport: loggerTransport, */
});

export default logger;
