/*
  Warnings:

  - You are about to drop the column `duedate` on the `Installment` table. All the data in the column will be lost.
  - Added the required column `dueDate` to the `Installment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Installment" DROP COLUMN "duedate",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
