/*
  commonUtils.ts
 */
import jwt from 'jsonwebtoken';
import {AuthTokenPayload} from './types/LoginParam';
import {env} from '../env';
import type {StringValue} from 'ms';


// Create JWT access token
export const createAuthToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(
        payload,
        env.TOKEN_SECRET,
        { expiresIn: env.TOKEN_EXPIRES as StringValue}
    );
}