import { SessionData } from "src/middleware/session.ts";
export {};

declare global {
  namespace Express {
    export interface Request {
      sessionData: SessionData;
    }
    export interface Response {
      setSessionData(data: SessionData): void;
    }
  }
}
