import { createMiddleware } from 'hono/factory';
import { UnauthorizedException } from '@/exceptions/auth.exception';
import { verifyToken } from "@/utils/verify-token";
import { AppVariables } from '@/types';

export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(
    async (c, next) => {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('No Authorization header provided');
        }

        const token = authHeader.split(' ')[1];
        if (!token || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }

        try {
            const payload = await verifyToken(token);
            const user = {
                email: payload.sub,
                scopes: payload.scopes,
                jti: payload.jti,
                nonce: payload.nonce,
                iat: payload.iat,
                exp: payload.exp,
            }
            c.set('user', user as AppVariables['user']);
            await next();
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
);