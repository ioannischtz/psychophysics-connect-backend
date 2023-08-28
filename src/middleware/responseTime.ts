import { NextFunction, Request, Response } from "express";
import { Middleware } from "middleware.js";
import { OutgoingHttpHeader, OutgoingHttpHeaders } from "node:http";
import logger from "./logger.js";

interface ResponseTimeOpts {
  digits: number;
  doConvertToSecs: boolean;
  includeMethod: boolean;
  includePath: boolean;
  formatStr: string;
  onFinish: (respTime: string) => void;
}

export default (options: Partial<ResponseTimeOpts>): Middleware => {
  const {
    digits = 0,
    doConvertToSecs = false,
    includeMethod = true,
    includePath = true,
    onFinish = undefined,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    let defaultStr = "%method - %path: %responseTime%suffix";
    if (!includeMethod) defaultStr = defaultStr.replace("%method - ", "");
    if (!includePath) defaultStr = defaultStr.replace(" - %path", "");
    const suffixStr = doConvertToSecs ? "s" : "ms";
    defaultStr = defaultStr.replace("%suffix", suffixStr);
    let { formatStr = defaultStr } = options;

    formatStr = includeMethod && !formatStr.includes("%method")
      ? `%method - ${formatStr}`
      : formatStr;

    formatStr = includePath && !formatStr.includes("%path")
      ? `%path: ${formatStr}`
      : formatStr;
    const startTime = Date.now();
    let deltaTimeStr: string;

    let headersModified = false;

    // Override the res.send method to intercept the send
    const originalSend = res.send;

    res.send = function (body?: any) {
      if (!headersModified) {
        headersModified = true;
        let deltaTime = Date.now() - startTime;
        deltaTime = doConvertToSecs ? deltaTime / 1000 : deltaTime;
        deltaTimeStr = deltaTime.toFixed(digits);

        formatStr = formatStr
          .replace("%method", req.method)
          .replace("%path", req.path)
          .replace("%responseTime", deltaTimeStr);

        // Enable the 'X-Response-Time' (in ms) for the response header.
        res.setHeader("X-Response-Time", formatStr);

        // Call the optional onFinish callback with the response time as a string
        if (onFinish !== undefined) onFinish(deltaTimeStr);

        logger.info(formatStr);

        headersModified = true;
      }
      // Call the original res.writeHead method
      return originalSend.apply(res, [body]);
    };

    next();
  };
};
