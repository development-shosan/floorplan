import { Role } from '@prisma/client';

export type UserInfo = {
    id: number;
    email: string;
    name: string | null;
    role: Role;
    companyId: number;
    companyName: string;
    department: string | null;
    phoneNumber: string | null;
    createdAt: Date;
    createdById: number | null;
    updatedAt: Date;
    updatedById: number | null;
    status: boolean;
}

export type UserInfoOutput = {
    members: UserInfo[]
}

export type CreateUserDataInput = Pick<UserInfo, 'companyId' | 'email' | 'role'> & {
    name: string;
    password: string;
    department: string;
    phoneNumber: string;
}

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
}

export type UpdateUserDataInput = Pick<CreateUserDataInput, 'name' | 'role' | 'department' | 'phoneNumber' > & {
    status: boolean;
}

export type UserByUserId = Pick<UserInfo, 'role' | 'companyId'> & {
    password: string | null;
};