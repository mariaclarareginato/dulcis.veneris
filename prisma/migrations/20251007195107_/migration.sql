/*
  Warnings:

  - You are about to alter the column `perfil` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- DropForeignKey
ALTER TABLE `caixa` DROP FOREIGN KEY `Caixa_usuario_abertura_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `Usuario_loja_id_fkey`;

-- DropIndex
DROP INDEX `Caixa_usuario_abertura_id_fkey` ON `caixa`;

-- DropIndex
DROP INDEX `Usuario_loja_id_fkey` ON `usuario`;

-- AlterTable
ALTER TABLE `usuario` MODIFY `perfil` ENUM('CAIXA', 'GERENTE', 'ADMIN') NOT NULL;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caixa` ADD CONSTRAINT `Caixa_usuario_abertura_id_fkey` FOREIGN KEY (`usuario_abertura_id`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
