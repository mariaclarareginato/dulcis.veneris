/*
  Warnings:

  - You are about to alter the column `tipo` on the `despesa` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `despesa` MODIFY `tipo` ENUM('FIXA', 'CUSTO_PEDIDO', 'VARIAVEL', 'OUTRA') NOT NULL,
    MODIFY `valor` DECIMAL(10, 2) NOT NULL;
