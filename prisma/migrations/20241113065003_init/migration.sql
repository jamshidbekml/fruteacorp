-- DropForeignKey
ALTER TABLE "user_address" DROP CONSTRAINT "user_address_deliveryAreaId_fkey";

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_deliveryAreaId_fkey" FOREIGN KEY ("deliveryAreaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
