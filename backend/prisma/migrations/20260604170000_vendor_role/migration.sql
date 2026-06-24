UPDATE `user` SET `role` = 'STAFF' WHERE `role` = 'STAFF';

ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER';

ALTER TABLE `support_request` DROP FOREIGN KEY `support_request_assignedStaffId_fkey`;
ALTER TABLE `support_request` CHANGE `assignedStaffId` `assignedStaffId` INTEGER NULL;
ALTER TABLE `support_request`
  ADD CONSTRAINT `support_request_assignedStaffId_fkey`
  FOREIGN KEY (`assignedStaffId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `staff_profile` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `brandName` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `logo` VARCHAR(191) NULL,
  `contactName` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `status` ENUM('ACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `userId` INTEGER NOT NULL,

  UNIQUE INDEX `staff_profile_slug_key`(`slug`),
  UNIQUE INDEX `staff_profile_userId_key`(`userId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `staff_profile`
  ADD CONSTRAINT `staff_profile_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX `product_createdById_idx` ON `product`(`createdById`);
CREATE INDEX `product_isDeleted_isPublished_idx` ON `product`(`isDeleted`, `isPublished`);
