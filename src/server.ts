import express, { CookieOptions } from "express";
import initDB from "./db/initDB.js";
import userRoutes from "./routes/users.js";
import homepageRoutes from "./routes/homepage.js";
import { environment, jwtSecret, port } from "./config.js";
import bodyParser from "./middleware/bodyParser.js";
import { Middleware } from "middleware.js";
import createSession from "./middleware/session.js";

const connection = await initDB();

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

// Enable the cookie/browser session middleware
app.use(createSession(defaultSessionConfig));

// Enable the api routes
app.use("/api/users", userRoutes);
app.use("/api/homepage", homepageRoutes);

app.get("/", (req, res) => res.send("Server up!"));

app
  .listen(port, () => console.info(`Running on port:${port}`))
  .on("error", (error) => console.error(error));
