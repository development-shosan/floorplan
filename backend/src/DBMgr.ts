/*
   src/DBMgr.ts
*/
import prisma from '../prisma/client';

export default class DBMgr {
    /**
     * Get user info using email address.
     *
     * @param email - email address
     * @return Object - user information
     */
    public async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                password: true,
                role: true
            },
            where: {
                email
            }
        });
    }
}

