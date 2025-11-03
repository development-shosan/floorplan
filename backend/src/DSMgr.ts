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
    FloorplanGenerationNotCompletedError,
    FloorplanImageError
} from './ApplicationErrors';
import { AppConstant } from './SpecificCommons';
import { Prisma, Role } from '@prisma/client';
import { createAuthToken } from './commonUtils';
import { createLogger } from './logger';
import { env } from '../env';
import axios from 'axios';
import {
    CompanyInfoOutput,
    CreateCompanyDataInput,
    UpdateCompanyDataInput
} from './Types/CompanyParam';
import { HistoryChildInfoOutput, HistoryInfoOutput, HistoryChildInfo, HistoryInfo } from './Types/HistoryParam';
import {
    FloorplanGenerationStatus,
    FloorplanImage,
    HistoryChildFloorplanData,
    RequestPayload
} from './Types/FloorplanParam';
import crypto from 'crypto';
import prisma from '../prisma/client';
import fs from 'fs/promises';
import path from 'path';

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
     * @param tx - Optional Prisma transaction client
     * @returns jobId
     */
    public async createFloorplanGenerationJob(
        requestPayload: RequestPayload,
        userId: number,
        tx?: Prisma.TransactionClient
    ): Promise<{ jobId: string }> {
        this.logger.debug(
            `createFloorplanGenerationJob(${JSON.stringify(requestPayload)}, ${userId})`
        );

        try {
            const jobId = crypto.randomUUID();
            const createFloorPlanData = {
                jobId,
                status: AppConstant.FLOORPLAN.GENERATION.STATUS.PROCESSING,
                progress: 0,
                estimatedTime: '60s',
                requestPayload: requestPayload,
                requestUserId: userId
            };
            await this.dbMgr.createFloorPlanGenerationJob(createFloorPlanData, tx);

            // Trigger Python service
            try {
                const pythonPayload = {
                    ...requestPayload,
                    job_id: jobId // Add job_id for Python service
                };
                this.logger.info(`Calling Python service for job: ${jobId}`);
                await axios.post(`${env.PYTHON_API_URL}/generate-floorplan`, pythonPayload);
            } catch (pythonError) {
                this.logger.error('Error calling Python service:', pythonError);
                // TODO: Handle error, maybe set job status to FAILED
            }

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
    ): Promise<{ history: HistoryInfo | null; historyChildren: HistoryChildInfo[] }> {
        this.logger.debug(`getFloorplanGenerationResults(${jobId})`);

        try {
            const floorplanGeneration = await this.dbMgr.getFloorPlanGenerationJob(jobId);
            if (!floorplanGeneration || !floorplanGeneration.historyParentId) {
                throw new FloorplanGenerationError('FloorplanGeneration was not found.');
            }
            if (AppConstant.FLOORPLAN.GENERATION.STATUS.COMPLETED !== floorplanGeneration.status) {
                throw new FloorplanGenerationNotCompletedError(
                    'FloorplanGeneration is not completed.'
                );
            }

            const historyParent = await this.dbMgr.getHistoryParent(floorplanGeneration.historyParentId);
            const historyChildren = await this.dbMgr.getHistoryChildren(
                floorplanGeneration.historyParentId,
                floorplanGeneration.requestUserId,
                authPayload
            );

            return {
                history: historyParent,
                historyChildren: historyChildren
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
     * Regenerate floorplan.
     *
     * @param historyParentId - The ID of the parent history record
     * @param userId - The ID of the user requesting the data
     * @returns jobId
     */
    public async regenerateFloorplan(
        historyParentId: number,
        userId: number
    ): Promise<{ jobId: string }> {
        this.logger.debug(`regenerateFloorplan(${historyParentId}, ${userId})`);

        try {
            const historyParent = await this.dbMgr.getRegenerateHistoryParent(historyParentId);
            if (!historyParent) {
                throw new FloorplanGenerationError('HistoryParent was not found.');
            }
            const requestPayload: RequestPayload = {
                title: historyParent.title ?? AppConstant.DEFAULT_NULL_STRING,
                clientName: historyParent.customerName ?? AppConstant.DEFAULT_NULL_STRING,
                layout_conditions: historyParent.conditions
            };

            return await prisma.$transaction(async (tx) => {
                const { jobId } = await this.createFloorplanGenerationJob(
                    requestPayload,
                    userId,
                    tx
                );
                await this.dbMgr.updateHistoryParentIdForFloorPlanJob(jobId, historyParentId, tx);
                return { jobId };
            });
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                this.logger.warn(`Failed to get floorplan regeneration: ${err.message}`);
            } else {
                this.logger.error('regenerateFloorplan() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Updates a floorplan.
     *
     * @param historyChildId - The ID of the child history record
     * @param updateFloorplanData - Update floorplan data for historyChild
     */
    public async updateFloorplan(
        historyChildId: number,
        updateFloorplanData: HistoryChildFloorplanData
    ): Promise<void> {
        this.logger.debug(
            `updateFloorplan(${historyChildId}, ${JSON.stringify(updateFloorplanData)})`
        );

        try {
            await this.dbMgr.updateHistoryChildFloorplanAndDownload(
                historyChildId,
                updateFloorplanData
            );
        } catch (err) {
            this.logger.error('updateFloorplan() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Gets a list of equipment images.
     *
     * @returns List of equipment images with name and URL
     */
    public async getFloorplanImages(): Promise<FloorplanImage> {
        this.logger.debug('getFloorplanImages()');

        try {
            const publicDir = path.join(__dirname, '..', 'public');

            try {
                await fs.access(publicDir);
            } catch {
                return {
                    images: []
                };
            }

            const files = await fs.readdir(publicDir);

            const imageExtensions = ['.png', '.jpg', '.jpeg'];
            const imageFiles = files.filter((file) =>
                imageExtensions.includes(path.extname(file).toLowerCase())
            );

            const images = imageFiles.map((file) => ({
                name: file,
                url: `/backend/public/${file}`
            }));

            return { images };
        } catch (err) {
            this.logger.error('getFloorplanImages() Unexpected error', err);
            throw err;
        }
    }

    /**
     * Uploads an equipment image.
     *
     * @param file - The uploaded file from multer
     */
    public async uploadFloorplanImage(file: Express.Multer.File): Promise<void> {
        this.logger.debug(`uploadFloorplanImage(${file.originalname})`);

        try {
            const publicDir = path.join(__dirname, '..', 'public');

            try {
                await fs.access(publicDir);
            } catch {
                await fs.mkdir(publicDir, { recursive: true });
            }

            const allowedExtensions = ['.png', '.jpg', '.jpeg'];
            const fileExt = path.extname(file.originalname).toLowerCase();

            if (!allowedExtensions.includes(fileExt)) {
                throw new FloorplanImageError('Invalid file format. Only image files are allowed.');
            }

            const maxFileSize = AppConstant.FLOORPLAN.IMAGE.MAX_FILE_SIZE; // 5MB
            if (file.size > maxFileSize) {
                throw new FloorplanImageError('File size exceeds 5MB limit.');
            }

            const targetPath = path.join(publicDir, file.originalname);
            try {
                await fs.access(targetPath);
                throw new FloorplanImageError('File with the same name already exists.');
            } catch (err) {
                if (err instanceof FloorplanImageError) {
                    throw err;
                }
            }

            await fs.writeFile(targetPath, file.buffer);
            this.logger.info(`Image uploaded successfully: ${file.originalname}`);
        } catch (err) {
            if (err instanceof FloorplanImageError) {
                this.logger.warn(`Upload image failed: ${err.message}`);
            } else {
                this.logger.error('uploadFloorplanImage() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Deletes an equipment image.
     *
     * @param name - The name of the image file to delete
     */
    public async deleteFloorplanImage(name: string): Promise<void> {
        this.logger.debug(`deleteFloorplanImage('${name}')`);

        try {
            const publicDir = path.join(__dirname, '..', 'public');
            const targetPath = path.join(publicDir, name);

            const normalizedPath = path.normalize(targetPath);
            if (!normalizedPath.startsWith(publicDir)) {
                throw new FloorplanImageError('Invalid file path.');
            }

            try {
                await fs.access(targetPath);
            } catch {
                throw new FloorplanImageError('File not found.');
            }

            const stats = await fs.stat(targetPath);
            if (!stats.isFile()) {
                throw new FloorplanImageError('Target is not a file.');
            }

            await fs.unlink(targetPath);
            this.logger.info(`Image deleted successfully: ${name}`);
        } catch (err) {
            if (err instanceof FloorplanImageError) {
                this.logger.warn(`Delete image failed: ${err.message}`);
            } else {
                this.logger.error('deleteFloorplanImage() Unexpected error', err);
            }
            throw err;
        }
    }

    /**
     * Completes a floor plan generation job.
     *
     * @param jobId - The unique identifier of the floor plan generation job
     * @param result - The result data from the Python service
     */
    public async completeFloorplanGenerationJob(
        jobId: string,
        result: any
    ): Promise<void> {
        this.logger.debug(`completeFloorplanGenerationJob(${jobId})`);
        try {
            await this.dbMgr.updateFloorplanJobResult(jobId, result);
            this.logger.info(`Job ${jobId} has been completed.`);

            // Process the results and create history records
            const floorplanGeneration = await this.dbMgr.getFloorPlanGenerationJob(jobId);
            if (!floorplanGeneration) {
                throw new FloorplanGenerationError('FloorplanGeneration was not found after completion.');
            }

            let historyParentId: number;
            const layouts = [
                floorplanGeneration.resultPayload.layout_1,
                floorplanGeneration.resultPayload.layout_2,
                floorplanGeneration.resultPayload.layout_3
            ];

            await prisma.$transaction(async (tx) => {
                if (floorplanGeneration.historyParentId) {
                    // Regenerate
                    historyParentId = floorplanGeneration.historyParentId;
                } else {
                    // New generate
                    const createHistoryParentData = {
                        title: floorplanGeneration.requestPayload.title,
                        conditions: floorplanGeneration.requestPayload.layout_conditions,
                        customerName: floorplanGeneration.requestPayload.clientName,
                        createdById: floorplanGeneration.requestUserId,
                        updatedId: floorplanGeneration.requestUserId
                    };
                    historyParentId = await this.dbMgr.createHistoryParent(
                        createHistoryParentData,
                        tx
                    );

                    await this.dbMgr.updateHistoryParentIdForFloorPlanJob(
                        jobId,
                        historyParentId,
                        tx
                    );
                }
                const historyChildrenData = layouts.map((layout) => {
                    const { type, ...floorplanData } = layout;

                    return {
                        historyParentId,
                        patternName: type,
                        floorplanData,
                        tag: layout.tag.join(','),
                        createdById: floorplanGeneration.requestUserId
                    };
                });
                await this.dbMgr.createHistoryChildren(historyChildrenData, tx);
            });

        } catch (err) {
            this.logger.error('completeFloorplanGenerationJob() Unexpected error', err);
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
