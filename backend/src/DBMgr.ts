/*
   src/DBMgr.ts
*/
import prisma from '../prisma/client';
import {
    CreateUserDataInput,
    UpdateUserDataInput,
    UserByUserId,
    UserInfo
} from './Types/UserParam';
import { AuthTokenPayload, UserByEmail } from './Types/LoginParam';
import { Prisma, Role } from '@prisma/client';
import { createLogger } from './logger';
import { CompanyInfo, CreateCompanyDataInput, UpdateCompanyDataInput } from './Types/CompanyParam';
import { HistoryChildInfo, HistoryInfo } from './Types/HistoryParam';
import {
    CreateFloorPlanDataInput,
    CreateHistoryChildDataInput,
    CreateHistoryParentDataInput,
    FloorPlanGenerationJobInfor,
    HistoryChildFloorplanData,
    LayoutConditions,
    RegenerateHistoryParent,
    RequestPayload
} from './Types/FloorplanParam';

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
        this.logger.debug(`getUserByEmail('${email}')`);

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
        this.logger.debug(`getUsers(${JSON.stringify(authPayload)})`);

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
        this.logger.debug('createUser()');

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
        this.logger.debug(`updateUser(${userId}, ${JSON.stringify(updateData)})`);

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
        this.logger.debug(`changeUserPassword(${userId}, '${newPassword}')`);

        await prisma.user.update({
            where: { id: userId },
            data: { password: newPassword }
        });
    }

    /**
     * Retrieves a user by their unique user ID.
     *
     * @param userId - The ID of the user
     * @returns A promise that resolves to the user's role, companyId, otherwise null
     */
    public async getUserByUserId(userId: number): Promise<UserByUserId | null> {
        this.logger.debug(`getUserByUserId(${userId}})`);

        return prisma.user.findUnique({
            select: {
                role: true,
                companyId: true
            },
            where: {
                id: userId
            }
        });
    }

    /**
     * Retrieves the company ID associated with a given user ID.
     *
     * @param userId - The ID of the user
     * @returns The company ID if found, otherwise null
     */
    public async getUserCompanyIdByUserId(userId: number): Promise<number | null> {
        this.logger.debug(`getUserCompanyIdByUserId(${userId})`);

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
     * Gets a list of histories.
     *
     * @param userId - The ID of the user requesting the data
     * @param authPayload - The authorization token payload of the requester
     * @returns The list of histories
     */
    public async getHistories(
        userId: number,
        authPayload: AuthTokenPayload
    ): Promise<HistoryInfo[] | null> {
        this.logger.debug(`getHistories(${userId}, ${JSON.stringify(authPayload)}})`);

        const where: Prisma.HistoryParentWhereInput = {
            deleted: false,
            createdBy: {
                deleted: false,
                company: {
                    deleted: false
                }
            }
        };

        if (Role.COMPANY_ADMIN === authPayload.role) {
            where.createdBy = {
                deleted: false,
                companyId: authPayload.companyId,
                company: {
                    deleted: false
                }
            };
        } else if (Role.MEMBER === authPayload.role) {
            where.createdBy = {
                id: userId,
                deleted: false,
                companyId: authPayload.companyId,
                company: {
                    deleted: false
                }
            };
        }

        const histories = await prisma.historyParent.findMany({
            select: {
                id: true,
                title: true,
                totalFavoriteCount: true,
                customerName: true,
                createdAt: true,
                createdById: true,
                updatedAt: true,
                updatedId: true,
                conditions: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        company: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            where,
            orderBy: {
                id: 'desc'
            }
        });

        return histories.map((history) => ({
            ...history,
            favoriteCount: history.totalFavoriteCount,
            updatedById: history.updatedId, // By nuke
            companyId: history.createdBy.company.id,
            companyName: history.createdBy.company.name,
            userId: history.createdBy.id,
            userName: history.createdBy.name ?? null,
            createdBy: undefined
        }));
    }

    /**
     * Gets a list of history details.
     *
     * @param historyParentId - The ID of the parent history record
     * @param userId - The ID of the user requesting the data
     * @param authPayload - The authorization token payload of the requester
     * @returns The list of child histories
     */
    public async getHistoryChildren(
        historyParentId: number,
        userId: number,
        authPayload: AuthTokenPayload
    ): Promise<HistoryChildInfo[]> {
        this.logger.debug(
            `getHistoryChildren(${historyParentId}, ${userId}, ${JSON.stringify(authPayload)}})`
        );

        const where: Prisma.HistoryChildWhereInput = {
            historyParentId: historyParentId,
            deleted: false,
            historyParent: {
                deleted: false,
                createdBy: {
                    deleted: false,
                    company: {
                        deleted: false
                    }
                }
            }
        };

        if (Role.COMPANY_ADMIN === authPayload.role) {
            where.historyParent = {
                deleted: false,
                createdBy: {
                    deleted: false,
                    companyId: authPayload.companyId,
                    company: {
                        deleted: false
                    }
                }
            };
        } else if (Role.MEMBER === authPayload.role) {
            where.historyParent = {
                deleted: false,
                createdBy: {
                    id: userId,
                    deleted: false,
                    companyId: authPayload.companyId,
                    company: {
                        deleted: false
                    }
                }
            };
        }

        return prisma.historyChild.findMany({
            select: {
                id: true,
                historyParentId: true,
                patternName: true,
                floorplanData: true,
                isPatternFavorite: true,
                tag: true,
                isDownloaded: true,
                pdfPath: true,
                constructionName: true,
                scale: true,
                drawingFormat: true,
                createdAt: true,
                createdById: true
            },
            where,
            orderBy: {
                id: 'asc'
            }
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

    /**
     * Creates a new floor plan generation job in the database.
     *
     * @param createData - The input data required to create the floor plan generation job
     * @param tx - Optional Prisma transaction client
     */
    public async createFloorPlanGenerationJob(
        createData: CreateFloorPlanDataInput,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        this.logger.debug(`createFloorPlanGenerationJob(${JSON.stringify(createData)})`);

        const client = tx || prisma;
        await client.floorPlanGenerationJob.create({
            data: { ...createData }
        });
    }

    /**
     * Gets a floor plan generation job by its ID.
     *
     * @param jobId - The unique identifier (UUID) of the floor plan generation job
     * @returns Floorplan generation information
     */
    public async getFloorPlanGenerationJob(
        jobId: string
    ): Promise<FloorPlanGenerationJobInfor | null> {
        this.logger.debug(`getFloorPlanGenerationJob(${jobId})`);

        const result = await prisma.floorPlanGenerationJob.findUnique({
            select: {
                jobId: true,
                status: true,
                progress: true,
                estimatedTime: true,
                requestPayload: true,
                resultPayload: true,
                historyParentId: true,
                requestUserId: true
            },
            where: {
                jobId
            }
        });

        if (!result) {
            return null;
        }
        return {
            ...result,
            requestPayload: result.requestPayload as RequestPayload
        };
    }

    /**
     * Creates a new history parent record in the database.
     *
     * @param createData - The data required to create the history parent record
     * @param tx - Optional Prisma transaction client
     * @returns The ID of the newly created history parent record
     */
    public async createHistoryParent(
        createData: CreateHistoryParentDataInput,
        tx?: Prisma.TransactionClient
    ): Promise<number> {
        this.logger.debug(`createHistoryParent(${JSON.stringify(createData)})`);

        const client = tx || prisma;
        const newHistoryParent = await client.historyParent.create({
            data: { ...createData }
        });

        return newHistoryParent.id;
    }

    /**
     * Creates multiple history child records in the database.
     *
     * @param createDataList - An array of history child data to be created
     * @param tx - Optional Prisma transaction client
     */
    public async createHistoryChildren(
        createDataList: CreateHistoryChildDataInput[],
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        this.logger.debug(`createHistoryChildren(${JSON.stringify(createDataList)})`);

        const client = tx || prisma;
        await client.historyChild.createMany({
            data: createDataList
        });
    }

    /**
     * Updates the historyParentId for a specific floor plan generation job.
     *
     * @param jobId - The unique identifier of the floor plan generation job to update
     * @param historyParentId - The ID of the history parent record to associate with the job
     * @param tx - Optional Prisma transaction client
     */
    public async updateHistoryParentIdForFloorPlanJob(
        jobId: string,
        historyParentId: number,
        tx?: Prisma.TransactionClient
    ): Promise<void> {
        this.logger.debug(`updateHistoryParentIdForFloorPlanJob(${jobId}, ${historyParentId})`);

        const client = tx || prisma;
        await client.floorPlanGenerationJob.update({
            where: { jobId },
            data: { historyParentId }
        });
    }

    /**
     * Updates the favorite status of a history child record.
     *
     * @param historyChildId - The ID of the history child record to update
     * @param isPatternFavorite - Whether the history child should be marked as favorite
     */
    public async toggleHistoryChildFavorite(
        historyChildId: number,
        isPatternFavorite: boolean
    ): Promise<void> {
        this.logger.debug(`toggleHistoryChildFavorite(${historyChildId}, ${isPatternFavorite})`);

        await prisma.historyChild.update({
            where: { id: historyChildId },
            data: { isPatternFavorite }
        });
    }

    /**
     * Removes a history child record by marking it as deleted.
     *
     * @param historyChildId - The ID of the history child record to remove
     */
    public async removeHistoryChild(historyChildId: number): Promise<void> {
        this.logger.debug(`removeHistoryChild(${historyChildId})`);

        await prisma.historyChild.update({
            where: { id: historyChildId },
            data: { deleted: true }
        });
    }

    /**
     * Get historyParent information.
     *
     * @param historyParentId - The ID of the history child record to remove
     * @returns HistoryParent information
     */
    public async getRegenerateHistoryParent(
        historyParentId: number
    ): Promise<RegenerateHistoryParent | null> {
        this.logger.debug(`getRegenerateHistoryParent(${historyParentId})`);

        const historyParent = await prisma.historyParent.findUnique({
            select: {
                title: true,
                customerName: true,
                conditions: true
            },
            where: {
                id: historyParentId,
                deleted: false
            }
        });

        if (!historyParent) {
            return null;
        }

        return {
            ...historyParent,
            conditions: historyParent.conditions as LayoutConditions
        };
    }

    /**
     * Updates a floorplan.
     *
     * @param historyChildId - The ID of the history child record to remove
     * @param updateFloorplanData - Update floorplan data for historyChild
     */
    public async updateHistoryChildFloorplanAndDownload(
        historyChildId: number,
        updateFloorplanData: HistoryChildFloorplanData
    ): Promise<void> {
        this.logger.debug(`updateHistoryChildFloorplanAndDownload(${historyChildId})`);

        await prisma.historyChild.update({
            where: { id: historyChildId },
            data: {
                floorplanData: updateFloorplanData,
                isDownloaded: true
            }
        });
    }
}
