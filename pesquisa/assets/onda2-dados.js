window.ONDA2 = {
  onda: "onda2",
  blocos: [
    {
      titulo: "Identificação",
      campos: [
        {
          id: "codigo", tipo: "texto", obrigatorio: true,
          label: "Código de identificação pessoal",
          ajuda: "Use o MESMO código que você usou no questionário de antes da prova (ex.: duas primeiras letras do nome da sua mãe + dia do seu nascimento)."
        },
        { id: "participou_microaulas", tipo: "radio", obrigatorio: true, opcoes: ["Sim", "Não"],
          label: "Confirmando: você participou das microaulas de revisão (segunda, terça e quarta-feira)?" }
      ]
    },
    {
      titulo: "Autoeficácia acadêmica",
      subtitulo: "Agora pensando em como foi a prova.",
      campos: [
        { id: "autoeficacia_1", tipo: "likert", label: "Acredito que consegui responder bem às questões de Artes Visuais no ENADE." },
        { id: "autoeficacia_2", tipo: "likert", label: "Meu desempenho na prova refletiu o que aprendi na graduação." },
        { id: "autoeficacia_3", tipo: "likert", label: "Mesmo diante de questões difíceis, consegui raciocinar até uma resposta razoável." }
      ]
    },
    {
      titulo: "Ansiedade durante a prova",
      campos: [
        { id: "ansiedade_4", tipo: "likert", label: "Durante a prova, senti tensão ou desconforto significativo." },
        { id: "ansiedade_5", tipo: "likert", label: "Fiquei me preocupando com meu desempenho enquanto respondia." },
        { id: "ansiedade_6", tipo: "likert", label: "Sinto que o nervosismo atrapalhou meu desempenho." }
      ]
    },
    {
      titulo: "Percepção de domínio de conteúdo",
      campos: [
        { id: "dominio_7", tipo: "likert", label: "Senti que dominava os principais conteúdos de Artes Visuais cobrados na prova." },
        { id: "dominio_8", tipo: "likert", label: "As questões abordaram temas que eu já esperava." },
        { id: "dominio_9", tipo: "likert", label: "Me senti preparado(a) para o formato das questões (objetivas e discursiva)." }
      ]
    },
    {
      titulo: "Percepção geral da prova",
      campos: [
        { id: "desempenho_geral_10", tipo: "likert",
          escala: ["Muito ruim", "Ruim", "Regular", "Bom", "Muito bom"],
          label: "De modo geral, como você avalia seu desempenho na prova?" },
        { id: "dificuldade_prova_11", tipo: "radio", obrigatorio: true,
          opcoes: ["Mais difícil do que esperava", "Mais fácil do que esperava", "Como eu esperava"],
          label: "A prova foi mais difícil, mais fácil, ou como você esperava?" },
        { id: "comentario_prova_12", tipo: "textarea", label: "Comentário livre sobre a experiência da prova (opcional)" }
      ]
    },
    {
      titulo: "Avaliação das microaulas, já com a prova feita",
      mostrarSe: { campo: "participou_microaulas", valor: "Sim" },
      campos: [
        { id: "microaula_ajudou_pos_13", tipo: "likert", label: "Agora que fiz a prova, sinto que as microaulas me ajudaram a responder questões específicas." },
        { id: "microaula_conteudo_caiu_14", tipo: "textarea", label: "Lembra de algum conteúdo trabalhado nas microaulas que caiu na prova? (opcional)" },
        { id: "recomendaria_15", tipo: "radio", obrigatorio: true, opcoes: ["Sim", "Não", "Talvez"],
          label: "Recomendaria manter as microaulas em edições futuras?" },
        { id: "sugestao_16", tipo: "textarea", label: "O que mudaria nas microaulas para a próxima vez? (opcional)" }
      ]
    },
    {
      titulo: "Para quem não participou",
      mostrarSe: { campo: "participou_microaulas", valor: "Não" },
      campos: [
        { id: "faria_diferenca_17", tipo: "radio", obrigatorio: true, opcoes: ["Sim", "Não", "Não sei"],
          label: "Sabendo como foi a prova, você acha que ter participado das microaulas teria feito diferença?" }
      ]
    }
  ]
};
