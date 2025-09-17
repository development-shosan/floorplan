/*
  Warnings:

  - You are about to drop the column `address` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Company` DROP COLUMN `address`,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `postalCode` VARCHAR(191) NULL,
    ADD COLUMN `prefecture` VARCHAR(191) NULL,
    ADD COLUMN `streetAddress` VARCHAR(191) NULL;
