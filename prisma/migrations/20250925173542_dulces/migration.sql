/*
  Warnings:

  - You are about to alter the column `saldo_inicial` on the `caixa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `saldo_fechamento` on the `caixa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `descricao` on the `despesa` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `valor` on the `despesa` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `nome` on the `fornecedor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `contato` on the `fornecedor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `email` on the `fornecedor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `valor` on the `fornecedorpagamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `nome` on the `loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `endereco` on the `loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `cidade` on the `loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `estado` on the `loja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `valor` on the `pagamento` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `detalhe` on the `pagamento` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the column `total_vendas` on the `produto` table. All the data in the column will be lost.
  - You are about to alter the column `nome` on the `produto` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `preco_venda` on the `produto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `custo` on the `produto` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `nome` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `email` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `senha_hash` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `total` on the `venda` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `pedidos` on the `vendaitem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `preco_unitario` on the `vendaitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.
  - You are about to alter the column `subtotal` on the `vendaitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Double`.

*/
-- DropForeignKey
ALTER TABLE `caixa` DROP FOREIGN KEY `fk_caixa_loja`;

-- DropForeignKey
ALTER TABLE `caixa` DROP FOREIGN KEY `fk_caixa_usuario`;

-- DropForeignKey
ALTER TABLE `despesa` DROP FOREIGN KEY `fk_despesa_loja`;

-- DropForeignKey
ALTER TABLE `estoque` DROP FOREIGN KEY `fk_estoque_loja`;

-- DropForeignKey
ALTER TABLE `estoque` DROP FOREIGN KEY `fk_estoque_produto`;

-- DropForeignKey
ALTER TABLE `fornecedorpagamento` DROP FOREIGN KEY `fk_fp_despesa`;

-- DropForeignKey
ALTER TABLE `fornecedorpagamento` DROP FOREIGN KEY `fk_fp_fornecedor`;

-- DropForeignKey
ALTER TABLE `logauditoria` DROP FOREIGN KEY `fk_log_produto`;

-- DropForeignKey
ALTER TABLE `pagamento` DROP FOREIGN KEY `fk_pagamento_venda`;

-- DropForeignKey
ALTER TABLE `usuario` DROP FOREIGN KEY `fk_usuario_loja`;

-- DropForeignKey
ALTER TABLE `venda` DROP FOREIGN KEY `fk_venda_caixa`;

-- DropForeignKey
ALTER TABLE `venda` DROP FOREIGN KEY `fk_venda_loja`;

-- DropForeignKey
ALTER TABLE `venda` DROP FOREIGN KEY `fk_venda_usuario`;

-- DropForeignKey
ALTER TABLE `vendaitem` DROP FOREIGN KEY `fk_vendaitem_produto`;

-- DropForeignKey
ALTER TABLE `vendaitem` DROP FOREIGN KEY `fk_vendaitem_venda`;

-- DropIndex
DROP INDEX `fk_caixa_loja` ON `caixa`;

-- DropIndex
DROP INDEX `fk_caixa_usuario` ON `caixa`;

-- DropIndex
DROP INDEX `fk_despesa_loja` ON `despesa`;

-- DropIndex
DROP INDEX `fk_estoque_loja` ON `estoque`;

-- DropIndex
DROP INDEX `fk_estoque_produto` ON `estoque`;

-- DropIndex
DROP INDEX `fk_fp_despesa` ON `fornecedorpagamento`;

-- DropIndex
DROP INDEX `fk_fp_fornecedor` ON `fornecedorpagamento`;

-- DropIndex
DROP INDEX `fk_log_produto` ON `logauditoria`;

-- DropIndex
DROP INDEX `fk_pagamento_venda` ON `pagamento`;

-- DropIndex
DROP INDEX `fk_usuario_loja` ON `usuario`;

-- DropIndex
DROP INDEX `fk_venda_caixa` ON `venda`;

-- DropIndex
DROP INDEX `fk_venda_loja` ON `venda`;

-- DropIndex
DROP INDEX `fk_venda_usuario` ON `venda`;

-- DropIndex
DROP INDEX `fk_vendaitem_produto` ON `vendaitem`;

-- DropIndex
DROP INDEX `fk_vendaitem_venda` ON `vendaitem`;

-- AlterTable
ALTER TABLE `caixa` MODIFY `data_abertura` DATETIME(3) NOT NULL,
    MODIFY `saldo_inicial` DOUBLE NOT NULL,
    MODIFY `data_fechamento` DATETIME(3) NULL,
    MODIFY `saldo_fechamento` DOUBLE NULL,
    MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `despesa` MODIFY `tipo` VARCHAR(191) NOT NULL,
    MODIFY `descricao` VARCHAR(191) NOT NULL,
    MODIFY `valor` DOUBLE NOT NULL,
    MODIFY `data_vencimento` DATETIME(3) NOT NULL,
    MODIFY `data_pagamento` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `fornecedor` MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `contato` VARCHAR(191) NULL,
    MODIFY `telefone` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `documento` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `fornecedorpagamento` MODIFY `valor` DOUBLE NOT NULL,
    MODIFY `data` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `logauditoria` MODIFY `acao` VARCHAR(191) NOT NULL,
    MODIFY `tabela_afetada` VARCHAR(191) NOT NULL,
    MODIFY `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `descricao` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loja` MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `endereco` VARCHAR(191) NOT NULL,
    MODIFY `cidade` VARCHAR(191) NOT NULL,
    MODIFY `estado` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `pagamento` MODIFY `valor` DOUBLE NOT NULL,
    MODIFY `detalhe` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `produto` DROP COLUMN `total_vendas`,
    MODIFY `sku` VARCHAR(191) NOT NULL,
    MODIFY `codigo` VARCHAR(191) NOT NULL,
    MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `descricao` VARCHAR(191) NULL,
    MODIFY `preco_venda` DOUBLE NOT NULL,
    MODIFY `custo` DOUBLE NOT NULL,
    MODIFY `categoria` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `nome` VARCHAR(191) NOT NULL,
    MODIFY `cpf` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `senha_hash` VARCHAR(191) NOT NULL,
    MODIFY `telefone` VARCHAR(191) NULL,
    MODIFY `perfil` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `venda` MODIFY `data_hora` DATETIME(3) NOT NULL,
    MODIFY `total` DOUBLE NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `vendaitem` MODIFY `pedidos` VARCHAR(191) NULL,
    MODIFY `preco_unitario` DOUBLE NOT NULL,
    MODIFY `subtotal` DOUBLE NOT NULL;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Estoque` ADD CONSTRAINT `Estoque_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caixa` ADD CONSTRAINT `Caixa_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Caixa` ADD CONSTRAINT `Caixa_usuario_abertura_id_fkey` FOREIGN KEY (`usuario_abertura_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_caixa_id_fkey` FOREIGN KEY (`caixa_id`) REFERENCES `Caixa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venda` ADD CONSTRAINT `Venda_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendaItem` ADD CONSTRAINT `VendaItem_venda_id_fkey` FOREIGN KEY (`venda_id`) REFERENCES `Venda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VendaItem` ADD CONSTRAINT `VendaItem_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pagamento` ADD CONSTRAINT `Pagamento_venda_id_fkey` FOREIGN KEY (`venda_id`) REFERENCES `Venda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Despesa` ADD CONSTRAINT `Despesa_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `Loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FornecedorPagamento` ADD CONSTRAINT `FornecedorPagamento_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `Fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FornecedorPagamento` ADD CONSTRAINT `FornecedorPagamento_despesa_id_fkey` FOREIGN KEY (`despesa_id`) REFERENCES `Despesa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogAuditoria` ADD CONSTRAINT `LogAuditoria_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `Produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `Produto_codigo_key` ON `Produto`(`codigo`);
DROP INDEX `codigo` ON `produto`;

-- RedefineIndex
CREATE UNIQUE INDEX `Produto_sku_key` ON `Produto`(`sku`);
DROP INDEX `sku` ON `produto`;

-- RedefineIndex
CREATE UNIQUE INDEX `Usuario_cpf_key` ON `Usuario`(`cpf`);
DROP INDEX `cpf` ON `usuario`;

-- RedefineIndex
CREATE UNIQUE INDEX `Usuario_email_key` ON `Usuario`(`email`);
DROP INDEX `email` ON `usuario`;
