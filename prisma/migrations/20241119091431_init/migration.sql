/*
  Warnings:

  - A unique constraint covering the columns `[areaEN]` on the table `areas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `areaEN` to the `areas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "areaEN" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "areas_areaEN_key" ON "areas"("areaEN");
