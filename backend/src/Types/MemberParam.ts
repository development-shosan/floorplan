import { Role } from "@prisma/client";

export type InputUserInfo = {
    name: string;
    companyId: number;
    email: string;
    password: string;
    role: Role;
    department: string;
    phoneNumber: string;
    status?: boolean;
}