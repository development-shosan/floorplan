/*
   src/DBMgr.ts
*/
import prisma from '../prisma/client';
import {InputUserInfo } from './Types/MemberParam';

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

    public async getUsers(): Promise<void> {
        await prisma.user.findMany({
            where: {  }
        });
    }

    public async createUser(userInfo: InputUserInfo): Promise<void> {
        await prisma.user.create({
            data: { ...userInfo }
        });
    }


    public async updateUser(userId: number, userInfo: InputUserInfo): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { ...userInfo }
        })
    }

    public async deleteUser(userId: number): Promise<void> {
        await prisma.user.update({
            where: { id: userId },
            data: { deleted: true }
        })
    }
}

