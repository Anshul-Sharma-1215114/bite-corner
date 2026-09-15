import type { Request, Response, NextFunction } from "express";
import type { Role } from "@bite-corner/shared";
import { verifyAuthToken } from "../utils/jwt";

export const COOKIE_NAME = "bc_token";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role };
    }
  }
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[COOKIE_NAME] ?? null;
}

// requireAuth() with no args means "any authenticated role"; pass specific
// roles to restrict further (e.g. requireAuth("ADMIN")).
export function requireAuth(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
      const payload = verifyAuthToken(token);
      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Not authorized" });
      }
      req.user = { id: payload.id, role: payload.role };
      next();
    } catch {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
  };
}
