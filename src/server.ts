import express, { CookieOptions } from "express";
import "./db/initDB.js";
import userRoutes from "./routes/users.js";
import homepageRoutes from "./routes/homepage.js";
import dashboardRoutes from "./routes/dashboard.js";
import { environment, jwtSecret, port } from "./config.js";
import createSession from "./middleware/session.js";
import cors from "./middleware/cors.js";
import errorHandler, { notFound } from "./middleware/errors.js";
import compression from "./middleware/compression.js";
import queryParser from "./middleware/queryParser.js";
import rateLimiter from "./middleware/rateLimiter.js";
import security from "./middleware/security.js";
import responseTime from "./middleware/responseTime.js";

const app = express();

// const parseBody: Middleware[] = bodyParser({
//   jsonLimit: "1mb",
//   formLimit: "5mb",
//   textLimit: "256kb",
//   encoding: "utf-8",
// });

const defaultSessionConfig = {
  key: "user.sess",
  cookieOpts: {
    httpOnly: true,
    maxAge: 86400000,
    secure: environment === "production",
    signed: true, // Important: enable signed cookies,
    sameSite: "strict",
  } as CookieOptions,
  secret: jwtSecret, // Use the jwtSecret from ../config.js
};

// Enable the compression middleware
app.use(compression());

// Enable the cors middleware
app.use(cors());

// Enable the rateLimiter
// app.use(rateLimiter.inMemoryBlockMiddleware);

// Enable the security middleware
app.use(security());

// Enable the queryParser middleware
app.use(queryParser());

// Enable the cookie/browser session middleware
app.use(createSession(defaultSessionConfig));

// Enable the response-time middleware
app.use(
  responseTime({
    digits: 0,
    doConvertToSecs: false,
    includeMethod: true,
    includePath: true,
  }),
);

// Enable the api routes
app.use("/api/users", userRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => res.send("Server up!"));

// Forward 404 to error handler: notFound throws a new ApiError(NOT_FOUND)
app.use(notFound);

// Enable the error handler middleware
app.use(errorHandler);

app
  .listen(port, () => console.info(`Running on port:${port}`))
  .on("error", (error) => console.error(error));
