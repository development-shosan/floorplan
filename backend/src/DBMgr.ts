/*
   src/DBMgr.ts
*/
import prisma from '../prisma/client';
import { CreateUserDataInput, UpdateUserDataInput, UserInfo } from './types/UserParam';
import { AuthTokenPayload, UserByEmail } from './types/LoginParam';
import { Prisma, Role } from '@prisma/client';
import { createLogger } from './logger';
import { CompanyInfo, CreateCompanyDataInput, UpdateCompanyDataInput } from './types/CompanyParam';

export default class DBMgr {
    private logger;

    constructor() {
        this.logger = createLogger('DBMgr');
    }
    /**
     * Get user info using email address.
     *
     * @param email - email address
     * @returns {UserByEmail | null} The user info if found, otherwise null
     */
    public async getUserByEmail(email: string): Promise<UserByEmail | null> {
        this.logger.info(`getUserByEmail('${email}')`);

        return prisma.user.findFirst({
            select: {
                id: true,
                name: true,
                password: true,
                role: true,
                companyId: true
            },
            where: {
                email,
                status: true,
                deleted: false
            }
        });
    }

    /**
     * Retrieves a list of users.
     *
     * @param authPayload - The authorization token payload of the requester
     * @returns {UserInfo[] | null} - A list of users, or null if no users are found
     */
    public async getUsers(authPayload: AuthTokenPayload): Promise<UserInfo[] | null> {
        this.logger.info(`getUsers(${JSON.stringify(authPayload)})`);

        const where: Prisma.UserWhereInput = {};
        if (Role.SYSTEM_ADMIN === authPayload.role) {
            where.role = { not: Role.SYSTEM_ADMIN };
            where.deleted = false;
        } else if (Role.COMPANY_ADMIN === authPayload.role) {
            where.role = Role.MEMBER;
            where.companyId = authPayload.companyId;
            where.status = true;
            where.deleted = false;
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
                department: true,
                phoneNumber: true,
                createdAt: true,
                createdById: true,
                updatedAt: true,
                updatedById: true,
                status: true,
                company: { select: { name: true } }
            },
            where,
            orderBy: {
                id: 'asc'
            }
        });

        return users.map((user: any) => ({
            ...user,
            companyName: user.company?.name ?? null,
            company: undefined
        }));
    }

    /**
     * Creates a new user.
     *
     * @param createData - The user data to create the user with
     */
    public async createUser(createData: CreateUserDataInput): Promise<void> {
        this.logger.info('createUser()');

        await prisma.user.create({
            data: { ...createData }
        });
    }

    /**
     * Updates user data by user ID.
     *
     * @param userId - The ID of the user to update
     * @param updateData - The new data to apply to the user
     */
    public async updateUser(userId: number, updateData: UpdateUserDataInput): Promise<void> {
        this.logger.info(`updateUser(${userId}, ${JSON.stringify(updateData)})`);

        await prisma.user.update({
            where: { id: userId },
            data: { ...updateData }
        });
    }

    /**
     * Changes the user's password.
     *
     * @param userId - The ID of the user whose password will be changed
     * @param newPassword - The new hashed password to set for the user
     */
    public async changeUserPassword(userId: number, newPassword: string): Promise<void> {
        this.logger.info(`changeUserPassword(${userId}, '${newPassword}')`);

        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword }
        });
    }

    /**
     * Retrieves the password of a user by user ID and company ID.
     *
     * @param userId - The ID of the user
     * @param companyId - The ID of the company the user belongs to
     * @returns The user's password if found, otherwise null
     */
    public async getUserPasswordByUserId(
        userId: number,
        companyId: number
    ): Promise<string | null> {
        this.logger.info(`getUserPasswordByUserId(${userId}, ${companyId})`);

        const result = await prisma.user.findFirst({
            select: { password: true },
            where: {
                id: userId,
                companyId: companyId
            }
        });
        return result?.password ?? null;
    }

    /**
     * Retrieves the company ID associated with a given user ID.
     *
     * @param userId - The ID of the user
     * @returns The company ID if found, otherwise null
     */
    public async getUserCompanyIdByUserId(userId: number): Promise<number | null> {
        this.logger.info(`getUserCompanyIdByUserId(${userId})`);

        const result = await prisma.user.findUnique({
            select: { companyId: true },
            where: { id: userId }
        });
        return result?.companyId ?? null;
    }

    /**
     * Retrieves a list of companies.
     *
     * @returns A list of companies, or null if no companies are found
     */
    public async getCompanies(): Promise<CompanyInfo[] | null> {
        this.logger.debug('getCompanies()');

        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                nameKana: true,
                representative: true,
                email: true,
                status: true,
                postalCode: true,
                prefecture: true,
                city: true,
                streetAddress: true,
                createdAt: true,
                createdById: true,
                updatedAt: true,
                updatedById: true,
                _count: {
                    select: {
                        members: {
                            where: { deleted: false }
                        }
                    }
                }
            },
            where: {
                deleted: false
            },
            orderBy: {
                id: 'asc'
            }
        });

        return companies.map((company: any) => ({
            ...company,
            members: company._count.members,
            _count: undefined
        }));
    }

    /**
     * Creates a new company.
     *
     * @param createData - The company data to create the company with
     */
    public async createCompany(createData: CreateCompanyDataInput): Promise<void> {
        this.logger.debug(`createCompany(${JSON.stringify(createData)})`);

        await prisma.company.create({
            data: { ...createData }
        });
    }

    /**
     * Updates company data by company ID.
     *
     * @param companyId - The ID of the company to update
     * @param updateData - The new data to apply to the company
     */
    public async updateCompany(
        companyId: number,
        updateData: UpdateCompanyDataInput
    ): Promise<void> {
        this.logger.debug(`updateCompany(${companyId}, ${JSON.stringify(updateData)})`);

        await prisma.company.update({
            where: { id: companyId },
            data: { ...updateData }
        });
    }

    /**
     * Remove a company and all users associated with it.
     *
     * @param companyId - The ID of the company to update
     */
    public async removeCompanyWithUsers(companyId: number): Promise<void> {
        this.logger.debug(`removeCompanyWithUsers(${companyId})`);

        await prisma.$transaction(async (tx) => {
            await tx.company.update({
                where: { id: companyId },
                data: { deleted: true }
            });

            await tx.user.updateMany({
                where: { companyId },
                data: { deleted: true }
            });
        });
    }
}
