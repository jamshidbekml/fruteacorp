-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "operatorConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "operatorReceivedAt" TIMESTAMP(3),
ADD COLUMN     "packmanDeliveredAt" TIMESTAMP(3),
ADD COLUMN     "packmanReceivedAt" TIMESTAMP(3);
