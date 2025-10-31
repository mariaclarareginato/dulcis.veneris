/*
  Warnings:

  - A unique constraint covering the columns `[codigo_transacao]` on the table `venda` will be added. If there are existing duplicate values, this will fail.
  - The required column `codigo_transacao` was added to the `venda` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE `venda` ADD COLUMN `codigo_transacao` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `venda_codigo_transacao_key` ON `venda`(`codigo_transacao`);
