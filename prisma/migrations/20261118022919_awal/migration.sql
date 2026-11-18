-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product` ENUM('PDH', 'VEST') NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `basePrice` INTEGER NOT NULL,

    UNIQUE INDEX `Category_product_name_key`(`product`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product` ENUM('PDH', 'VEST') NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `surcharge` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Material_product_name_key`(`product`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FabricColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(40) NOT NULL,
    `hex` VARCHAR(7) NOT NULL,
    `inStock` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `FabricColor_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `zone` VARCHAR(20) NOT NULL,
    `label` VARCHAR(60) NOT NULL,
    `fee` INTEGER NOT NULL,

    UNIQUE INDEX `ShippingRate_zone_key`(`zone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,
    `zone` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `City_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `status` ENUM('menunggu_pembayaran', 'kedaluwarsa', 'dibayar', 'cek_desain', 'perlu_revisi', 'produksi', 'qc', 'siap_kirim', 'dikirim', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'menunggu_pembayaran',
    `paymentState` ENUM('belum_bayar', 'dp_dibayar', 'lunas') NOT NULL DEFAULT 'belum_bayar',
    `paymentScheme` ENUM('LUNAS', 'DP50') NOT NULL,
    `customerName` VARCHAR(60) NOT NULL,
    `whatsapp` VARCHAR(16) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `organization` VARCHAR(80) NULL,
    `shippingMethod` ENUM('KIRIM', 'AMBIL') NOT NULL,
    `address` VARCHAR(200) NULL,
    `city` VARCHAR(60) NULL,
    `postalCode` VARCHAR(5) NULL,
    `subtotal` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `shippingFee` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `amountPaid` INTEGER NOT NULL DEFAULT 0,
    `trackingToken` VARCHAR(40) NOT NULL,
    `courier` VARCHAR(40) NULL,
    `resi` VARCHAR(60) NULL,
    `revisionReason` VARCHAR(300) NULL,
    `version` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_code_key`(`code`),
    UNIQUE INDEX `Order_trackingToken_key`(`trackingToken`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `product` ENUM('PDH', 'VEST') NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `designJson` JSON NOT NULL,
    `bodyColor` VARCHAR(40) NOT NULL,
    `notes` VARCHAR(300) NULL,
    `namePerson` BOOLEAN NOT NULL DEFAULT false,
    `unitPrice` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderSize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `size` VARCHAR(5) NOT NULL,
    `qty` INTEGER NOT NULL,

    UNIQUE INDEX `OrderSize_orderItemId_size_key`(`orderItemId`, `size`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderName` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `size` VARCHAR(5) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderAsset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderItemId` INTEGER NOT NULL,
    `fileName` VARCHAR(120) NOT NULL,
    `technique` VARCHAR(10) NOT NULL,
    `position` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `gatewayRef` VARCHAR(60) NOT NULL,
    `method` VARCHAR(20) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('pending', 'sukses', 'gagal', 'kedaluwarsa') NOT NULL DEFAULT 'pending',
    `paidAt` DATETIME(3) NULL,
    `rawPayload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_gatewayRef_key`(`gatewayRef`),
    INDEX `Payment_paidAt_idx`(`paidAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `status` ENUM('menunggu_pembayaran', 'kedaluwarsa', 'dibayar', 'cek_desain', 'perlu_revisi', 'produksi', 'qc', 'siap_kirim', 'dikirim', 'selesai', 'dibatalkan') NOT NULL,
    `note` VARCHAR(300) NULL,
    `changedBy` VARCHAR(60) NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusLog_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderCounter` (
    `period` VARCHAR(4) NOT NULL,
    `lastNumber` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`period`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(120) NOT NULL,
    `passwordHash` VARCHAR(100) NOT NULL,
    `name` VARCHAR(60) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderSize` ADD CONSTRAINT `OrderSize_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderName` ADD CONSTRAINT `OrderName_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAsset` ADD CONSTRAINT `OrderAsset_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderStatusLog` ADD CONSTRAINT `OrderStatusLog_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
