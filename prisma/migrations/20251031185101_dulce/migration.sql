/*
  Warnings:

  - The values [CARTAO] on the enum `pagamento_tipo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `pagamento` MODIFY `tipo` ENUM('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO') NOT NULL;
