/*
  Warnings:

  - You are about to drop the column `createdById` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `HistoryChild` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `HistoryParent` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `HistoryChild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `HistoryParent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Company` DROP FOREIGN KEY `company_created_by_fk`;

-- DropForeignKey
ALTER TABLE `HistoryChild` DROP FOREIGN KEY `history_child_created_by_fk`;

-- DropForeignKey
ALTER TABLE `HistoryParent` DROP FOREIGN KEY `history_parent_created_by_fk`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `user_created_by_fk`;

-- DropIndex
DROP INDEX `company_created_by_fk` ON `Company`;

-- DropIndex
DROP INDEX `history_child_created_by_fk` ON `HistoryChild`;

-- DropIndex
DROP INDEX `history_parent_created_by_fk` ON `HistoryParent`;

-- DropIndex
DROP INDEX `user_created_by_fk` ON `User`;

-- AlterTable
ALTER TABLE `Company` DROP COLUMN `createdById`;

-- AlterTable
ALTER TABLE `HistoryChild` DROP COLUMN `createdById`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `HistoryParent` DROP COLUMN `createdById`,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `createdById`;

-- AddForeignKey
ALTER TABLE `HistoryParent` ADD CONSTRAINT `HistoryParent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `HistoryChild_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
