/*
  Warnings:

  - You are about to drop the column `promoCodeId` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "promoCodeId",
ADD COLUMN     "promoCode" TEXT DEFAULT '-';
