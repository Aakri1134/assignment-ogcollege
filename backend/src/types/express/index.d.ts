import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        emailVerified: boolean;
        id?: string;
        email?: string;
      };
    }
  }
}

export {};