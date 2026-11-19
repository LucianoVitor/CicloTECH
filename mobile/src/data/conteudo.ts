/**
 * Conteúdo fictício de demonstração — copiado literalmente da aplicação Web
 * (src/pages/*.tsx e src/components/HeroCarousel.tsx). Nada aqui vem do Supabase.
 * Ao alterar textos na Web, atualize também este arquivo.
 */
import type { ImageSourcePropType } from 'react-native';
import { IMAGENS } from '@/lib/catalogo';
import type { IconName } from '@/components/ui';

export const HERO_CPU: ImageSourcePropType = require('../../assets/images/hero-cpu.png');

/* ───────────── Início (src/pages/Index.tsx + HeroCarousel.tsx) ───────────── */

export const HERO = {
  titulo: ['RECONECTANDO', 'FUTUROS:'],
  destaque: 'DOE SEU HARDWARE',
  subtitulo: 'Transforme lixo eletrônico em oportunidade para estudantes da Zona Leste. Tecnologia circular e inclusiva.',
  ctaDoar: 'Quero Doar Agora',
  ctaEstudante: 'Sou Estudante, Preciso de Peças',
};

export const CARROSSEL: { imagem: ImageSourcePropType; rotulo: string }[] = [
  { imagem: IMAGENS.cpu, rotulo: 'Processador' },
  { imagem: IMAGENS.ram, rotulo: 'Memória RAM' },
  { imagem: IMAGENS.storage, rotulo: 'Armazenamento' },
  { imagem: IMAGENS.gpu, rotulo: 'Placa de Vídeo' },
  { imagem: IMAGENS.monitor, rotulo: 'Monitor' },
  { imagem: IMAGENS.peripherals, rotulo: 'Periféricos' },
];

export const CATEGORIAS_HOME: { titulo: string; itens: number; imagem: ImageSourcePropType }[] = [
  { titulo: 'Processadores (CPU)', itens: 30, imagem: IMAGENS.cpu },
  { titulo: 'Memória RAM', itens: 20, imagem: IMAGENS.ram },
  { titulo: 'Armazenamento (SSD/HDD)', itens: 10, imagem: IMAGENS.storage },
  { titulo: 'Placas de Vídeo (GPU)', itens: 20, imagem: IMAGENS.gpu },
  { titulo: 'Monitores', itens: 20, imagem: IMAGENS.monitor },
  { titulo: 'Periféricos', itens: 15, imagem: IMAGENS.peripherals },
];

export const IMPACTO: { icon: IconName; valor: string; rotulo: string; texto: string }[] = [
  {
    icon: 'barbell-outline',
    valor: '1,250 KG',
    rotulo: 'E-Waste Evitado',
    texto: 'Redução direta de metais pesados em aterros sanitários locais através da logística reversa.',
  },
  {
    icon: 'people-outline',
    valor: '450+',
    rotulo: 'Estudantes Beneficiados',
    texto: 'Inclusão digital para alunos de baixa renda da Zona Leste, focando em educação técnica.',
  },
  {
    icon: 'refresh-outline',
    valor: '780',
    rotulo: 'Componentes Recirculados',
    texto: 'Peças testadas e certificadas que voltaram ao ciclo produtivo em vez do descarte.',
  },
];

export const IMPACTO_FONTE = { atualizacao: 'Data Refresh: 24.05.2026', fonte: 'Source: ODS Global Report' };

/* ───────────── Como Doar (src/pages/ComoDoar.tsx) ───────────── */

export const COMO_DOAR_INTRO =
  'Doar hardware usado é simples, seguro e gera impacto real na vida de estudantes. Siga os 4 passos abaixo para transformar tecnologia ociosa em oportunidade.';

export const PASSOS: { icon: IconName; numero: string; titulo: string; descricao: string }[] = [
  {
    icon: 'person-add-outline',
    numero: '01',
    titulo: 'CADASTRO',
    descricao:
      'Crie sua conta na plataforma como doador (pessoa física ou empresa). Preencha seus dados e confirme seu e-mail institucional ou pessoal.',
  },
  {
    icon: 'clipboard-outline',
    numero: '02',
    titulo: 'AVALIAÇÃO',
    descricao:
      'Cadastre o hardware que deseja doar com fotos e descrições. Nossa equipe técnica avalia o estado e potencial de reutilização da peça.',
  },
  {
    icon: 'git-merge-outline',
    numero: '03',
    titulo: 'MATCH COM ESTUDANTE',
    descricao:
      'O sistema faz o match inteligente entre sua doação e as necessidades dos estudantes cadastrados da Zona Leste.',
  },
  {
    icon: 'car-outline',
    numero: '04',
    titulo: 'ENTREGA',
    descricao:
      'Agende a entrega no ponto de coleta da Fatec Zona Leste ou solicite uma retirada. O estudante recebe o componente certificado.',
  },
];

/* ───────────── Doações disponíveis (src/pages/SolicitarHardware.tsx) ───────────── */

export type ItemDoacao = {
  id: string;
  titulo: string;
  categoria: string;
  condicao: string;
  imagem: ImageSourcePropType;
  dono: string;
};

const VOLUNTARIOS = 'Voluntários CicloTech';

export const DOACOES_DISPONIVEIS: ItemDoacao[] = [
  { id: 'seed-1', titulo: 'Intel Core i5-12400', categoria: 'Processadores (CPU)', condicao: 'Bom estado', imagem: IMAGENS.cpu, dono: VOLUNTARIOS },
  { id: 'seed-2', titulo: 'AMD Ryzen 5 5600X', categoria: 'Processadores (CPU)', condicao: 'Excelente', imagem: IMAGENS.cpu, dono: VOLUNTARIOS },
  { id: 'seed-3', titulo: 'Corsair Vengeance 16GB DDR4', categoria: 'Memória RAM', condicao: 'Novo', imagem: IMAGENS.ram, dono: VOLUNTARIOS },
  { id: 'seed-4', titulo: 'Kingston Fury 8GB DDR4', categoria: 'Memória RAM', condicao: 'Bom estado', imagem: IMAGENS.ram, dono: VOLUNTARIOS },
  { id: 'seed-5', titulo: 'Samsung 970 EVO 500GB', categoria: 'Armazenamento (SSD)', condicao: 'Excelente', imagem: IMAGENS.storage, dono: VOLUNTARIOS },
  { id: 'seed-6', titulo: 'WD Blue 1TB HDD', categoria: 'Armazenamento (HDD)', condicao: 'Funcional', imagem: IMAGENS.storage, dono: VOLUNTARIOS },
  { id: 'seed-7', titulo: 'NVIDIA GTX 1660 Super', categoria: 'Placas de Vídeo (GPU)', condicao: 'Bom estado', imagem: IMAGENS.gpu, dono: VOLUNTARIOS },
  { id: 'seed-8', titulo: 'AMD RX 580 8GB', categoria: 'Placas de Vídeo (GPU)', condicao: 'Funcional', imagem: IMAGENS.gpu, dono: VOLUNTARIOS },
  { id: 'seed-9', titulo: 'LG 24" IPS Full HD', categoria: 'Monitores', condicao: 'Excelente', imagem: IMAGENS.monitor, dono: VOLUNTARIOS },
  { id: 'seed-10', titulo: 'Dell 21.5" LED', categoria: 'Monitores', condicao: 'Bom estado', imagem: IMAGENS.monitor, dono: VOLUNTARIOS },
  { id: 'seed-11', titulo: 'Logitech MK270 Combo', categoria: 'Periféricos', condicao: 'Novo', imagem: IMAGENS.peripherals, dono: VOLUNTARIOS },
  { id: 'seed-12', titulo: 'Headset HyperX Cloud Stinger', categoria: 'Periféricos', condicao: 'Bom estado', imagem: IMAGENS.peripherals, dono: VOLUNTARIOS },
];

/** Filtros exatamente como na Web. */
export const FILTROS_DOACOES = [
  'Todos',
  'Processadores (CPU)',
  'Memória RAM',
  'Armazenamento (SSD)',
  'Armazenamento (HDD)',
  'Placas de Vídeo (GPU)',
  'Monitores',
  'Periféricos',
];

/* ───────────── Trocas (src/pages/Trocas.tsx) ───────────── */

export type ItemTroca = {
  id: string;
  titulo: string;
  dono: string;
  categoria: string;
  querTrocarPor: string;
  descricao: string;
  imagem: ImageSourcePropType;
};

export const TROCAS: ItemTroca[] = [
  { id: 'tseed-1', titulo: 'GPU NVIDIA GTX 1660 Super', dono: 'Carlos M.', categoria: 'Placa de Vídeo', querTrocarPor: 'SSD 500GB ou superior', descricao: 'Placa em ótimo estado, usada por 1 ano em PC secundário.', imagem: IMAGENS.gpu },
  { id: 'tseed-2', titulo: '16GB DDR4 Corsair Vengeance', dono: 'Aline R.', categoria: 'Memória RAM', querTrocarPor: 'Monitor 21" ou superior', descricao: 'Kit 2x8GB 3200MHz. Funcionando perfeitamente.', imagem: IMAGENS.ram },
  { id: 'tseed-3', titulo: 'Monitor LG 24" IPS', dono: 'Pedro L.', categoria: 'Monitor', querTrocarPor: 'Processador Intel i5 9ª gen+', descricao: 'Tela sem riscos, bom estado de uso.', imagem: IMAGENS.monitor },
  { id: 'tseed-4', titulo: 'Intel Core i5-10400', dono: 'Mariana S.', categoria: 'Processador', querTrocarPor: 'RAM 16GB DDR4', descricao: 'CPU testada e funcionando. Sem cooler.', imagem: IMAGENS.cpu },
  { id: 'tseed-5', titulo: 'SSD Kingston A400 480GB', dono: 'Rafael T.', categoria: 'Armazenamento', querTrocarPor: 'HD externo 1TB', descricao: 'Pouco tempo de uso, velocidade nominal mantida.', imagem: IMAGENS.storage },
  { id: 'tseed-6', titulo: 'Teclado Mecânico Redragon Kumara', dono: 'Júlia F.', categoria: 'Periférico', querTrocarPor: 'Mouse gamer ou headset', descricao: 'Switches blue, RGB funcionando.', imagem: IMAGENS.peripherals },
];

/* ───────────── Impacto ODS (src/pages/ImpactoODS.tsx) ───────────── */

export const EWASTE_MENSAL = [
  { mes: 'Jan', valor: 80 },
  { mes: 'Fev', valor: 120 },
  { mes: 'Mar', valor: 95 },
  { mes: 'Abr', valor: 150 },
  { mes: 'Mai', valor: 200 },
  { mes: 'Jun', valor: 180 },
  { mes: 'Jul', valor: 220 },
  { mes: 'Ago', valor: 205 },
];

export const ESTUDANTES_MENSAL = [
  { mes: 'Jan', valor: 20 },
  { mes: 'Fev', valor: 35 },
  { mes: 'Mar', valor: 50 },
  { mes: 'Abr', valor: 65 },
  { mes: 'Mai', valor: 90 },
  { mes: 'Jun', valor: 120 },
  { mes: 'Jul', valor: 150 },
  { mes: 'Ago', valor: 180 },
];

export const COMPONENTES_POR_TIPO = [
  { nome: 'CPU', valor: 180 },
  { nome: 'RAM', valor: 150 },
  { nome: 'Storage', valor: 130 },
  { nome: 'GPU', valor: 120 },
  { nome: 'Monitores', valor: 100 },
  { nome: 'Periféricos', valor: 100 },
];

export const ODS: { numero: string; titulo: string; descricao: string }[] = [
  {
    numero: 'ODS 4',
    titulo: 'Educação de Qualidade',
    descricao:
      'Ao fornecer hardware funcional para estudantes, viabilizamos o acesso à educação digital e técnica, essencial no mercado de trabalho atual.',
  },
  {
    numero: 'ODS 10',
    titulo: 'Redução das Desigualdades',
    descricao:
      'A inclusão digital reduz a desigualdade de acesso à tecnologia entre estudantes de baixa renda da periferia e centros urbanos privilegiados.',
  },
  {
    numero: 'ODS 12',
    titulo: 'Consumo e Produção Responsáveis',
    descricao:
      'A recirculação de componentes eletrônicos promove a economia circular, estendendo a vida útil dos produtos e reduzindo o e-waste.',
  },
];

/* ───────────── Sobre Nós (src/pages/SobreNos.tsx) ───────────── */

export const ORIGEM = [
  'O Ciclo Tech nasceu como projeto acadêmico na Fatec Zona Leste, motivado por uma realidade urgente: milhares de componentes eletrônicos funcionais são descartados diariamente, enquanto estudantes da periferia não possuem equipamentos básicos para estudar.',
  'A proposta é simples e poderosa: conectar doadores de hardware usado a estudantes que precisam, criando um ciclo virtuoso de tecnologia circular. Cada peça doada é avaliada, certificada e direcionada para quem mais precisa.',
];

export const PILARES: { icon: IconName; titulo: string; descricao: string }[] = [
  {
    icon: 'school-outline',
    titulo: 'Inclusão Digital',
    descricao:
      'Garantir que estudantes de baixa renda tenham acesso à tecnologia funcional para seus estudos e desenvolvimento profissional.',
  },
  {
    icon: 'leaf-outline',
    titulo: 'Responsabilidade Ambiental',
    descricao:
      'Reduzir o volume de lixo eletrônico através da economia circular, dando nova vida a componentes descartados.',
  },
  {
    icon: 'locate-outline',
    titulo: 'Impacto Social',
    descricao:
      'Criar uma ponte entre doadores e estudantes, gerando impacto mensurável alinhado aos Objetivos de Desenvolvimento Sustentável da ONU.',
  },
  {
    icon: 'hardware-chip-outline',
    titulo: 'Educação Técnica',
    descricao:
      'Fomentar o aprendizado prático em hardware e manutenção, preparando estudantes para o mercado de tecnologia.',
  },
];

export const EQUIPE =
  'Luciano Vitor e Matheus Gobbi, uma dupla de estudantes da Fatec Zona Leste, unidos pela missão de democratizar o acesso à tecnologia às pessoas de maior fragilidade de São Paulo.';

export const RODAPE = '© 2026 Ciclo Tech — Tecnologia Circular para a Zona Leste';

/* ───────────── FAQ (src/pages/FAQ.tsx) ───────────── */

export const FAQ: { titulo: string; itens: { pergunta: string; resposta: string }[] }[] = [
  {
    titulo: 'Para Doadores',
    itens: [
      { pergunta: 'Como faço para doar um equipamento?', resposta: "Acesse a página 'Quero Doar', preencha o formulário com a descrição da peça, fotos e endereço para retirada. Nossa equipe entrará em contato em até 48h." },
      { pergunta: 'Quem avalia o hardware doado?', resposta: 'Voluntários técnicos parceiros (Fatec Zona Leste) testam, higienizam e classificam cada peça antes de cadastrá-la no catálogo.' },
      { pergunta: 'Posso emitir nota fiscal ou recibo de doação?', resposta: 'Sim. Após a coleta, enviamos por e-mail um recibo digital que pode ser usado para fins contábeis e de ESG.' },
      { pergunta: 'Quais peças não são aceitas?', resposta: 'Não aceitamos itens com queima visível, baterias inchadas ou monitores CRT (descarte regulado).' },
    ],
  },
  {
    titulo: 'Para Estudantes',
    itens: [
      { pergunta: 'Quem pode solicitar peças?', resposta: 'Qualquer estudante cadastrado. Damos prioridade para alunos da Zona Leste de São Paulo.' },
      { pergunta: 'Como sei se meu match foi aceito?', resposta: 'Você recebe uma notificação no painel e por e-mail assim que um doador confirma a destinação da peça para você.' },
      { pergunta: 'Há custo de retirada?', resposta: 'Não. Coordenamos pontos de retirada gratuitos em parceiros institucionais.' },
      { pergunta: 'Posso trocar peças com outros estudantes?', resposta: "Sim, através da página 'Trocas', usando o sistema de match interno." },
    ],
  },
  {
    titulo: 'Plataforma & Conta',
    itens: [
      { pergunta: 'Como recupero minha senha?', resposta: "Na tela de login, clique em 'Esqueceu a senha?' e enviaremos um link de redefinição para o e-mail cadastrado." },
      { pergunta: 'Meus dados estão seguros?', resposta: 'Sim. Usamos autenticação JWT, RLS no banco de dados e seguimos a LGPD.' },
      { pergunta: 'Posso excluir minha conta?', resposta: 'Sim, entre em contato pelo suporte ou exclua diretamente no seu perfil.' },
    ],
  },
];
