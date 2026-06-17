-- AlterTable
ALTER TABLE `Prospect` ADD COLUMN `ownerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Prospect` ADD CONSTRAINT `Prospect_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
