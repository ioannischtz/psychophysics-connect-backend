import { RateLimiterRedis } from "rate-limiter-flexible";
import { NextFunction, Request, Response } from "express";
import { Redis } from "ioredis";
import { limitAttemptsPerDay, limitConsecutiveAttempts } from "../config.js";
import { ProtectedRequest } from "../policies/isAuthed.js";

const redisClient = new Redis({ enableOfflineQueue: false });

const maxWrongAttemptsByIPperDay = limitAttemptsPerDay as number;

const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_ip_per_day",
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const slowBruteByIPMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const ipAddr = req.ip;

  try {
    const resSlowByIP = await limiterSlowBruteByIP.get(ipAddr);

    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      const retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(retrySecs));
      res.status(429).send("Too Many Requests");
    } else {
      next();
    }
  } catch (error) {
    console.error("Error in slowBruteByIPMiddleware:", error);
    res.status(500).end();
  }
};

const maxConsecutiveFailsByUsernameAndIP = limitConsecutiveAttempts as number;

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_consecutive_username_and_ip",
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
  blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username: string, ip: string): string =>
  `${username}_${ip}`;

const consecutiveFailsByUsernameAndIPMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const ipAddr = req.ip;
  const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

  try {
    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
      limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
      limiterSlowBruteByIP.get(ipAddr),
    ]);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      res.set("Retry-After", String(retrySecs));
      res.status(429).send("Too Many Requests");
    } else {
      next();
    }
  } catch (error) {
    console.error("Error in consecutiveFailsByUsernameAndIPMiddleware:", error);
    res.status(500).end();
  }
};

const inMemoryBlockMiddleware = (
  inMemoryBlockDuration: number,
): (req: Request, res: Response, next: NextFunction) => void => {
  const inMemoryBlockByIP = new Set<string>();
  return (req: ProtectedRequest, res: Response, next: NextFunction): void => {
    const key = req.user._id ? req.user._id : req.ip;
    if (inMemoryBlockByIP.has(key)) {
      res.status(429).send("Too Many Requests");
    } else {
      inMemoryBlockByIP.add(key);
      setTimeout(() => {
        inMemoryBlockByIP.delete(key);
      }, inMemoryBlockDuration);
      next();
    }
  };
};

export {
  consecutiveFailsByUsernameAndIPMiddleware,
  inMemoryBlockMiddleware,
  slowBruteByIPMiddleware,
};
