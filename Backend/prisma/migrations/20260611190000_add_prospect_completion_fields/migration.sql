-- AlterTable
ALTER TABLE `Prospect`
  ADD COLUMN `completed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `completedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Prospect_completed_idx` ON `Prospect`(`completed`);
