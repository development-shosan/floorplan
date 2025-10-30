/*
  Warnings:

  - Added the required column `request_user_id` to the `FloorPlanGenerationJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `FloorPlanGenerationJob` ADD COLUMN `request_user_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `FloorPlanGenerationJob` ADD CONSTRAINT `FloorPlanGenerationJob_request_user_id_fkey` FOREIGN KEY (`request_user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
