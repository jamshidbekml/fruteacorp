-- CreateEnum
CREATE TYPE "ORDER_OPERATOR_STATUS" AS ENUM ('received', 'confirmed');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "operatorStatus" "ORDER_OPERATOR_STATUS";

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "description_uz" DROP NOT NULL,
ALTER COLUMN "description_ru" DROP NOT NULL,
ALTER COLUMN "extraInfoUz" DROP NOT NULL,
ALTER COLUMN "extraInfoRu" DROP NOT NULL;
