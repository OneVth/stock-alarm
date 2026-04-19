/*
  Warnings:

  - Made the column `stockName` on table `AlertLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AlertLog" ALTER COLUMN "stockName" SET NOT NULL;
