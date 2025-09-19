/*
   src/DSMgr.ts
*/
import DBMgr from './DBMgr';
import { LoginResult } from './Types/LoginParam';
import {InputUserInfo } from './Types/MemberParam';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { LoginError } from './ApplicationErrors';
import { AppConstant } from './SpecificCommons';
import { env } from '../env';
import type { StringValue } from 'ms';
import { Prisma } from "@prisma/client";

export default class DSMgr {
    private dbMgr: DBMgr;

    constructor() {
        this.dbMgr = new DBMgr();
    }

    /**
     * Login authentication.
     *
     * @param email - email address
     * @param password - user password
     * @return Object<LoginResult>
     */
    public async login( email: string, password: string ): Promise<LoginResult> {
        try {
            const user = await this.dbMgr.getUserByEmail(email);
            // The password column allows NULL values.
            if (!user || !user.password) {
                throw new LoginError('The email is incorrect.');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new LoginError('The password is incorrect.');
            }

            const token = jwt.sign(
                {},
                env.TOKEN_SECRET,
                { expiresIn: env.TOKEN_EXPIRES as StringValue}
            );

            return {
                id: user.id,
                name: user.name || '',
                role: user.role,
                token
            };
        } catch (err) {
            if (err instanceof LoginError) {
                console.error('Login failed', err);
            }
            throw err;
        }
    }

    public async getUsers(): Promise<void> {
        try {
            await this.dbMgr.getUsers();
        } catch (err) {

            throw err;

        }
    }

    public async createUser(inputUserInfo: InputUserInfo): Promise<void> {

        try {
            const hashedPassword = await bcrypt.hash(inputUserInfo.password, AppConstant.BCRYPT.SALT_ROUNDS);
            const userInfo: InputUserInfo = { ...inputUserInfo, password: hashedPassword };
            await this.dbMgr.createUser(userInfo);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002") {
                    // P2002 = Unique constraint violation
                    const target = err.meta?.target;
                    if (Array.isArray(target) && target.includes("email")) {
                        throw new Error("Email already exists");
                }
            }
            throw err;
        }
    }

    public async updateUser(userId: number, inputUserInfo: InputUserInfo): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(inputUserInfo.password, AppConstant.BCRYPT.SALT_ROUNDS);
            const userInfo: InputUserInfo = { ...inputUserInfo, password: hashedPassword };
            await this.dbMgr.updateUser(userId, userInfo);
        } catch (err) {
            // TODO email error setting??
            // new Error("Email already exists");
            throw err;

        }
    }

    public async deleteUser(userId: number): Promise<void> {
        try {
            await this.dbMgr.deleteUser(userId);
        } catch (err) {
            throw err;
        }
    }
}