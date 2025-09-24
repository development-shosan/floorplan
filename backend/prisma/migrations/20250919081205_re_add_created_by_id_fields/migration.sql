/*
  Warnings:

  - Added the required column `createdById` to the `HistoryChild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `HistoryParent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Company` ADD COLUMN `createdById` INTEGER NULL;

-- AlterTable
ALTER TABLE `HistoryChild` ADD COLUMN `createdById` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `HistoryParent` ADD COLUMN `createdById` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdById` INTEGER NULL;
