-- CreateTable
CREATE TABLE `pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `loja_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,
    `data_pedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDENTE',
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
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_loja_id_fkey` FOREIGN KEY (`loja_id`) REFERENCES `loja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itempedido` ADD CONSTRAINT `itempedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedido`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itempedido` ADD CONSTRAINT `itempedido_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
