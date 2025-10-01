/*
   src/DSMgr.ts
*/
import DBMgr from './DBMgr';
import {AuthTokenPayload, LoginResult, UserByEmail} from './types/LoginParam';
import {
    ChangePasswordInput,
    CreateUserDataInput,
    UpdateUserDataInput, UserInfoOutput
} from './types/UserParam';
import bcrypt from 'bcrypt';
import {UserModificationError, LoginError} from './ApplicationErrors';
import { AppConstant } from './SpecificCommons';
import {Prisma, Role} from "@prisma/client";
import {createAuthToken} from "./commonUtils";

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
     * @returns Object<LoginResult>
     */
    public async login( email: string, password: string ): Promise<LoginResult> {
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
                console.error('Login failed', err);
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
        try {
            const userInfos = await this.dbMgr.getUsers(authPayload);
            if(!userInfos?.length) return { members: [] }

            return {
                members: userInfos
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Creates a new user.
     *
     * @param createData - The user data to create the user with
     * @param authPayload - The authorization token payload of the requester
     */
    public async createUser(createData: CreateUserDataInput,
                            authPayload: AuthTokenPayload): Promise<void> {
        try {

            this.validateRolePermission(authPayload.role, createData.role)

            const hashedPassword = await bcrypt.hash(
                    createData.password, AppConstant.BCRYPT.SALT_ROUNDS);
            const createDataHashedPassword: CreateUserDataInput =
                    { ...createData, password: hashedPassword };
            await this.dbMgr.createUser(createDataHashedPassword);

        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new UserModificationError(
                    `Duplicate value detected in unique field(s): ${err.meta?.target}`);
                }
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
    updateData: UpdateUserDataInput,
  ): Promise<void> {
    try {
      if (Role.COMPANY_ADMIN === authPayload.role) {
        const userCompanyId: number | null =
          await this.dbMgr.getUserCompanyIdByUserId(userId);
        if (userCompanyId !== authPayload.companyId) {
          throw new UserModificationError("Not from the same company.");
        }
      }
      await this.dbMgr.updateUser(userId, updateData);
    } catch (err) {
      if (err instanceof UserModificationError) {
        console.error("update user failed", err);
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
    newPassword: string,
  ): Promise<void> {
    try {
      const targetUser = await this.dbMgr.getUserByUserId(userId);
      if (!targetUser) {
        throw new UserModificationError("User could not be found.");
      }

      this.validateRolePermission(authPayload.role, targetUser.role);

      if (Role.COMPANY_ADMIN === authPayload.role) {
        if (targetUser.companyId !== authPayload.companyId) {
          throw new UserModificationError("Not from the same company.");
        }
      }

      const hashedNewPassword: string = await bcrypt.hash(
        newPassword,
        AppConstant.BCRYPT.SALT_ROUNDS,
      );
      await this.dbMgr.changeUserPassword(userId, hashedNewPassword);
    } catch (err) {
      if (err instanceof UserModificationError) {
        console.error("changePassword failed", err);
      }
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
    const isSystemAdminCreatingCompanyAdmin =
      Role.SYSTEM_ADMIN === authRole && Role.COMPANY_ADMIN === targetRole;

    const isCompanyAdminCreatingMember =
      Role.COMPANY_ADMIN === authRole && Role.MEMBER === targetRole;

    if (!isSystemAdminCreatingCompanyAdmin && !isCompanyAdminCreatingMember) {
      throw new UserModificationError(
        "The role does not have permission for the target action.",
      );
    }
  }
}
