/*
  Warnings:

  - You are about to drop the column `birthday` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `birthday` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "birthday";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "birthday";
