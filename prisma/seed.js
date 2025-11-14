import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
import 'dotenv/config';

async function main() {
  console.log('🧹 Limpando tabelas...');
 
  await prisma.$transaction([
  prisma.estoque.deleteMany(),
  prisma.produto.deleteMany(),
  prisma.usuario.deleteMany(),
  prisma.loja.deleteMany(),
]);


// --- Lógica para obter a data do mês atual ---

const dataAtual = new Date();
const ano = dataAtual.getFullYear();
// getMonth() retorna de 0 (Janeiro) a 11 (Dezembro), por isso somamos 1.
const mesNumero = dataAtual.getMonth() + 1; 
const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' }); // Ex: "novembro"

// Formata o mês para ter 2 dígitos (ex: 01, 10, 11)
const mesFormatado = mesNumero.toString().padStart(2, '0');

// --- Definição das Datas de Vencimento ---
// Usaremos o dia 5 para Salários e o dia 15 para as contas de consumo/Aluguel.

const diaVencimentoContas = 15;
const diaVencimentoSalario = 5;

// Estrutura yyyy-mm-ddT00:00:00.000Z para as contas (dia 15)
const dataVencimentoContasStr = `${ano}-${mesFormatado}-${diaVencimentoContas.toString().padStart(2, '0')}T00:00:00.000Z`;

// Estrutura yyyy-mm-ddT00:00:00.000Z para os salários (dia 5)
const dataVencimentoSalarioStr = `${ano}-${mesFormatado}-${diaVencimentoSalario.toString().padStart(2, '0')}T00:00:00.000Z`;



  console.log("🏪 Criando lojas...");

  const lojaMatriz = await prisma.loja.create({
    data: {
      nome: "Dulcis Veneris - Matriz",
      endereco: "Doutor Januário Miraglia, 120",
      cidade: "Campos do Jordão",
      estado: "SP",
      tipo: "MATRIZ",
    },
  });

  const lojaSP = await prisma.loja.create({
    data: {
      nome: "Dulcis Veneris - São Paulo",
      endereco: "Rua das Amêndoas, 120",
      cidade: "São Paulo",
      estado: "SP",
      tipo: "FILIAL",
    },
  });

  const lojaRJ = await prisma.loja.create({
    data: {
      nome: "Dulcis Veneris - Rio de Janeiro",
      endereco: "Avenida Cacau, 87",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      tipo: "FILIAL",
    },
  });

  console.log("Criando usuários...");

  const senhaHash = await bcrypt.hash("senha123", 10);

  // Admin
  const admin = await prisma.usuario.create({
    data: {
      nome: "Gabriel",
      cpf: "111.111.111-11",
      email: "gabriel@email.com",
      senha_hash: senhaHash,
      telefone: "(11)11111-1111",
      perfil: "ADMIN",
      loja_id: lojaMatriz.id,
    },
  });

  // Gerentes
  const gerenteSP = await prisma.usuario.create({
    data: {
      nome: "Gustavo",
      cpf: "222.222.222-22",
      email: "gustavo@email.com",
      senha_hash: senhaHash,
      telefone: "(22)22222-2222",
      perfil: "GERENTE",
      loja_id: lojaSP.id,
    },
  });

  const gerenteRJ = await prisma.usuario.create({
    data: {
      nome: "Henry",
      cpf: "333.333.333-33",
      email: "henry@email.com",
      senha_hash: senhaHash,
      telefone: "(33)33333-3333",
      perfil: "GERENTE",
      loja_id: lojaRJ.id,
    },
  });

  // Caixas
  await prisma.usuario.createMany({
    data: [
      {
        nome: "Caixa SP 1",
        cpf: "444.444.444-44",
        email: "caixa1@sp.com",
        senha_hash: senhaHash,
        telefone: "(44)44444-4444",
        perfil: "CAIXA",
        loja_id: lojaSP.id,
      },
      {
        nome: "Caixa SP 2",
        cpf: "555.555.555-55",
        email: "caixa2@sp.com",
        senha_hash: senhaHash,
        telefone: "(55)55555-5555",
        perfil: "CAIXA",
        loja_id: lojaSP.id,
      },
      {
        nome: "Caixa SP 3",
        cpf: "666.666.666-66",
        email: "caixa3@sp.com",
        senha_hash: senhaHash,
        telefone: "(66)66666-6666",
        perfil: "CAIXA",
        loja_id: lojaSP.id,
      },
      {
        nome: "Caixa RJ 1",
        cpf: "777.777.777-77",
        email: "caixa1@rj.com",
        senha_hash: senhaHash,
        telefone: "(77)77777-7777",
        perfil: "CAIXA",
        loja_id: lojaRJ.id,
      },
      {
        nome: "Caixa RJ 2",
        cpf: "888.888.888-88",
        email: "caixa2@rj.com",
        senha_hash: senhaHash,
        telefone: "(88)88888-8888",
        perfil: "CAIXA",
        loja_id: lojaRJ.id,
      },
      {
        nome: "Caixa RJ 3",
        cpf: "999.999.999-99",
        email: "caixa3@rj.com ",
        senha_hash: senhaHash,
        telefone: "(99)99999-9999",
        perfil: "CAIXA",
        loja_id: lojaRJ.id,
      },
    ],
  });


// (Despesas)

console.log("💵 Criando despesas fixas para a Loja 1 e Loja 2...");

// Define o array base das despesas (inicialmente Loja 1)
const despesasBase = [
 {
 "tipo": "FIXA",
 "descricao": `Aluguel da Loja - ${nomeMes}/${ano}`,
 "valor": 2500.00,
 "data_vencimento": dataVencimentoContasStr,
 "pago": false
 },
 {
 "tipo": "FIXA",
 "descricao": `Fatura de Internet - ${nomeMes}/${ano}`,
 "valor": 500.00,
 "data_vencimento": dataVencimentoContasStr,
 "pago": false
 },
 {
  "tipo": "FIXA",
 "descricao": `Conta de Água - ${nomeMes}/${ano}`,
 "valor": 1000.00,
 "data_vencimento": dataVencimentoContasStr,
 "pago": false
 },
 {
 "tipo": "FIXA",
 "descricao": `Conta de Luz/Energia - ${nomeMes}/${ano}`,
 "valor": 1000.00,
 "data_vencimento": dataVencimentoContasStr,
 "pago": false
 },
 {
 "tipo": "FIXA",
 "descricao": `Salários dos Funcionários - ${nomeMes}/${ano}`,
 "valor": 5000.00,
 "data_vencimento": dataVencimentoSalarioStr, // Vencimento no dia 5
 "pago": false
 },
];

// Cria os dados finais, mapeando para Loja 1 e Loja 2
const despesasLoja1 = despesasBase.map(d => ({ ...d, loja_id: 2 }));
const despesasLoja2 = despesasBase.map(d => ({ ...d, loja_id: 3 }));

const despesasfixas = await prisma.despesa.createMany({
 data: [...despesasLoja1, ...despesasLoja2], // Combina os dados
 skipDuplicates: true,
});
console.log(`✅ ${despesasfixas.count} despesas fixas criadas (Loja 1 e Loja 2).`);

  // ----------------------------
  // 4. Criar produtos
  // ----------------------------
  console.log("🍫 Criando produtos...");
  const produtosData = [
      {
        sku: "SKU001",
        codigo: "COD001",
        nome: "Clássicos",
        descricao:
          "A linha Clássicos Dulce Venere representa a essência e a tradição da marca, sendo os verdadeiros carros-chefe e os mais vendidos do nosso portfólio. Reúne os sabores que encantam diferentes paladares e atravessam gerações. Composta pelo Chocolate ao Leite, cremoso e equilibrado; o Chocolate Meio-Amargo 70% Cacau, intenso e sofisticado; e o Chocolate Branco, delicado e aveludado, essa seleção foi criada para oferecer experiências únicas em cada mordida. Uma verdadeira celebração do cacau em suas formas mais apreciadas, unindo tradição, qualidade e prazer em cada detalhe.",
        img: "/catalogo/chocolates.png",
        preco_venda: 70.0,
        custo: 40.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU002",
        codigo: "COD002",
        nome: "Chocolate Mel d’Oro",
        descricao:
          "Um encontro perfeito entre intensidade e frescor. O Chocolate Meio-Amargo 70% Cacau com Laranja e Mel Dulce Venere combina o sabor marcante do cacau de alta qualidade com notas cítricas delicadas da laranja. O resultado é uma barra sofisticada, equilibrada e refrescante, que proporciona uma experiência sensorial única e inesquecível.",
        img: "/catalogo/chocolate4.png",
        preco_venda: 90.0,
        custo: 80.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU003",
        codigo: "COD003",
        nome: "Chocolate Cecilia",
        descricao:
          "O Chocolate Cecilia é a união perfeita entre suavidade e frescor. Elaborado com chocolate branco de altíssima qualidade e um toque cítrico vibrante, oferece uma experiência cremosa, delicada e surpreendente. Cada pedaço revela uma combinação única de doçura aveludada e notas refrescantes, trazendo leveza e elegância em cada mordida.",
        img: "/catalogo/chocolate5.png",
        preco_venda: 100.0,
        custo: 90.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU004",
        codigo: "COD004",
        nome: "Chocolate Expresso",
        descricao:
          "O Chocolate Expresso é a escolha ideal para os amantes de sabores intensos. Combinando o cacau nobre ao aroma marcante do café expresso, resulta em uma barra sofisticada, envolvente e energizante. A fusão do amargor equilibrado com a cremosidade do chocolate cria uma experiência sensorial única, perfeita para quem aprecia prazer e intensidade em cada detalhe.",
        img: "/catalogo/chocolate6.png",
        preco_venda: 100.0,
        custo: 90.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU005",
        codigo: "COD005",
        nome: "Chocolate Caramelo & Flor de Sal Dulce Venere",
        descricao:
          "Uma combinação irresistível de contrastes. O Chocolate Caramelo & Flor de Sal Dulce Venere une a intensidade do cacau nobre ao dulçor cremoso do caramelo, equilibrado pelo toque sofisticado da flor de sal. Essa harmonia perfeita entre doce e salgado proporciona uma explosão de sabor que surpreende o paladar e transforma cada mordida em uma experiência gourmet inesquecível.",
        img: "/catalogo/chocolate7.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU006",
        codigo: "COD006",
        nome: "Chocolate Branco com Frutas Vermelhas Dulce Venere",
        descricao:
          "Refinado e vibrante, o Chocolate Branco com Frutas Vermelhas Dulce Venere combina a suavidade cremosa do chocolate branco com a intensidade das frutas vermelhas. O contraste perfeito entre a doçura delicada e a acidez natural das frutas cria uma experiência sofisticada, fresca e inesquecível. Cada pedaço é um convite ao prazer e à elegância, transformando momentos simples em celebrações de sabor.",
        img: "/catalogo/chocolate8.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU007",
        codigo: "COD007",
        nome: "Chocolate ao Leite com Avelã Dulce Venere",
        descricao:
          "Com um toque de luxo e uma alma clássica, o Chocolate ao Leite com Avelã Dulce Venere é a perfeita fusão da riqueza do chocolate cremoso com o recheio aveludado de avelã. A combinação sublime entre a suavidade do chocolate e o sabor marcante e profundo da avelã resulta numa experiência de degustação memorável. É uma celebração de puro deleite e requinte.",
        img: "/catalogo/chocolate9.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU008",
        codigo: "COD008",
        nome: "Chocolate ao Leite com Maracujá Dulce Venere",
        descricao:
          "Uma combinação ousada e refrescante, o Chocolate ao Leite com Maracujá Dulce Venere surpreende ao unir a doçura familiar do chocolate ao leite com a explosão de acidez e frescor do maracujá. O contraste vibrante de sabores cria uma jornada sensorial única, que é tanto cativante quanto elegante. Cada mordida é um convite para uma descoberta de sabor.",
        img: "/catalogo/chocolate10.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU009",
        codigo: "COD009",
        nome: "Chocolate ao Leite com Pistache Dulce Venere",
        descricao:
          "Com sua personalidade única e sabor inconfundível, o Chocolate ao Leite com Pistache Dulce Venere é a definição de indulgência sofisticada. A suavidade aveludada do chocolate ao leite encontra o sabor delicado e a crocância sutil do pistache, criando uma harmonia de texturas e paladares. O resultado é uma experiência de degustação rara, que celebra a união de ingredientes clássicos de uma forma moderna e irresistível.",
        img: "/catalogo/chocolate11.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU010",
        codigo: "COD010",
        nome: "Chocolate ao Leite com Baunilha Dulce Venere",
        descricao:
          "Uma celebração de sabores clássicos, o Chocolate ao Leite com Baunilha Dulce Venere combina a riqueza aveludada do chocolate com o aroma e o sabor reconfortantes da baunilha. A fusão da cremosidade do chocolate com as notas sutis e doces da baunilha cria uma experiência de degustação suave e indulgente. É a perfeita união de simplicidade e sofisticação, transformando cada pedaço em um momento de puro prazer.",
        img: "/catalogo/chocolate12.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU011",
        codigo: "COD011",
        nome: "Chocolate ao Leite com Coco Dulce Venere",
        descricao:
          "Uma combinação tropical e indulgente, o Chocolate ao Leite com Coco Dulce Venere evoca a união perfeita entre a riqueza aveludada do chocolate e a leveza e frescor do coco. O contraste entre a intensidade do cacau e a doçura suave e exótica do recheio cria uma experiência de degustação que é ao mesmo tempo ousada e reconfortante. É a perfeita celebração de um sabor clássico com um toque de paraíso.",
        img: "/catalogo/chocolate13.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU012",
        codigo: "COD012",
        nome: "Chocolate ao Leite com Amendoim Dulce Venere",
        descricao:
          "Um deleite com personalidade e conforto, o Chocolate ao Leite com Amendoim Dulce Venere é a celebração da união perfeita entre a suavidade do chocolate e a riqueza salgada e aveludada do amendoim. A fusão da doçura com a textura e o sabor marcante do amendoim cria uma experiência de degustação inesquecível, que é ao mesmo tempo familiar e sofisticada. Cada mordida é um convite para o prazer de uma combinação atemporal.",
        img: "/catalogo/chocolate14.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU013",
        codigo: "COD013",
        nome: "Chocolate ao Leite com Doce de Leite Dulce Venere",
        descricao:
          "Um abraço em forma de chocolate, o Chocolate ao Leite com Doce de Leite Dulce Venere celebra a união perfeita da riqueza aveludada do chocolate com a doçura e cremosidade clássicas do doce de leite. A fusão da intensidade do cacau com o sabor familiar e reconfortante do doce de leite cria uma experiência de degustação luxuosa, mas ao mesmo tempo acolhedora.",
        img: "/catalogo/chocolate15.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU014",
        codigo: "COD014",
        nome: "Chocolate ao Leite com Cheesecake de Morango Dulce Venere",
        descricao:
          "Uma delícia ousada e cheia de personalidade, o Chocolate ao Leite com Cheesecake de Morango Dulce Venere desafia o paladar com a combinação da doçura familiar do chocolate ao leite e a acidez suave e irresistível do cheesecake de morango. A fusão de texturas - a cremosidade do chocolate e o recheio aveludado - cria uma experiência gastronômica que é pura inovação e requinte.",
        img: "/catalogo/chocolate16.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU015",
        codigo: "COD015",
        nome: "Chocolate ao Leite com Recheio Cremoso e Crocante de Kinder Bueno Dulce Venere",
        descricao:
          "Uma combinação lúdica e sofisticada, o Chocolate ao Leite com Recheio Cremoso e Crocante de Kinder Bueno Dulce Venere é a união perfeita da riqueza do chocolate com uma textura surpreendente. A suavidade do recheio cremoso contrasta com a leveza e a crocância de cada pedaço, criando uma experiência de degustação que é tanto nostálgica quanto elegante. Cada mordida é uma viagem de volta a um sabor inesquecível, mas com um toque de requinte.",
        img: "/catalogo/chocolate17.png",
        preco_venda: 60.0,
        custo: 45.0,
        categoria: "Chocolates",
      },
      {
        sku: "SKU016",
        codigo: "COD016",
        nome: "Pão de Mel Clássico",
        descricao:
          "Descubra a riqueza do nosso Pão de Mel Clássico, uma obra-prima que celebra a doçura e a sofisticação. Cada mordida revela um coração macio de doce de leite, envolto em um banho de chocolate intenso e aveludado. Finalizado com delicados toques de ouro comestível, este pão de mel é uma promessa de sabor profundo e uma experiência verdadeiramente luxuosa, digna dos paladares mais refinados.",
        img: "/catalogo/paomel1.png",
        preco_venda: 35.0,
        custo: 20.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU017",
        codigo: "COD017",
        nome: "Pão de Mel Salgado e Doce",
        descricao:
          "Renda-se à elegância surpreendente do nosso Pão de Mel Salgado e Doce. O recheio cremoso de caramelo com flor de sal desvela um equilíbrio perfeito de sabores, quebrando a doçura com um toque intrigante. Envolvido em um delicado banho de chocolate branco puro e finalizado com sutis flocos de ouro, esta criação é uma celebração para os sentidos, oferecendo uma experiência gourmet inesquecível a cada pedaço.",
        img: "/catalogo/paomel2.png",
        preco_venda: 35.0,
        custo: 20.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU018",
        codigo: "COD018",
        nome: "Pão de Mel Frutas do Bosque",
        descricao:
          "Experimente a paixão em cada mordida com o nosso Pão de Mel Frutas do Bosque. Um recheio vibrante de frutas vermelhas frescas – framboesas e cerejas – oferece uma explosão agridoce que dança em perfeita harmonia com a intensidade do chocolate amargo que o envolve. Finalizado com um toque de pó de ouro, esta é uma ode à frescura e ao contraste de sabores, uma experiência audaciosa e memorável.",
        img: "/catalogo/paomel3.png",
        preco_venda: 35.0,
        custo: 20.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU019",
        codigo: "COD019",
        nome: "Pão de Mel de Leite Ninho",
        descricao:
          "Experimente a paixão em cada mordida com o nosso Pão de Mel Frutas do Bosque. Um recheio vibrante de frutas vermelhas frescas – framboesas e cerejas – oferece uma explosão agridoce que dança em perfeita harmonia com a intensidade do chocolate amargo que o envolve. Finalizado com um toque de pó de ouro, esta é uma ode à frescura e ao contraste de sabores, uma experiência audaciosa e memorável.",
        img: "/catalogo/paomel4.png",
        preco_venda: 35.0,
        custo: 20.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU020",
        codigo: "COD020",
        nome: "Pão de Mel de Nutella",
        descricao:
          "Entregue-se à tentação com o nosso Pão de Mel de Nutella. Cada pedaço revela um centro generoso de Nutella pura e aveludada, que se funde com a massa macia e temperada. A cobertura de chocolate ao leite, finalizada com toques de ouro, eleva este clássico a um nível de pura indulgência. É a união perfeita de sabores que promete satisfazer os mais exigentes amantes de chocolate e avelã.",
        img: "/catalogo/paomel5.png",
        preco_venda: 35.0,
        custo: 20.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU021",
        codigo: "COD021",
        nome: "Kit Degustação",
        descricao:
          "Uma jornada de sabores em uma única caixa. Nosso Kit Degustação é uma seleção exclusiva dos mais deliciosos pães de mel, cuidadosamente criados para uma experiência sensorial completa. Desvende a complexidade de cada recheio e a riqueza das nossas coberturas artesanais. Ideal para presentear ou para desfrutar de momentos de pura indulgência, este kit convida você a explorar o melhor da linha Nectar Veneris.",
        img: "/catalogo/menud.png",
        preco_venda: 80.0,
        custo: 38.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU022",
        codigo: "COD022",
        nome: "Embalagem 15 pães de mel, Nectar Veneris",
        descricao:
          "Apresentamos a nossa icônica embalagem em duas opções para atender a cada desejo. A versão menor é ideal para um momento pessoal ou como uma lembrança sofisticada e elegante. Já a versão maior é perfeita para compartilhar em ocasiões especiais ou para presentear com ainda mais grandiosidade, revelando a generosidade e o cuidado da sua escolha.",
        img: "/catalogo/paesmelembalagem.png",
        preco_venda: 200.0,
        custo: 100.0,
        categoria: "paes-de-mel",
      },
      {
        sku: "SKU023",
        codigo: "COD023",
        nome: "Trufa tradicional",
        descricao:
          "Nossas Trufas Tradicionais são uma celebração da arte clássica da confeitaria, com um centro de ganache aveludado e intensamente cremoso, feito com o mais fino chocolate. Cada trufa é delicadamente polvilhada com cacau em pó, criando um acabamento sedoso que derrete na boca. É a essência do luxo em sua forma mais simples e inesquecível.",
        img: "/catalogo/trufas.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU024",
        codigo: "COD024",
        nome: "Trufa de Cappuccino",
        descricao:
          "Experimente o abraço caloroso da nossa Trufa de Cappuccino, uma fusão perfeita de especiarias e chocolate. Por dentro, um cremoso ganache com um toque sutil e aromático de canela em pó, que aquece o paladar a cada mordida. A cobertura fina de chocolate ao leite complementa o sabor, criando uma experiência inesquecível de conforto e indulgência. Perfeita para quem busca um toque exótico e reconfortante.",
        img: "/catalogo/trufa1.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU025",
        codigo: "COD025",
        nome: "Trufa de Caramelo Salgado",
        descricao:
          "Renda-se à sofisticação da nossa Trufa de Caramelo Salgado, uma delícia que brinca com os sentidos. O interior revela um ganache sedoso de caramelo com um toque sutil de flor de sal, criando um equilíbrio perfeito entre o doce e o salgado. A cobertura crocante de chocolate ao leite complementa essa experiência, prometendo um final de boca inesquecível e luxuoso. Uma indulgência para os paladares mais exigentes.",
        img: "/catalogo/trufa2.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU026",
        codigo: "COD026",
        nome: "Trufa de Laranja e Cardamomo",
        descricao:
          "Desperte seus sentidos com a nossa Trufa de Laranja e Cardamomo, uma combinação exótica e surpreendente. O ganache aveludado esconde um coração cítrico de laranja, que harmoniza com a nota quente e picante do cardamomo. Coberta com chocolate amargo de alta qualidade, esta trufa é uma jornada de sabores que transporta você a terras distantes e celebra a arte da alta confeitaria.",
        img: "/catalogo/trufa3.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU027",
        codigo: "COD027",
        nome: "Trufa de Limão Siciliano",
        descricao:
          "Deixe-se levar pela leveza e frescor da nossa Trufa de Limão Siciliano. O ganache cremoso, infundido com o vibrante suco e as raspas aromáticas do limão siciliano, proporciona uma explosão cítrica que equilibra perfeitamente com a doçura do chocolate branco que a envolve. Uma experiência refrescante e elegante, ideal para purificar o paladar e celebrar os sabores da natureza.",
        img: "/catalogo/trufa4.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU028",
        codigo: "COD028",
        nome: "Trufa de Figo e Balsâmico",
        descricao:
          "Uma ousada e elegante combinação, nossa Trufa de Figo e Balsâmico é uma experiência para os paladares mais aventureiros. O ganache cremoso, enriquecido com a doçura do figo maduro e um toque inesperado de balsâmico envelhecido, cria um contraste sublime de sabores. Envolta em chocolate amargo e finalizada com um pedacinho de figo, esta trufa é uma jornada sensorial que celebra a inovação na confeitaria de luxo.",
        img: "/catalogo/trufa5.png",
        preco_venda: 20.0,
        custo: 10.0,
        categoria: "Trufas",
      },
      {
        sku: "SKU029",
        codigo: "COD029",
        nome: "Cookie de Chocolate Amargo e Flor de Sal",
        descricao:
          "Sofisticação em cada mordida com nosso Cookie de Chocolate Amargo e Flor de Sal. Uma bolacha macia e intensamente achocolatada, repleta de gotas de chocolate amargo de alta qualidade e finalizada com cristais delicados de flor de sal. O contraste perfeito entre a doçura profunda do chocolate e o toque sutilmente salgado eleva esta experiência a um nível gourmet. Ideal para acompanhar seu café ou chá.",
        img: "/catalogo/bolacha1.png",
        preco_venda: 30.0,
        custo: 18.0,
        categoria: "Bolachas",
      },
      {
        sku: "SKU030",
        codigo: "COD030",
        nome: "Bolacha de Framboesa e Chocolate Branco",
        descricao:
          "Nossa Bolacha de Framboesa e Chocolate Branco, é macia e amanteigada, pontuada com pedaços vibrantes de framboesas frescas que explodem em sabor a cada mordida. O toque doce e cremoso do chocolate branco se une perfeitamente à acidez da fruta, criando uma experiência elegante e refrescante. Uma verdadeira joia para os amantes de sabores equilibrados e sofisticados.",
        img: "/catalogo/bolacha2.png",
        preco_venda: 30.0,
        custo: 18.0,
        categoria: "Bolachas",
      },
      {
        sku: "SKU031",
        codigo: "COD031",
        nome: "Bolacha de Café e Chocolate Amargo",
        descricao:
          "Desperte os seus sentidos com a nossa Bolacha de Café e Chocolate Amargo. Uma bolacha macia e aromática, infundida com o sabor marcante do café fresco e salpicada com pedaços de chocolate amargo que derretem a cada mordida. O amargor elegante do café se harmoniza com a doçura do chocolate, criando uma experiência sofisticada e viciante. Perfeita para os amantes de café que buscam um toque de luxo em seus momentos de pausa.",
        img: "/catalogo/bolacha3.png",
        preco_venda: 30.0,
        custo: 18.0,
        categoria: "Bolachas",
      },
      {
        sku: "SKU032",
        codigo: "COD032",
        nome: "Bolacha de Gengibre e Especiarias",
        descricao:
          "Aqueça a alma com a nossa Bolacha de Gengibre e Especiarias. Uma bolacha crocante por fora e macia por dentro, infundida com o calor reconfortante do gengibre, canela, cravo e noz-moscada. Cada mordida é uma explosão de aromas e sabores que remetem a momentos especiais e aconchegantes. Perfeita para harmonizar com um chá ou café, esta bolacha é uma celebração das especiarias e da tradição, com um toque de elegância.",
        img: "/catalogo/bolacha4.png",
        preco_venda: 30.0,
        custo: 18.0,
        categoria: "Bolachas",
      },
      {
        sku: "SKU033",
        codigo: "COD033",
        nome: "Bolachinhas Recheadas de Doce de Leite com Especiarias",
        descricao:
          "Nossas Bolachinhas Recheadas de Doce de Leite com Especiarias são uma celebração do sabor e da elegância. Cada bolachinha, feita artesanalmente, é delicadamente recheada com um doce de leite cremoso, enriquecido por um toque sutil de especiarias. Embaladas com carinho em um pote de vidro, elas são a escolha perfeita para um momento intimo ou como um presente que encanta pela sofisticação e pelo sabor inesquecível.",
        img: "/catalogo/bolachas.png",
        preco_venda: 150.0,
        custo: 100.0,
        categoria: "Bolachas",
      },
    ];



    // Criar produtos para cada loja

  const produtos = await prisma.$transaction(
    produtosData.map((p) =>
      prisma.produto.create({
        data: p,
      })
    )
  );

  // ----------------------------
  // 5. Criar estoques
  // ----------------------------

  console.log("📦 Criando estoques aleatórios por loja...");

  // busca todas as lojas e produtos
  const lojas = await prisma.loja.findMany();
  const todosProdutos = await prisma.produto.findMany();

  // função utilitária: pega N produtos aleatórios sem repetir
  function pegarProdutosAleatorios(lista, quantidade) {
    const copia = [...lista];
    const selecionados = [];
    for (let i = 0; i < quantidade && copia.length > 0; i++) {
      const index = Math.floor(Math.random() * copia.length);
      selecionados.push(copia.splice(index, 1)[0]);
    }
    return selecionados;
  }


  for (const loja of lojas) {
    console.log(`➡️ Criando estoque para ${loja.nome}...`);

    // define número de produtos por loja
    const qtdProdutos = loja.tipo === "MATRIZ" ? 30 : 20;

    // escolhe produtos aleatórios
    const produtosAleatorios = pegarProdutosAleatorios(todosProdutos, qtdProdutos);

    // cria os registros de estoque
    for (const produto of produtosAleatorios) {
      const quantidade = Math.floor(Math.random() * 200) + 50; // 50–250 unidades
      const estoqueMinimo = Math.floor(Math.random() * 20) + 5; // 5–25 unidades

      await prisma.estoque.create({
        data: {
          loja_id: loja.id,
          produto_id: produto.id,
          quantidade,
          estoque_minimo: estoqueMinimo,
        },
      });
    }
  }

  console.log("✅ Estoques criados com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🌱 Seed finalizado com sucesso!");
  })
  .catch(async (e) => {
    console.error("❌ Erro ao executar seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

