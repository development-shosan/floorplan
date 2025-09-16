/*
  Warnings:

  - Made the column `status` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values to true
UPDATE `Company` SET `status` = true WHERE `status` IS NULL;
UPDATE `User` SET `status` = true WHERE `status` IS NULL;

-- AlterTable
ALTER TABLE `Company` MODIFY `status` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `User` MODIFY `status` BOOLEAN NOT NULL DEFAULT true;
