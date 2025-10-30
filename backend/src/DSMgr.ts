/*
   src/DSMgr.ts
*/
import DBMgr from './DBMgr';
import { AuthTokenPayload, LoginResult, UserByEmail } from './Types/LoginParam';
import { CreateUserDataInput, UpdateUserDataInput, UserInfoOutput } from './Types/UserParam';
import bcrypt from 'bcrypt';
import {
    UserModificationError,
    LoginError,
    FloorplanGenerationError,
    FloorplanGenerationNotCompletedError
} from './ApplicationErrors';
import { AppConstant } from './SpecificCommons';
import { Prisma, Role } from '@prisma/client';
import { createAuthToken } from './commonUtils';
import { createLogger } from './logger';
import {
    CompanyInfoOutput,
    CreateCompanyDataInput,
    UpdateCompanyDataInput
} from './Types/CompanyParam';
import { HistoryChildInfoOutput, HistoryInfoOutput } from './Types/HistoryParam';
import { FloorplanGenerationStatus, RequestPayload } from './Types/FloorplanParam';
import prisma from '../prisma/client';

export default class DSMgr {
    private dbMgr: DBMgr;
    private logger;

    constructor() {
        this.dbMgr = new DBMgr();
        this.logger = createLogger('DSMgr');
    }

    /**
     * Login authentication.
     *
     * @param email - email address
     * @param password - user password
     * @returns Object<LoginResult>
     */
    public async login(email: string, password: string): Promise<LoginResult> {
        this.logger.debug(`login('${email}')`);

        try {
            const user: UserByEmail | null = await this.dbMgr.getUserByEmail(email);
            if (!user) {
                throw new LoginError('Email could not be found.');
            }
            // The password column allows NULL values.
            if (!user.password) {
                throw new LoginError('Password could not be found.');
            }

            const isMatch: boolean = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new LoginError('The password is incorrect.');
            }

            const jwtPayload = { userId: user.id, role: user.role, companyId: user.companyId };
            const token: string = createAuthToken(jwtPayload);

            return {
                id: user.id,
                name: user.name || null,
                token
            };
        } catch (err) {
            if (err instanceof LoginError) {
                this.logger.warn(`Login failed: ${err.message}`);
            } else {
                this.logger.error('login() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Retrieves a list of users.
     *
     * @param authPayload - The authorization token payload of the requester
     * @returns Object<UserInfoOutput>
     */
    public async getUsers(authPayload: AuthTokenPayload): Promise<UserInfoOutput> {
        this.logger.debug(`getUsers(${JSON.stringify(authPayload)})`);

        try {
            const userInfos = await this.dbMgr.getUsers(authPayload);
            return {
                members: userInfos ?? []
            };
        } catch (err) {
            this.logger.error('getUsers() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Creates a new user.
     *
     * @param createData - The user data to create the user with
     * @param authPayload - The authorization token payload of the requester
     */
    public async createUser(
        createData: CreateUserDataInput,
        authPayload: AuthTokenPayload
    ): Promise<void> {
        this.logger.debug(`createUser(${JSON.stringify(authPayload)})`);

        try {
            this.validateRolePermission(authPayload.role, createData.role);

            const hashedPassword = await bcrypt.hash(
                createData.password,
                AppConstant.BCRYPT.SALT_ROUNDS
            );
            const createDataHashedPassword: CreateUserDataInput = {
                ...createData,
                password: hashedPassword
            };
            await this.dbMgr.createUser(createDataHashedPassword);
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    this.logger.warn(`Create user failed: ${err.message}`);

                    throw new UserModificationError(
                        `Duplicate value detected in unique field(s): ${err.meta?.target}`
                    );
                }
            } else {
                this.logger.error('createUser() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Updates user data.
     *
     * @param userId - The ID of the user to update
     * @param authPayload - The authorization token payload of the requester
     * @param updateData - The new data to apply to the user
     */
    public async updateUser(
        userId: number,
        authPayload: AuthTokenPayload,
        updateData: UpdateUserDataInput
    ): Promise<void> {
        this.logger.debug(`updateUser(${userId}, ${JSON.stringify(authPayload)}, 
                            ${JSON.stringify(updateData)})`);

        try {
            if (Role.COMPANY_ADMIN === authPayload.role) {
                const userCompanyId: number | null =
                    await this.dbMgr.getUserCompanyIdByUserId(userId);
                if (userCompanyId !== authPayload.companyId) {
                    throw new UserModificationError('Not from the same company.');
                }
            }
            await this.dbMgr.updateUser(userId, updateData);
        } catch (err) {
            if (err instanceof UserModificationError) {
                this.logger.warn(`Update user failed: ${err.message}`);
            } else {
                this.logger.error('updateUser() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Changes the user's password.
     *
     * @param userId - The ID of the user whose password will be changed
     * @param authPayload - The authorization token payload of the requester
     * @param newPassword - An object containing the new passwords.
     */
    public async changeUserPassword(
        userId: number,
        authPayload: AuthTokenPayload,
        newPassword: string
    ): Promise<void> {
        this.logger.debug(
            `changeUserPassword(${userId}, ${JSON.stringify(authPayload)}, '${newPassword}')`
        );
        try {
            const targetUser = await this.dbMgr.getUserByUserId(userId);
            if (!targetUser) {
                throw new UserModificationError('User could not be found.');
            }

            this.validateRolePermission(authPayload.role, targetUser.role);

            if (Role.COMPANY_ADMIN === authPayload.role) {
                if (targetUser.companyId !== authPayload.companyId) {
                    throw new UserModificationError('Not from the same company.');
                }
            }

            const hashedNewPassword: string = await bcrypt.hash(
                newPassword,
                AppConstant.BCRYPT.SALT_ROUNDS
            );
            await this.dbMgr.changeUserPassword(userId, hashedNewPassword);
        } catch (err) {
            if (err instanceof UserModificationError) {
                this.logger.warn(`Change password failed: ${err.message}`);
            } else {
                this.logger.error('changeUserPassword() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Retrieves a list of companies.
     *
     * @returns A list of companies, or null if no companies are found
     */
    public async getCompanies(): Promise<CompanyInfoOutput> {
        this.logger.debug('getCompanies()');

        try {
            const companyInfos = await this.dbMgr.getCompanies();
            return {
                companies: companyInfos ?? []
            };
        } catch (err) {
            this.logger.error('getCompanies() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Creates a new company.
     *
     * @param createData - The company data to create the company with
     */
    public async createCompany(createData: CreateCompanyDataInput): Promise<void> {
        this.logger.debug(`createCompany(${JSON.stringify(createData)})`);

        try {
            await this.dbMgr.createCompany(createData);
        } catch (err) {
            this.logger.error('createCompany() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Updates company data.
     *
     * @param companyId - The ID of the company to update
     * @param updateData - The new data to apply to the company
     */
    public async updateCompany(
        companyId: number,
        updateData: UpdateCompanyDataInput
    ): Promise<void> {
        this.logger.debug(`updateCompany(${companyId}, ${JSON.stringify(updateData)})`);

        try {
            await this.dbMgr.updateCompany(companyId, updateData);
        } catch (err) {
            this.logger.error('updateCompany() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Remove a company and all users associated with it.
     *
     * @param companyId - The ID of the company to remove
     */
    public async removeCompanyWithUsers(companyId: number): Promise<void> {
        this.logger.debug(`removeCompanyWithUsers(${companyId})`);

        try {
            await this.dbMgr.removeCompanyWithUsers(companyId);
        } catch (err) {
            this.logger.error('removeCompanyWithUsers() Unexpected error', err);
            throw err;
        }
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
    ): Promise<HistoryInfoOutput> {
        this.logger.debug(`getHistories(${userId}, ${JSON.stringify(authPayload)})`);

        try {
            const histories = await this.dbMgr.getHistories(userId, authPayload);
            return {
                histories: histories ?? []
            };
        } catch (err) {
            this.logger.error('getHistories() Unexpected error', err);
            throw err;
        }
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
    ): Promise<HistoryChildInfoOutput> {
        this.logger.debug(
            `getHistoryChildren(${historyParentId}, ${userId}, ${JSON.stringify(authPayload)})`
        );

        try {
            const historyChildren = await this.dbMgr.getHistoryChildren(
                historyParentId,
                userId,
                authPayload
            );
            return {
                historyChildren: historyChildren ?? []
            };
        } catch (err) {
            this.logger.error('getHistoryChildren() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Floorplan generation request.
     *
     * @param requestPayload - The request data sent to the Python service for processing
     * @param userId - The ID of the user requesting the data
     * @returns jobId
     */
    public async createFloorplanGenerationJob(
        requestPayload: RequestPayload,
        userId: number
    ): Promise<{ jobId: string }> {
        this.logger.debug(`createFloorplanGenerationJob(${JSON.stringify(requestPayload)})`);

        try {
            const jobId = crypto.randomUUID();
            // TODO: Send the requestPayload to Python for processing

            // Save floor plan generation job to the database
            const createFloorPlanData = {
                jobId,
                status: AppConstant.FLOORPLAN_GENERATION.STATUS.PROCESSING,
                progress: 0,
                estimatedTime: '60s',
                requestPayload: requestPayload,
                requestUserId: userId
            };
            await this.dbMgr.createFloorPlanGenerationJob(createFloorPlanData);

            return { jobId };
        } catch (err) {
            this.logger.error('createFloorplanGenerationJob() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Get floorplan generation status.
     *
     * @param jobId - The unique identifier (UUID) of the floor plan generation job
     * @returns Floorplan generation status information
     */
    public async getFloorplanGenerationStatus(jobId: string): Promise<FloorplanGenerationStatus> {
        this.logger.debug(`getFloorplanGenerationStatus(${jobId})`);

        try {
            const floorplanGeneration = await this.dbMgr.getFloorPlanGenerationJob(jobId);
            if (!floorplanGeneration) {
                throw new FloorplanGenerationError('FloorplanGeneration was not found.');
            }

            if (AppConstant.FLOORPLAN_GENERATION.STATUS.COMPLETED === floorplanGeneration.status) {
                const createHistoryParentData = {
                    title: floorplanGeneration.requestPayload.title,
                    conditions: floorplanGeneration.requestPayload.layout_conditions,
                    customerName: floorplanGeneration.requestPayload.clientName,
                    createdById: floorplanGeneration.requestUserId,
                    updatedId: floorplanGeneration.requestUserId
                };

                const layouts = [
                    floorplanGeneration.resultPayload.layout_1,
                    floorplanGeneration.resultPayload.layout_2,
                    floorplanGeneration.resultPayload.layout_3
                ];

                await prisma.$transaction(async (tx) => {
                    const newHistoryParentId: number = await this.dbMgr.createHistoryParent(
                        createHistoryParentData,
                        tx
                    );

                    await this.dbMgr.updateHistoryParentIdForFloorPlanJob(
                        jobId,
                        newHistoryParentId,
                        tx
                    );

                    const historyChildrenData = layouts.map((layout) => {
                        const { type, ...floorplanData } = layout;

                        return {
                            historyParentId: newHistoryParentId,
                            patternName: type,
                            floorplanData,
                            tag: layout.tag.join(','),
                            createdById: floorplanGeneration.requestUserId
                        };
                    });
                    await this.dbMgr.createHistoryChildren(historyChildrenData, tx);
                });
            }

            return {
                jobId,
                status: floorplanGeneration.status,
                progress: floorplanGeneration.progress,
                estimatedTime: floorplanGeneration.estimatedTime
            };
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                this.logger.warn(`Failed to get floorplanGeneration status: ${err.message}`);
            } else {
                this.logger.error('getFloorplanGenerationStatus() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Get floorplan generation results.
     *
     * @param jobId - The unique identifier (UUID) of the floor plan generation job
     * @param authPayload - The authorization token payload of the requester
     * @returns Floorplan generation results
     */
    public async getFloorplanGenerationResults(
        jobId: string,
        authPayload: AuthTokenPayload
    ): Promise<HistoryChildInfoOutput> {
        this.logger.debug(`getFloorplanGenerationResults(${jobId})`);

        try {
            const floorplanGeneration = await this.dbMgr.getFloorPlanGenerationJob(jobId);
            if (!floorplanGeneration || !floorplanGeneration.historyParentId) {
                throw new FloorplanGenerationError('FloorplanGeneration was not found.');
            }
            if (AppConstant.FLOORPLAN_GENERATION.STATUS.COMPLETED !== floorplanGeneration.status) {
                throw new FloorplanGenerationNotCompletedError(
                    'FloorplanGeneration is not completed.'
                );
            }

            const floorplanGenerationResults = await this.dbMgr.getHistoryChildren(
                floorplanGeneration.historyParentId,
                floorplanGeneration.requestUserId,
                authPayload
            );
            return {
                historyChildren: floorplanGenerationResults
            };
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                this.logger.warn(`Failed to get floorplanGeneration results: ${err.message}`);
            } else if (err instanceof FloorplanGenerationNotCompletedError) {
                this.logger.warn(`Failed to get floorplanGeneration results: ${err.message}`);
            } else {
                this.logger.error('getFloorplanGenerationResults() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Toggles the favorite status of a floorplan.
     *
     * @param historyChildId - The ID of the child history record
     * @param isPatternFavorite - Whether the pattern is a favorite.
     */
    public async toggleHistoryChildFavorite(
        historyChildId: number,
        isPatternFavorite: boolean
    ): Promise<void> {
        this.logger.debug(`toggleHistoryChildFavorite(${historyChildId}, ${isPatternFavorite})`);

        try {
            await this.dbMgr.toggleHistoryChildFavorite(historyChildId, isPatternFavorite);
        } catch (err) {
            this.logger.error('toggleHistoryChildFavorite() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Deletes a floorplan.
     *
     * @param historyChildId - The ID of the child history record
     */
    public async removeHistoryChild(historyChildId: number): Promise<void> {
        this.logger.debug(`removeHistoryChild(${historyChildId})`);

        try {
            await this.dbMgr.removeHistoryChild(historyChildId);
        } catch (err) {
            this.logger.error('removeHistoryChild() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Permission validation function.
     *
     * @param authRole - The authenticated administrator role (authPayload.role)
     * @param targetRole - The role of the target user being modified
     */
    validateRolePermission(authRole: Role, targetRole: Role): void {
        this.logger.debug(`validateRolePermission(${authRole}, ${targetRole})`);
        const isSystemAdminCreatingCompanyAdmin =
            Role.SYSTEM_ADMIN === authRole && Role.COMPANY_ADMIN === targetRole;

        const isCompanyAdminCreatingMember =
            Role.COMPANY_ADMIN === authRole && Role.MEMBER === targetRole;

        if (!isSystemAdminCreatingCompanyAdmin && !isCompanyAdminCreatingMember) {
            throw new UserModificationError(
                'The role does not have permission for the target action.'
            );
        }
    }
}
