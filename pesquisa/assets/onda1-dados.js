(function () {
  var CFG = window.CONFIG || {};
  var PROF = CFG.PROFESSOR_NOME || "o(a) professor(a)";
  var CONTATO = CFG.PROFESSOR_CONTATO || "";

window.ONDA1 = {
  onda: "onda1",
  blocos: [
    {
      titulo: "Antes de começar",
      subtitulo: "Esta pesquisa é conduzida por " + PROF + " sobre o efeito das aulas de revisão para o ENADE. " +
        "Sua participação é voluntária e não tem nenhuma relação com sua nota nesta ou em qualquer disciplina — " +
        "você pode deixar de responder a qualquer momento, sem nenhum prejuízo. Pedimos seu nome apenas para " +
        "parear suas respostas deste questionário com as do questionário aplicado depois da prova; em qualquer " +
        "análise, apresentação ou publicação dos resultados, você será identificado(a) por um pseudônimo (nome " +
        "fictício), nunca pelo seu nome verdadeiro. Seus dados serão tratados com confidencialidade e usados " +
        "apenas para fins de pesquisa acadêmica." + (CONTATO ? " Dúvidas podem ser enviadas para " + CONTATO + "." : ""),
      campos: [
        { id: "concordo_participar", tipo: "checkbox", obrigatorio: true,
          label: "Li as informações acima e concordo em participar voluntariamente desta pesquisa." }
      ]
    },
    {
      titulo: "Identificação",
      campos: [
        {
          id: "nome", tipo: "texto", obrigatorio: true,
          label: "Nome completo",
          ajuda: "Use o MESMO nome no questionário depois da prova, de domingo — é assim que suas duas respostas são pareadas."
        },
        { id: "semestre", tipo: "texto", obrigatorio: true, label: "Semestre / período do curso" },
        { id: "ja_prestou_antes", tipo: "radio", obrigatorio: true, opcoes: ["Sim", "Não"],
          label: "Já prestou o ENADE antes?" },
        { id: "participou_microaulas", tipo: "radio", obrigatorio: true, opcoes: ["Sim", "Não"],
          label: "Participou de alguma das aulas de revisão (presenciais ou online)?" },
        { id: "quantas_microaulas", tipo: "select", opcoes: ["1", "2", "3"],
          label: "Quantas das 3 você assistiu?",
          mostrarSe: { campo: "participou_microaulas", valor: "Sim" } }
      ]
    },
    {
      titulo: "Autoeficácia acadêmica",
      subtitulo: "O quanto você confia na sua própria capacidade de ir bem na prova.",
      campos: [
        { id: "autoeficacia_1", tipo: "likert", label: "Sinto-me capaz de responder bem às questões de Artes Visuais do ENADE." },
        { id: "autoeficacia_2", tipo: "likert", label: "Estou confiante de que meu desempenho na prova refletirá o que aprendi na graduação." },
        { id: "autoeficacia_3", tipo: "likert", label: "Mesmo diante de questões difíceis, acredito que vou conseguir raciocinar até uma resposta razoável." }
      ]
    },
    {
      titulo: "Ansiedade de teste",
      campos: [
        { id: "ansiedade_4", tipo: "likert", label: "Só de pensar na prova de domingo, sinto tensão ou desconforto." },
        { id: "ansiedade_5", tipo: "likert", label: "Tenho me preocupado excessivamente com meu desempenho no ENADE." },
        { id: "ansiedade_6", tipo: "likert", label: "Acredito que meu nervosismo pode atrapalhar meu desempenho na prova." }
      ]
    },
    {
      titulo: "Percepção de domínio de conteúdo",
      campos: [
        { id: "dominio_7", tipo: "likert", label: "Sinto que domino os principais conteúdos de Artes Visuais cobrados no ENADE." },
        { id: "dominio_8", tipo: "likert", label: "Consigo identificar com clareza quais temas ainda preciso revisar." },
        { id: "dominio_9", tipo: "likert", label: "Sinto-me preparado(a) para o formato das questões (objetivas e discursiva) do exame." }
      ]
    },
    {
      titulo: "Antes de participar das microaulas",
      subtitulo: "Tente lembrar de como você se sentia ANTES de participar das microaulas (segunda a quarta).",
      mostrarSe: { campo: "participou_microaulas", valor: "Sim" },
      campos: [
        { id: "retro_autoeficacia_10", tipo: "likert", label: "Antes de participar das microaulas, eu me sentia capaz de responder bem às questões de Artes Visuais do ENADE." },
        { id: "retro_ansiedade_11", tipo: "likert", label: "Antes das microaulas, a ideia da prova me deixava tenso(a)/ansioso(a)." },
        { id: "retro_dominio_12", tipo: "likert", label: "Antes das microaulas, eu sentia que dominava os conteúdos cobrados no ENADE." }
      ]
    },
    {
      titulo: "Avaliação das microaulas",
      mostrarSe: { campo: "participou_microaulas", valor: "Sim" },
      campos: [
        { id: "microaula_confianca_13", tipo: "likert", label: "As microaulas aumentaram minha confiança para a prova." },
        { id: "microaula_lacunas_14", tipo: "likert", label: "As microaulas me ajudaram a identificar lacunas no meu conhecimento." },
        { id: "microaula_ajudou_texto_15", tipo: "textarea", label: "O que mais ajudou nas microaulas?" },
        { id: "microaula_mudaria_16", tipo: "textarea", label: "O que você mudaria ou faria diferente?" }
      ]
    },
    {
      titulo: "Sobre não ter participado",
      mostrarSe: { campo: "participou_microaulas", valor: "Não" },
      campos: [
        { id: "motivo_nao_participou_17", tipo: "select", obrigatorio: true,
          opcoes: ["Conflito de horário", "Não soube a tempo", "Achei que não precisava", "Outro motivo"],
          label: "Por que não participou das microaulas?" },
        { id: "motivo_nao_participou_detalhe", tipo: "texto", label: "Pode especificar?",
          mostrarSe: { campo: "motivo_nao_participou_17", valor: "Outro motivo" } }
      ]
    }
  ]
};

})();
