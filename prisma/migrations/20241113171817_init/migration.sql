-- CreateEnum
CREATE TYPE "ORDER_PACKMAN_STATUS" AS ENUM ('received', 'onway', 'delivered');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "packmanStatus" "ORDER_PACKMAN_STATUS";
