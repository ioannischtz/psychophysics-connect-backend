import cors from "cors";
import { Middleware } from "middleware.js";
import {
  corsCredentials,
  corsHeaders,
  corsMaxage,
  corsMethods,
  corsUrl,
} from "../config.js";

export default (): Middleware => {
  return cors({
    origin: corsUrl,
    maxAge: Number(corsMaxage),
    allowedHeaders: corsHeaders,
    methods: corsMethods,
    credentials: Boolean(corsCredentials),
    optionsSuccessStatus: 200,
  });
};
