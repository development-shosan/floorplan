/*
  Warnings:

  - You are about to drop the column `userId` on the `HistoryChild` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `HistoryParent` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `HistoryChild` DROP FOREIGN KEY `HistoryChild_userId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoryParent` DROP FOREIGN KEY `HistoryParent_userId_fkey`;

-- DropIndex
DROP INDEX `HistoryChild_userId_fkey` ON `HistoryChild`;

-- DropIndex
DROP INDEX `HistoryParent_userId_fkey` ON `HistoryParent`;

-- AlterTable
ALTER TABLE `HistoryChild` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `HistoryParent` DROP COLUMN `userId`;

-- AddForeignKey
ALTER TABLE `HistoryParent` ADD CONSTRAINT `HistoryParent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `HistoryChild_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
