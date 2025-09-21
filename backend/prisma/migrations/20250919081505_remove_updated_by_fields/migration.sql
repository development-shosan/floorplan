/*
  Warnings:

  - You are about to drop the column `updatedById` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Company` DROP FOREIGN KEY `company_updated_by_fk`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `user_updated_by_fk`;

-- DropIndex
DROP INDEX `company_updated_by_fk` ON `Company`;

-- DropIndex
DROP INDEX `user_updated_by_fk` ON `User`;

-- AlterTable
ALTER TABLE `Company` DROP COLUMN `updatedById`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `updatedById`;
