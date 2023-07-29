import express, { NextFunction, Request, Response } from "express";
import { Middleware } from "middleware.js";

const defaultConfig = {
  jsonLimit: "3mb",
  formLimit: "10mb",
  textLimit: "256kb",
  encoding: "utf-8",
};

export type Config = typeof defaultConfig;
export default function bodyParser(
  config: Config = defaultConfig,
): Middleware[] {
  const { jsonLimit, formLimit, textLimit, encoding } = config;

  const charsetEncoding: Middleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const charsetEncoding = req.acceptsCharsets(encoding) || encoding;
    req.setEncoding(charsetEncoding as BufferEncoding);
    next();
  };
  const jsonEncoded: Middleware = express.json({ limit: jsonLimit });
  const urlEncoded: Middleware = express.urlencoded({ limit: formLimit });
  const textEncoded: Middleware = express.text({
    limit: textLimit,
    defaultCharset: encoding,
  });

  return [charsetEncoding, jsonEncoded, urlEncoded, textEncoded];
}
