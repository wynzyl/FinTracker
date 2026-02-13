-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'gcash', 'bdo_savings', 'cbs_checking');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL DEFAULT 'cash';

-- CreateIndex
CREATE INDEX "Transaction_paymentMode_idx" ON "Transaction"("paymentMode");
