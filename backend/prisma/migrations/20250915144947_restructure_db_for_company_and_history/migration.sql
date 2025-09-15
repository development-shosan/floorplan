/*
  Warnings:

  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `History` DROP FOREIGN KEY `History_userId_fkey`;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `nameKana` VARCHAR(191) NULL,
    ADD COLUMN `representative` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE `History`;

-- CreateTable
CREATE TABLE `HistoryParent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `conditions` JSON NOT NULL,
    `tags` VARCHAR(191) NULL,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `customerName` VARCHAR(191) NULL,
    `propertyAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoryChild` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `historyParentId` INTEGER NOT NULL,
    `tag` VARCHAR(191) NULL,
    `floorplanJson` JSON NOT NULL,
    `isDownloaded` BOOLEAN NOT NULL DEFAULT false,
    `pdfPath` VARCHAR(191) NULL,
    `isFavorite` BOOLEAN NOT NULL DEFAULT false,
    `constructionName` VARCHAR(191) NULL,
    `scale` VARCHAR(191) NULL,
    `drawingFormat` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HistoryParent` ADD CONSTRAINT `HistoryParent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `HistoryChild_historyParentId_fkey` FOREIGN KEY (`historyParentId`) REFERENCES `HistoryParent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `HistoryChild_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
