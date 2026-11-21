-- Kolom model berlaku untuk PDH dan VEST, jadi namanya dibuat umum.
ALTER TABLE `Category` RENAME COLUMN `pdhModel` TO `designModel`;

-- Data: kategori VEST lama -> Model 01-04 (ID tetap, pesanan lama tetap terhubung)
UPDATE `Category` SET `name` = 'Model 01', `basePrice` = 115000, `designModel` = '01' WHERE `product` = 'VEST' AND `name` = 'Proyek';
UPDATE `Category` SET `name` = 'Model 02', `basePrice` = 115000, `designModel` = '02' WHERE `product` = 'VEST' AND `name` = 'Event';
UPDATE `Category` SET `name` = 'Model 03', `basePrice` = 125000, `designModel` = '03' WHERE `product` = 'VEST' AND `name` = 'Relawan';
UPDATE `Category` SET `name` = 'Model 04', `basePrice` = 110000, `designModel` = '04' WHERE `product` = 'VEST' AND `name` = 'Brand';

-- Data: VEST Model 05-06 hanya bila database sudah berisi kategori VEST (database baru diisi `npm run seed`)
INSERT INTO `Category` (`product`, `name`, `basePrice`, `designModel`)
  SELECT 'VEST', 'Model 05', 130000, '05' FROM DUAL
  WHERE EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'VEST' AND `designModel` = '01')
    AND NOT EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'VEST' AND `name` = 'Model 05');
INSERT INTO `Category` (`product`, `name`, `basePrice`, `designModel`)
  SELECT 'VEST', 'Model 06', 120000, '06' FROM DUAL
  WHERE EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'VEST' AND `designModel` = '01')
    AND NOT EXISTS (SELECT 1 FROM `Category` WHERE `product` = 'VEST' AND `name` = 'Model 06');
