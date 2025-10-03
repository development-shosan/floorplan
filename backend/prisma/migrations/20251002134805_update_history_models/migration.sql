/*
  Warnings:

  - You are about to drop the column `floorplanJson` on the `HistoryChild` table. All the data in the column will be lost.
  - You are about to drop the column `isFavorite` on the `HistoryChild` table. All the data in the column will be lost.
  - You are about to drop the column `favoriteCount` on the `HistoryParent` table. All the data in the column will be lost.
  - You are about to drop the column `propertyAddress` on the `HistoryParent` table. All the data in the column will be lost.
  - Added the required column `floorplanData` to the `HistoryChild` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HistoryChild` DROP COLUMN `floorplanJson`,
    DROP COLUMN `isFavorite`,
    ADD COLUMN `floorplanData` JSON NOT NULL,
    ADD COLUMN `isPatternFavorite` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `patternName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `HistoryParent` DROP COLUMN `favoriteCount`,
    DROP COLUMN `propertyAddress`;
