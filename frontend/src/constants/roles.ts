export enum UserRole {
  MEMBER = "MEMBER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.MEMBER]: "一般",
  [UserRole.COMPANY_ADMIN]: "管理者",
  [UserRole.SYSTEM_ADMIN]: "管理者",
};
