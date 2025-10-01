/*
   src/DSMgr.ts
*/
import DBMgr from './DBMgr';
import { AuthTokenPayload, LoginResult, UserByEmail } from './types/LoginParam';
import {
    ChangePasswordInput,
    CreateUserDataInput,
    UpdateUserDataInput,
    UserInfoOutput
} from './types/UserParam';
import bcrypt from 'bcrypt';
import { UserModificationError, LoginError } from './ApplicationErrors';
import { AppConstant } from './SpecificCommons';
import { Prisma, Role } from '@prisma/client';
import { createAuthToken } from './commonUtils';
import { createLogger } from './logger';

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
        this.logger.info(`login('${email}')`);

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

            const jwtPayload = { role: user.role, companyId: user.companyId };
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
        this.logger.info(`getUsers(${JSON.stringify(authPayload)})`);

        try {
            const userInfos = await this.dbMgr.getUsers(authPayload);
            if (!userInfos?.length) return { members: [] };

            return {
                members: userInfos
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
        this.logger.info(`createUser(${JSON.stringify(authPayload)})`);

        try {
            const isSystemAdminCreatingCompanyAdmin =
                Role.SYSTEM_ADMIN === authPayload.role && Role.COMPANY_ADMIN === createData.role;

            const isCompanyAdminCreatingMember =
                Role.COMPANY_ADMIN === authPayload.role && Role.MEMBER === createData.role;

            if (!isSystemAdminCreatingCompanyAdmin && !isCompanyAdminCreatingMember) {
                throw new UserModificationError(
                    'The role does not have permission for the target action.'
                );
            }

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
        this.logger.info(`updateUser(${userId}, ${JSON.stringify(authPayload)}, 
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
     * @param companyId - The ID of the company the user belongs to
     * @param passwords - An object containing the current and new passwords.
     */
    public async changeUserPassword(
        userId: number,
        companyId: number,
        passwords: ChangePasswordInput
    ): Promise<void> {
        this.logger.info(`changeUserPassword(${userId}, ${companyId})`);

        try {
            const userHashedPassword: string | null = await this.dbMgr.getUserPasswordByUserId(
                userId,
                companyId
            );
            if (!userHashedPassword) {
                throw new UserModificationError('Password could not be found.');
            }

            const isMatch: boolean = await bcrypt.compare(
                passwords.currentPassword,
                userHashedPassword
            );
            if (!isMatch) {
                throw new UserModificationError('The current password is incorrect.');
            }

            const hashedNewPassword: string = await bcrypt.hash(
                passwords.newPassword,
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
}
