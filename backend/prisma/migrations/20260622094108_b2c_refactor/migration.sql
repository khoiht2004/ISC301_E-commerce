/*
  Warnings:

  - You are about to drop the `news_comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `news_reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `news_comment` DROP FOREIGN KEY `news_comment_newsId_fkey`;

-- DropForeignKey
ALTER TABLE `news_comment` DROP FOREIGN KEY `news_comment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `news_reaction` DROP FOREIGN KEY `news_reaction_newsId_fkey`;

-- DropForeignKey
ALTER TABLE `news_reaction` DROP FOREIGN KEY `news_reaction_userId_fkey`;

-- DropForeignKey
ALTER TABLE `staff_profile` DROP FOREIGN KEY `staff_profile_userId_fkey`;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `supplierId` INTEGER NULL;

-- DropTable
DROP TABLE `news_comment`;

-- DropTable
DROP TABLE `news_reaction`;

-- DropTable
DROP TABLE `staff_profile`;

-- CreateTable
CREATE TABLE `user_profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gender` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `user_profile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchCode` VARCHAR(191) NOT NULL,
    `importQuantity` INTEGER NOT NULL,
    `currentQuantity` INTEGER NOT NULL DEFAULT 0,
    `costPrice` INTEGER NOT NULL,
    `manufactureDate` DATETIME(3) NULL,
    `expirationDate` DATETIME(3) NOT NULL,
    `importDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `productId` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,

    UNIQUE INDEX `product_batch_batchCode_key`(`batchCode`),
    INDEX `product_batch_expirationDate_idx`(`expirationDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_complaint` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'RESOLVING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `resolution` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profile` ADD CONSTRAINT `user_profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_batch` ADD CONSTRAINT `product_batch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_batch` ADD CONSTRAINT `product_batch_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_review` ADD CONSTRAINT `product_review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_review` ADD CONSTRAINT `product_review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_review` ADD CONSTRAINT `product_review_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_complaint` ADD CONSTRAINT `order_complaint_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_complaint` ADD CONSTRAINT `order_complaint_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
