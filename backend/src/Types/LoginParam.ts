import { Role } from '@prisma/client';

export type UserByEmail = {
    id: number; // user id
    name: string | null;
    password: string | null;
    role: Role;
    companyId: number;
};

export type LoginResult = Pick<UserByEmail, 'id' | 'name'> & {
    token: string;
};

export type AuthTokenPayload = Pick<UserByEmail, 'role' | 'companyId'> & {
    userId: number;
};
