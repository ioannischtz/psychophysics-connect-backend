import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

export const TIME_CONSTANTS = {
  DAY_HOURS: 24,
  HOUR_MINS: 60,
  MIN_SECS: 60,
  SEC_MILLS: 1000,
} as const;

export const DEFAULTS = {
  NODE_ENV: "development",
  PORT: "5000",
  CORS_URL: "*",
  CORS_MAXAGE: "31536000",
  CORS_METHODS: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
  CORS_HEADERS: ["Content-Type", "Authorization", "Origin", "Accept"],
  CORS_CREDENTIALS: true,
  TZONE: "UTC",
  JWT_SECRET: "Shhh",
  JWT_VALIDITY_SEC: (
    1 *
    TIME_CONSTANTS.DAY_HOURS *
    TIME_CONSTANTS.HOUR_MINS *
    TIME_CONSTANTS.MIN_SECS
  ).toString(),
  DB_USER: "",
  DB_PASSWORD: "",
  DB_HOST: "",
  DB_NAME: "",
  DB_PORT: "",
  DB_MEMORY: false,
  MONGO_URI: "",
  LOG_DIR: `${__dirname}/logs`,
  MULTER_DEST_PATH: `${__dirname}/temp`,
  LIMIT_CONSECUTIVE_ATTEMPTS: "10",
  LIMIT_ATTEMPTS_PER_DAY: "100",
};

export const environment = process.env.NODE_ENV || DEFAULTS.NODE_ENV;
export const port = process.env.PORT || DEFAULTS.PORT;

export const corsUrl = process.env.CORS_URL || DEFAULTS.CORS_URL;
export const corsMaxage = parseInt(
  process.env.CORS_MAXAGE || DEFAULTS.CORS_MAXAGE,
);
export const corsMethods = process.env.CORS_METHODS || DEFAULTS.CORS_METHODS;
export const corsHeaders = process.env.CORS_HEADERS || DEFAULTS.CORS_HEADERS;
export const corsCredentials = process.env.CORS_CREDENTIALS ||
  DEFAULTS.CORS_CREDENTIALS;

export const timezone = process.env.TZONE || DEFAULTS.TZONE;
export const jwtSecret = process.env.JWT_SECRET || DEFAULTS.JWT_SECRET;
export const jwtValiditySecs = parseInt(
  process.env.JWT_VALIDITY_SEC || DEFAULTS.JWT_VALIDITY_SEC,
);
export const logDir = process.env.LOG_DIR || DEFAULTS.LOG_DIR;
export const multerDestPath = process.env.MULTER_DEST_PATH ||
  DEFAULTS.MULTER_DEST_PATH;

export const limitConsecutiveAttempts = parseInt(
  process.env.LIMIT_CONSECUTIVE_ATTEMPTS || DEFAULTS.LIMIT_CONSECUTIVE_ATTEMPTS,
);
export const limitAttemptsPerDay = parseInt(
  process.env.LIMIT_ATTEMPTS_PER_DAY || DEFAULTS.LIMIT_ATTEMPTS_PER_DAY,
);

export const db = {
  user: process.env.DB_USER || DEFAULTS.DB_USER,
  password: process.env.DB_PASSWORD || DEFAULTS.DB_PASSWORD,
  host: process.env.DB_HOST || DEFAULTS.DB_HOST,
  name: process.env.DB_NAME || DEFAULTS.DB_NAME,
  port: process.env.DB_PORT || DEFAULTS.DB_PORT,
  memory: process.env.DB_MEMORY || DEFAULTS.DB_MEMORY,
  mongo_uri: process.env.MONGO_URI || DEFAULTS.MONGO_URI,
};
