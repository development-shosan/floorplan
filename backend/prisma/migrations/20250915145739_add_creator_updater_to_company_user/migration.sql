-- DropForeignKey
ALTER TABLE `HistoryChild` DROP FOREIGN KEY `HistoryChild_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `HistoryChild` DROP FOREIGN KEY `HistoryChild_historyParentId_fkey`;

-- DropForeignKey
ALTER TABLE `HistoryParent` DROP FOREIGN KEY `HistoryParent_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_companyId_fkey`;

-- AlterTable
ALTER TABLE `Company` ADD COLUMN `createdById` INTEGER NULL,
    ADD COLUMN `updatedById` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdById` INTEGER NULL,
    ADD COLUMN `updatedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `company_created_by_fk` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Company` ADD CONSTRAINT `company_updated_by_fk` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `user_created_by_fk` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `user_updated_by_fk` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `user_company_fk` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryParent` ADD CONSTRAINT `history_parent_created_by_fk` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `history_child_parent_fk` FOREIGN KEY (`historyParentId`) REFERENCES `HistoryParent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryChild` ADD CONSTRAINT `history_child_created_by_fk` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
