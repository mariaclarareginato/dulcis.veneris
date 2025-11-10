-- CreateTable
CREATE TABLE `caixa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loja_id` INTEGER NOT NULL,
    `usuario_abertura_id` INTEGER NOT NULL,
    `data_abertura` DATETIME(3) NOT NULL,
    `saldo_inicial` DOUBLE NOT NULL,
    `data_fechamento` DATETIME(3) NULL,
    `saldo_fechamento` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `Caixa_loja_id_fkey`(`loja_id`),
    INDEX `Caixa_usuario_abertura_id_fkey`(`usuario_abertura_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loja_id` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `data_vencimento` DATETIME(3) NOT NULL,
    `pago` BOOLEAN NOT NULL DEFAULT false,
    `data_pagamento` DATETIME(3) NULL,

    INDEX `Despesa_loja_id_fkey`(`loja_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estoque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loja_id` INTEGER NOT NULL,
    `produto_id` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `estoque_minimo` INTEGER NOT NULL,

    INDEX `Estoque_loja_id_fkey`(`loja_id`),
    INDEX `Estoque_produto_id_fkey`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `contato` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `documento` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedorpagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fornecedor_id` INTEGER NOT NULL,
    `despesa_id` INTEGER NOT NULL,
    `valor` DOUBLE NOT NULL,
    `data` DATETIME(3) NOT NULL,

    INDEX `FornecedorPagamento_despesa_id_fkey`(`despesa_id`),
    INDEX `FornecedorPagamento_fornecedor_id_fkey`(`fornecedor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logauditoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produto_id` INTEGER NULL,
    `acao` VARCHAR(191) NOT NULL,
    `tabela_afetada` VARCHAR(191) NOT NULL,
    `registro_id` INTEGER NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `descricao` VARCHAR(191) NULL,

    INDEX `LogAuditoria_produto_id_fkey`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `tipo` ENUM('MATRIZ', 'FILIAL') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `venda_id` INTEGER NOT NULL,
    `tipo` ENUM('DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO') NOT NULL,
    `valor` DOUBLE NOT NULL,
    `detalhe` VARCHAR(191) NULL,

    INDEX `Pagamento_venda_id_fkey`(`venda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `img` VARCHAR(191) NULL,
    `preco_venda` DECIMAL(10, 2) NOT NULL,
    `custo` DECIMAL(10, 2) NOT NULL,
    `categoria` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Produto_sku_key`(`sku`),
    UNIQUE INDEX `Produto_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha_hash` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `perfil` ENUM('CAIXA', 'GERENTE', 'ADMIN') NOT NULL,
    `loja_id` INTEGER NOT NULL,

    UNIQUE INDEX `Usuario_cpf_key`(`cpf`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_loja_id_fkey`(`loja_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_transacao` VARCHAR(191) NOT NULL,
    `caixa_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `loja_id` INTEGER NOT NULL,
    `data_hora` DATETIME(3) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `cmv` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `venda_codigo_transacao_key`(`codigo_transacao`),
    INDEX `Venda_caixa_id_fkey`(`caixa_id`),
    INDEX `Venda_loja_id_fkey`(`loja_id`),
    INDEX `Venda_usuario_id_fkey`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendaitem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `venda_id` INTEGER NOT NULL,
    `pedidos` VARCHAR(191) NULL,
    `produto_id` INTEGER NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `VendaItem_produto_id_fkey`(`produto_id`),
    INDEX `VendaItem_venda_id_fkey`(`venda_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loja_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `data_pedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDENTE', 'EM_PROCESSAMENTO', 'ENVIADO', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    `tipo` VARCHAR(191) NOT NULL DEFAULT 'REPOSICAO_ESTOQUE',

    INDEX `pedido_loja_id_idx`(`loja_id`),
    INDEX `pedido_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itempedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedido_id` INTEGER NOT NULL,
    `produto_id` INTEGER NULL,
    `produto_nome` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,

    INDEX `itempedido_pedido_id_idx`(`pedido_id`),
    INDEX `itempedido_produto_id_idx`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `caixa` ADD CONSTRAINT `Caixa_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caixa` ADD CONSTRAINT `Caixa_usuario_abertura_id_fkey` FOREIGN KEY (`usuario_abertura_id`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `despesa` ADD CONSTRAINT `Despesa_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estoque` ADD CONSTRAINT `Estoque_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estoque` ADD CONSTRAINT `Estoque_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fornecedorpagamento` ADD CONSTRAINT `FornecedorPagamento_despesa_id_fkey` FOREIGN KEY (`despesa_id`) REFERENCES `despesa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fornecedorpagamento` ADD CONSTRAINT `FornecedorPagamento_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logauditoria` ADD CONSTRAINT `LogAuditoria_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pagamento` ADD CONSTRAINT `Pagamento_venda_id_fkey` FOREIGN KEY (`venda_id`) REFERENCES `venda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `Usuario_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `Venda_caixa_id_fkey` FOREIGN KEY (`caixa_id`) REFERENCES `caixa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `Venda_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `Venda_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendaitem` ADD CONSTRAINT `VendaItem_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendaitem` ADD CONSTRAINT `VendaItem_venda_id_fkey` FOREIGN KEY (`venda_id`) REFERENCES `venda`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itempedido` ADD CONSTRAINT `itempedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itempedido` ADD CONSTRAINT `itempedido_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
