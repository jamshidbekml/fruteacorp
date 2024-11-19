/*
  Warnings:

  - Added the required column `title_en` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "title_en" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "extraInfoEn" TEXT,
ADD COLUMN     "title_en" TEXT NOT NULL;
