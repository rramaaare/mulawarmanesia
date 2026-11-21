-- Kategori PDH diganti menjadi model kemeja dari mockup (Model 01-07), masing-masing dengan harga dasar.
-- Kategori lama diubah namanya (ID tetap) supaya pesanan lama tetap terhubung.

-- AlterTable
ALTER TABLE `Category` ADD COLUMN `pdhModel` VARCHAR(2) NULL;

-- Data: kategori PDH lama -> Model 01-04
UPDATE `Category` SET `name` = 'Model 01', `basePrice` = 175000, `pdhModel` = '01' WHERE `product` = 'PDH' AND `name` = 'Organisasi';
UPDATE `Category` SET `name` = 'Model 02', `basePrice` = 185000, `pdhModel` = '02' WHERE `product` = 'PDH' AND `name` = 'Instansi';
UPDATE `Category` SET `name` = 'Model 03', `basePrice` = 195000, `pdhModel` = '03' WHERE `product` = 'PDH' AND `name` = 'Komunitas';
UPDATE `Category` SET `name` = 'Model 04', `basePrice` = 195000, `pdhModel` = '04' WHERE `product` = 'PDH' AND `name` = 'Perusahaan';

-- Data: Model 05-07 ditambahkan hanya bila database sudah berisi kategori PDH
-- (database baru diisi lengkap oleh `npm run seed`).
INSERT INTO `Category` (`product`, `name`, `basePrice`, `pdhModel`)
  SELECT 'PDH', 'Model 05', 185000, '05' FROM DUAL
  WHERE EXISTS (SELECT 1 FROM `Category` WHERE `pdhModel` = '01')
    AND NOT EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'PDH' AND `name` = 'Model 05');
INSERT INTO `Category` (`product`, `name`, `basePrice`, `pdhModel`)
  SELECT 'PDH', 'Model 06', 195000, '06' FROM DUAL
  WHERE EXISTS (SELECT 1 FROM `Category` WHERE `pdhModel` = '01')
    AND NOT EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'PDH' AND `name` = 'Model 06');
INSERT INTO `Category` (`product`, `name`, `basePrice`, `pdhModel`)
  SELECT 'PDH', 'Model 07', 225000, '07' FROM DUAL
  WHERE EXISTS (SELECT 1 FROM `Category` WHERE `pdhModel` = '01')
    AND NOT EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'PDH' AND `name` = 'Model 07');
