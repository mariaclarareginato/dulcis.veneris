-- =========================
-- Criação de Tabelas
-- =========================

CREATE TABLE Loja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(255) NOT NULL,
  estado VARCHAR(255) NOT NULL,
  tipo ENUM('MATRIZ', 'FILIAL') NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  perfil VARCHAR(100) NOT NULL,
  loja_id INT NOT NULL,
  CONSTRAINT fk_usuario_loja FOREIGN KEY (loja_id) REFERENCES Loja(id)
);

CREATE TABLE Fornecedor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  contato VARCHAR(255),
  telefone VARCHAR(20),
  email VARCHAR(255),
  documento VARCHAR(50)
);

CREATE TABLE Produto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(100) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco_venda DECIMAL(10,2) NOT NULL,
  custo DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  total_vendas INT NOT NULL DEFAULT 0
);

CREATE TABLE Estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loja_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  estoque_minimo INT NOT NULL,
  CONSTRAINT fk_estoque_loja FOREIGN KEY (loja_id) REFERENCES Loja(id),
  CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES Produto(id)
);

CREATE TABLE Caixa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loja_id INT NOT NULL,
  usuario_abertura_id INT NOT NULL,
  data_abertura DATETIME NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL,
  data_fechamento DATETIME,
  saldo_fechamento DECIMAL(10,2),
  status VARCHAR(50) NOT NULL,
  CONSTRAINT fk_caixa_loja FOREIGN KEY (loja_id) REFERENCES Loja(id),
  CONSTRAINT fk_caixa_usuario FOREIGN KEY (usuario_abertura_id) REFERENCES Usuario(id)
);

CREATE TABLE Venda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caixa_id INT NOT NULL,
  usuario_id INT NOT NULL,
  loja_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  CONSTRAINT fk_venda_caixa FOREIGN KEY (caixa_id) REFERENCES Caixa(id),
  CONSTRAINT fk_venda_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
  CONSTRAINT fk_venda_loja FOREIGN KEY (loja_id) REFERENCES Loja(id)
);

CREATE TABLE VendaItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venda_id INT NOT NULL,
  pedidos VARCHAR(255),
  produto_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_vendaitem_venda FOREIGN KEY (venda_id) REFERENCES Venda(id),
  CONSTRAINT fk_vendaitem_produto FOREIGN KEY (produto_id) REFERENCES Produto(id)
);

CREATE TABLE Pagamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venda_id INT NOT NULL,
  tipo ENUM('DINHEIRO', 'CARTAO', 'PIX') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  detalhe VARCHAR(255),
  CONSTRAINT fk_pagamento_venda FOREIGN KEY (venda_id) REFERENCES Venda(id)
);

CREATE TABLE Despesa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loja_id INT NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT FALSE,
  data_pagamento DATE,
  CONSTRAINT fk_despesa_loja FOREIGN KEY (loja_id) REFERENCES Loja(id)
);

CREATE TABLE FornecedorPagamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fornecedor_id INT NOT NULL,
  despesa_id INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  CONSTRAINT fk_fp_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES Fornecedor(id),
  CONSTRAINT fk_fp_despesa FOREIGN KEY (despesa_id) REFERENCES Despesa(id)
);

CREATE TABLE LogAuditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produto_id INT,
  acao VARCHAR(100) NOT NULL,
  tabela_afetada VARCHAR(100) NOT NULL,
  registro_id INT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descricao TEXT,
  CONSTRAINT fk_log_produto FOREIGN KEY (produto_id) REFERENCES Produto(id)
);

-- =========================
-- Triggers
-- =========================

DELIMITER //

-- Atualiza total_vendas quando insere item em venda
CREATE TRIGGER trg_after_venda_item_insert
AFTER INSERT ON VendaItem
FOR EACH ROW
BEGIN
    UPDATE Produto
    SET total_vendas = total_vendas + NEW.quantidade
    WHERE id = NEW.produto_id;
END;
//

-- Decrementa estoque automaticamente na venda
CREATE TRIGGER trg_after_venda_item_insert_estoque
AFTER INSERT ON VendaItem
FOR EACH ROW
BEGIN
    UPDATE Estoque
    SET quantidade = quantidade - NEW.quantidade
    WHERE produto_id = NEW.produto_id
    LIMIT 1;
END;
//

-- Restaura estoque caso item de venda seja removido
CREATE TRIGGER trg_after_venda_item_delete_estoque
AFTER DELETE ON VendaItem
FOR EACH ROW
BEGIN
    UPDATE Estoque
    SET quantidade = quantidade + OLD.quantidade
    WHERE produto_id = OLD.produto_id
    LIMIT 1;
END;
//

-- Log de alterações em Produto
CREATE TRIGGER trg_after_update_produto
AFTER UPDATE ON Produto
FOR EACH ROW
BEGIN
    INSERT INTO LogAuditoria (produto_id, acao, tabela_afetada, registro_id, descricao)
    VALUES (NEW.id, 'UPDATE', 'Produto', NEW.id, CONCAT('Produto atualizado: ', NEW.nome));
END;
//

-- Log de exclusão de Venda
CREATE TRIGGER trg_after_delete_venda
AFTER DELETE ON Venda
FOR EACH ROW
BEGIN
    INSERT INTO LogAuditoria (acao, tabela_afetada, registro_id, descricao)
    VALUES (NULL, 'Venda', OLD.id, 'Venda removida');
END;
//

DELIMITER ;
