-- CreateTable
CREATE TABLE `FloorPlanGenerationJob` (
    `job_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'processing',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `estimated_time` VARCHAR(191) NULL,
    `request_payload` JSON NOT NULL,
    `result_payload` JSON NULL,
    `error_message` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `completed_at` DATETIME(3) NULL,
    `history_parent_id` INTEGER NULL,

    UNIQUE INDEX `FloorPlanGenerationJob_job_id_key`(`job_id`),
    PRIMARY KEY (`job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FloorPlanGenerationJob` ADD CONSTRAINT `FloorPlanGenerationJob_history_parent_id_fkey` FOREIGN KEY (`history_parent_id`) REFERENCES `HistoryParent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
