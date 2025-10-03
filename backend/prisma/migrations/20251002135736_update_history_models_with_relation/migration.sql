/*
  Warnings:

  - You are about to drop the column `favoriteCount` on the `HistoryParent` table. All the data in the column will be lost.
  - Added the required column `updatedId` to the `HistoryParent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HistoryParent` DROP COLUMN `favoriteCount`,
    ADD COLUMN `totalFavoriteCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `HistoryParent` ADD CONSTRAINT `HistoryParent_updatedId_fkey` FOREIGN KEY (`updatedId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
