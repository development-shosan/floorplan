import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { env } from '../../env';
import { createAuthToken } from '../commonUtils';
import { AuthTokenPayload } from '../Types/LoginParam';

declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
        }
    }
}

// Token validation and refresh middleware
export const refreshTokenIfValid = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
        res.status(403).send('Authorization header missing or malformed');
        return;
    }

    jwt.verify(token, env.TOKEN_SECRET, (err: VerifyErrors | null, decoded: any) => {
        if (err || !decoded) {
            res.status(403).send('Invalid or expired token');
            return;
        }

        const { exp, iat, ...payload } = decoded;
        req.user = payload as AuthTokenPayload;

        const newToken = createAuthToken(payload);
        res.setHeader('Authorization', newToken);
        next();
    });
};

export const authorizeRoles = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user: AuthTokenPayload | undefined = req.user;

        if (!user) {
            res.status(403).send('No payload found in token');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            res.status(403).send('Access denied: insufficient permissions');
            return;
        }
        next();
    };
};
