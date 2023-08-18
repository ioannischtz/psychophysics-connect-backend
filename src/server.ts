import express from "express";
import initDB from "./db/initDB.js";
import userRoutes from "./routes/users.js";
import { port } from "./config.js";
import bodyParser from "./middleware/bodyParser.js";
import { Middleware } from "middleware.js";

const connection = await initDB();

const app = express();

// const parseBody: Middleware[] = bodyParser({
//   jsonLimit: "1mb",
//   formLimit: "5mb",
//   textLimit: "256kb",
//   encoding: "utf-8",
// });

app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("Server up!"));

app
  .listen(port, () => console.info(`Running on port:${port}`))
  .on("error", (error) => console.error(error));
