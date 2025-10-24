# Dulcis Veneris
<div align="center">
<img width="540" height="540" alt="logo1" src="https://github.com/user-attachments/assets/5f2bc56b-6fa9-44a8-9e2d-968785d0869c" />

<img width="400" height="240" alt="logo2" src="https://github.com/user-attachments/assets/712fc9ea-2711-4c01-87fb-f31df3828c8f" />

</div>

## 

A Dulcis Veneris nasce inspirada em Vênus, a deusa romana do amor e da beleza, trazendo para o universo da chocolataria artesanal uma proposta de exclusividade, elegância e experiência sensorial única.
Este manual orienta a comunicação visual da marca e a arquitetura de nosso sistema de gestão, assegurando consistência e sofisticação em todos os pontos de contato. Com produtos como — trufas, barras, pães de mel e biscoitos — que utilizam cacau cultivado de forma natural na Indonésia e técnicas herdadas de mestres artesãos italianos.


## Técnologias Utilizadas:


- **Next.js** → Framework React para frontend e backend integrado  
- **React** → Biblioteca para construção da interface do usuário  
- **Node.js** → Ambiente de execução JavaScript no servidor  
- **Prisma ORM** → Mapeamento objeto-relacional e migrações do banco  
- **MySQL** → Banco de dados relacional para persistência  
- **TailwindCSS** → Estilização rápida e responsiva (design clean e moderno)  
- **Shadcn/UI** → Componentes de interface reutilizáveis e acessíveis  


## Resumo Executivo:

O projeto visa o desenvolvimento de um sistema de gestão robusto e elegante, composto por:

PDV (Frente de Caixa) rápido e confiável.

Back-office centralizado para matriz e filiais.

Relatórios gerenciais e financeiros consolidados.



### Objetivos

Garantir operação de balcão ágil.

Centralizar cadastros e relatórios na matriz.

Respeitar permissões de acesso entre matriz e filiais.

Gerenciar fluxo financeiro com precisão.

### Escopo / Módulos

Cadastros & Controle de Acesso (lojas, funcionários, fornecedores, produtos).

PDV (abertura de caixa, registro de vendas, pagamento, fechamento).

Gestão Financeira (entradas, despesas, conciliações).

Relatórios (estoque, fluxo de caixa, vendas por período/produto).

### Regras de Negócio & Hierarquia

Filiais: acesso restrito a dados próprios.

Matriz: acesso total + consolidação de relatórios.

Segurança: logs de auditoria para movimentações críticas.


### Modelagem de Dados (resumo)

Loja, Usuário, Produto, Estoque, Caixa, Venda, VendaItem, Pagamento, Despesa, Fornecedor, LogAuditoria.



# Como rodar o projeto: 

## Pré-requisitos

Antes de começar, você precisa ter instalado:

Node.js
 (versão LTS recomendada)

npm
 (vem junto com o Node.js)

MySQL
 rodando localmente

 

## Passo a Passo

1️⃣ Clonar o repositório

```bash

git clone https://github.com/usuario/dulcis-veneris.git
cd dulcis-veneris
```


2️⃣ Configurar variáveis de ambiente
Crie o arquivo .env na raiz do projeto com as credenciais do banco MySQL:

```bash

DATABASE_URL="mysql://usuario:senha@localhost:3306/dulce_venere"

```

3️⃣ Instalar dependências (na pasta app/)

```bash

cd app
npm install

```


4️⃣ Rodar as migrações do Prisma (na pasta prisma/)

```bash

cd ../prisma
npx prisma migrate dev

```


5️⃣ Rodar o seed do banco (dados iniciais)

```bash

npm run prisma:seed

```


6️⃣ Subir o servidor de desenvolvimento (na pasta app/)

```bash

cd ../app
npm run dev

```


7️⃣ Acessar o sistema
Abra no navegador:

```bash

http://localhost:3000

```

# Criadores: 


Charlotte Guedes de Araújo 

Gianlucca D Estéfani

Maria Clara Reginato 

Gabriel Herrera Demarchi





