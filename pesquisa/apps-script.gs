/**
 * Pesquisa — microaulas de revisão ENADE/PND (Artes Visuais)
 *
 * PARTE 1 — RECEBER: recebe as respostas dos dois questionários (antes/depois
 * da prova) e grava uma linha por envio nas abas "onda1" e "onda2".
 *
 * PARTE 2 — PAINEL: monta um painel de acompanhamento (quem falta responder,
 * médias por grupo, comparação retrospectiva) direto na planilha.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLANTAR A PARTE 1 (só na primeira vez, ou se mudar CAMPOS/doPost):
 *
 *   Extensões > Apps Script > cole este arquivo > Salvar (💾)
 *   Implantar > Nova implantação > tipo "App da Web"
 *     - Executar como:      Eu
 *     - Quem pode acessar:  Qualquer pessoa      (NÃO "com Conta do Google")
 *   Copie a URL /exec e cole em pesquisa/assets/config.js (campo ENDPOINT).
 *
 *   Se editar CAMPOS ou doPost depois, republique com "Implantar > Gerenciar
 *   implantações > ✏️ Editar > Versão: Nova versão" — a URL /exec não muda.
 *
 * USAR A PARTE 2 (painel):
 *
 *   Só depende do código salvo (💾) — NÃO precisa reimplantar (onOpen roda a
 *   versão salva mais recente, independente da implantação do App da Web).
 *   Recarregue a planilha: aparece o menu "Pesquisa > Atualizar painel".
 *
 * SEGURANÇA
 *   - "Executar como: Eu" + "Qualquer pessoa": o script só lê/escreve NESTA
 *     planilha (escopo "planilha atual"). Não acessa Drive, e-mail nem outras
 *     planilhas. O doGet não devolve dados.
 *   - Campos enviados pelos alunos são gravados como texto literal (limpa()),
 *     neutralizando fórmulas maliciosas (=IMPORTDATA, =HYPERLINK, etc.).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Ordem das colunas gravadas para cada onda (além de recebido_em, no início,
// e origem/data_hora_aluno, no fim). Precisa bater com os "id" dos campos em
// pesquisa/assets/onda1-dados.js e onda2-dados.js.
var CAMPOS = {
  onda1: [
    "concordo_participar", "nome", "semestre", "ja_prestou_antes", "participou_microaulas", "quantas_microaulas",
    "autoeficacia_1", "autoeficacia_2", "autoeficacia_3",
    "ansiedade_4", "ansiedade_5", "ansiedade_6",
    "dominio_7", "dominio_8", "dominio_9",
    "retro_autoeficacia_10", "retro_ansiedade_11", "retro_dominio_12",
    "microaula_confianca_13", "microaula_lacunas_14", "microaula_ajudou_texto_15", "microaula_mudaria_16",
    "motivo_nao_participou_17", "motivo_nao_participou_detalhe"
  ],
  onda2: [
    "concordo_participar", "nome", "participou_microaulas",
    "autoeficacia_1", "autoeficacia_2", "autoeficacia_3",
    "ansiedade_4", "ansiedade_5", "ansiedade_6",
    "dominio_7", "dominio_8", "dominio_9",
    "desempenho_geral_10", "dificuldade_prova_11", "comentario_prova_12",
    "microaula_ajudou_pos_13", "microaula_conteudo_caiu_14", "recomendaria_15", "sugestao_16",
    "faria_diferenca_17"
  ]
};

// Lista oficial da turma (39), usada pelo painel para casar com o nome que o
// aluno digitou no formulário (que pode vir abreviado ou sem acento) e para
// listar quem ainda falta responder. Ajuste aqui se a turma mudar.
var ROSTER = [
  "Ágata Lakshmi Trebi", "Alana França Mendes", "Ana Julia Lourenço Monteiro",
  "Ana Julia Martins da Silva", "Beatriz Pires da Silva Barbosa", "Bianca Bogea Silva",
  "Brenna Santos Gois", "Camila Moraes Pires", "Daniel Moraes Cutrim",
  "Elaine da Costa Barros", "Estella Raiany Silva Moura", "Felipe Kauã Braga Oliveira",
  "Francisco Batista Freire Filho", "Helena Reginato de Araújo", "Ian Costa Prates",
  "Isac Sadhrack Santos da Silva", "Isadora Roberta Araújo Muniz", "Islanny Vitória Silvino da Silva",
  "Jéssica Pacheco da Costa", "Juliana de Morais Lasak", "Lady Maria da Conceição Ferreira",
  "Laissa Souza Everton", "Letícia de Souza Moreira", "Lia Stefany do Nascimento Souza",
  "Lyvia Hellen Pereira de Sousa", "Magali Ribeiro Teixeira Pereira", "Maria Julia Azevedo de Souza Quadros",
  "Pábula Tayná Silva Vieira", "Paula Figueiredo Soares", "Rajma Winnie Santos Martins",
  "Raquel Cristina Almeida dos Santos", "Ronald dos Santos Cardoso", "Samara Costa Ferreira",
  "Stheffane Liz Gomes Pinheiro", "Suellen dos Santos da Silva", "Thaynara Nazareno Borges",
  "Tiago Marques Nascimento", "Wellisandra Serra de Jesus Cutrim", "Wilma Noeme dos Santos Amaral"
];

// cores do painel
var C_HEAD = '#1f3a5f', C_OK = '#c6efce', C_ERRO = '#ffc7ce', C_VAZIO = '#eeeeee';

// ===========================================================================
// PARTE 1 — RECEBER
// ===========================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var d = JSON.parse(e.postData.contents);
    var onda = (d.onda === "onda2") ? "onda2" : "onda1";
    var campos = CAMPOS[onda];
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName(onda) || ss.insertSheet(onda);
    var cab = ["recebido_em"].concat(campos, ["data_hora_aluno", "origem"]);
    if (aba.getLastRow() === 0) aba.appendRow(cab);

    var linha = [new Date()];
    campos.forEach(function (c) { linha.push(limpa(d[c])); });
    linha.push(limpa(d.data_hora), limpa(d.origem));
    aba.appendRow(linha);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Pesquisa microaulas ENADE/PND — endpoint ativo. Os envios chegam por POST.");
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** neutraliza injeção de fórmula/CSV: prefixa ' quando o valor começa com = + - @ TAB CR */
function limpa(v) {
  v = String(v == null ? "" : v);
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

// ===========================================================================
// PARTE 2 — PAINEL
// ===========================================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pesquisa')
    .addItem('Atualizar painel', 'montarPainelPesquisa')
    .addToUi();
}

/** remove acentos, baixa a caixa, colapsa espaços */
function normalizarNome(s) {
  s = String(s == null ? '' : s).trim().toLowerCase();
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return s.replace(/\s+/g, ' ');
}
function tokenizarNome(s) {
  return normalizarNome(s).split(' ').filter(function (t) { return t.length > 0; });
}

/**
 * Casa o nome digitado pelo aluno com um nome da ROSTER, contando tokens em
 * comum (assim "Lyvia Sousa" casa com "Lyvia Hellen Pereira de Sousa", e
 * "Ana Julia Lourenço Monteiro" não se confunde com a outra "Ana Julia" da
 * turma porque tem mais tokens em comum com o nome certo).
 * Exige pelo menos 2 tokens em comum; empate entre 2+ nomes = ambíguo (não
 * arrisca casar errado, devolve oficial:null para revisão manual).
 */
function melhorCorrespondencia(nomeDigitado) {
  var tokensDig = tokenizarNome(nomeDigitado);
  if (!tokensDig.length) return { oficial: null, score: 0, ambiguo: false };
  var scores = ROSTER.map(function (nomeOficial) {
    var tokensOf = tokenizarNome(nomeOficial);
    var comuns = tokensDig.filter(function (t) { return tokensOf.indexOf(t) !== -1; }).length;
    return { nome: nomeOficial, score: comuns };
  });
  var maxScore = scores.reduce(function (m, s) { return Math.max(m, s.score); }, 0);
  if (maxScore < 2) return { oficial: null, score: maxScore, ambiguo: false };
  var candidatos = scores.filter(function (s) { return s.score === maxScore; }).map(function (s) { return s.nome; });
  if (candidatos.length > 1) return { oficial: null, score: maxScore, ambiguo: true, candidatos: candidatos };
  return { oficial: candidatos[0], score: maxScore, ambiguo: false };
}

/** lê uma aba (onda1/onda2) e devolve as linhas como objetos, na ordem de CAMPOS[id] */
function lerRespostas(ss, abaId) {
  var campos = CAMPOS[abaId];
  var sh = ss.getSheetByName(abaId);
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1 + campos.length + 2).getValues();
  return vals.map(function (r) {
    var o = { recebido_em: r[0] };
    campos.forEach(function (c, i) { o[c] = r[i + 1]; });
    o.data_hora_aluno = r[1 + campos.length];
    return o;
  }).filter(function (o) { return String(o.nome || '').trim() !== ''; });
}

/** agrupa por aluno oficial, mantendo só o envio mais recente; separa os não identificados */
function processarOnda(ss, abaId) {
  var linhas = lerRespostas(ss, abaId);
  var porAluno = {}, naoIdentificados = [];
  linhas.forEach(function (reg) {
    var m = melhorCorrespondencia(reg.nome);
    if (!m.oficial) {
      naoIdentificados.push({
        nome: reg.nome,
        motivo: m.ambiguo ? ('ambíguo entre: ' + m.candidatos.join(' / ')) : 'não identificado na lista',
        recebido_em: reg.recebido_em
      });
      return;
    }
    var existente = porAluno[m.oficial];
    if (!existente || new Date(reg.recebido_em) > new Date(existente.recebido_em)) {
      reg._oficial = m.oficial;
      porAluno[m.oficial] = reg;
    }
  });
  return { porAluno: porAluno, naoIdentificados: naoIdentificados };
}

function arred(x) { return Math.round(x * 100) / 100; }
function pct(n, total) { return total ? Math.round(100 * n / total) + '%' : '0%'; }
function media3(reg, a, b, c) {
  var v = [reg[a], reg[b], reg[c]].map(Number).filter(function (x) { return !isNaN(x); });
  return v.length ? arred(v.reduce(function (s, x) { return s + x; }, 0) / v.length) : '';
}
function mediaCampo(lista, camposN) {
  var todos = [];
  lista.forEach(function (reg) { camposN.forEach(function (c) { var v = Number(reg[c]); if (!isNaN(v)) todos.push(v); }); });
  return todos.length ? arred(todos.reduce(function (s, x) { return s + x; }, 0) / todos.length) : '';
}
function agruparPorParticipacao(porAluno) {
  var g = { 'Participantes': [], 'Não participantes': [] };
  Object.keys(porAluno).forEach(function (nome) {
    var reg = porAluno[nome];
    var chave = (String(reg.participou_microaulas || '').trim().toLowerCase() === 'sim') ? 'Participantes' : 'Não participantes';
    g[chave].push(reg);
  });
  return g;
}
/** pinta uma célula de delta: verde se favorável, vermelho se não, cinza se zero */
function corDelta(range, valor, positivoEhBom) {
  if (valor === '' || valor == null || isNaN(valor)) return;
  if (valor === 0) { range.setBackground(C_VAZIO); return; }
  var bom = positivoEhBom ? (valor > 0) : (valor < 0);
  range.setBackground(bom ? C_OK : C_ERRO);
}

function montarPainelPesquisa() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var o1 = processarOnda(ss, 'onda1');
  var o2 = processarOnda(ss, 'onda2');

  var sh = ss.getSheetByName('Painel · Pesquisa') || ss.insertSheet('Painel · Pesquisa');
  sh.clear();
  try { sh.getRange(1, 1, 1, sh.getMaxColumns()).breakApart(); } catch (e) {}

  var linha = 1;
  function titulo(txt, cols) {
    var rng = sh.getRange(linha, 1, 1, cols);
    try { rng.merge(); } catch (e) {}
    rng.setValue(txt).setBackground(C_HEAD).setFontColor('#ffffff').setFontWeight('bold').setFontSize(12);
    linha += 1;
  }
  function nota(txt) {
    sh.getRange(linha, 1).setValue(txt).setFontStyle('italic').setFontColor('#666666');
    linha += 1;
  }

  var respO1 = Object.keys(o1.porAluno);
  var respO2 = Object.keys(o2.porAluno);
  var pares = respO1.filter(function (n) { return respO2.indexOf(n) !== -1; });

  titulo('Painel · Pesquisa microaulas — atualizado em ' +
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm'), 10);
  nota('Onda 1: ' + respO1.length + '/' + ROSTER.length + ' (' + pct(respO1.length, ROSTER.length) + ')' +
    '   ·   Onda 2: ' + respO2.length + '/' + ROSTER.length + ' (' + pct(respO2.length, ROSTER.length) + ')' +
    '   ·   Pares completos (onda1 + onda2): ' + pares.length);
  linha++;

  var faltamO1 = ROSTER.filter(function (n) { return respO1.indexOf(n) === -1; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); });
  titulo('Faltam responder a Onda 1 (' + faltamO1.length + ')', 4);
  faltamO1.forEach(function (n) { sh.getRange(linha, 1).setValue(n); linha++; });
  linha++;

  var faltamO2 = respO1.filter(function (n) { return respO2.indexOf(n) === -1; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); });
  titulo('Já responderam a Onda 1 mas ainda faltam a Onda 2 (' + faltamO2.length + ')', 4);
  faltamO2.forEach(function (n) { sh.getRange(linha, 1).setValue(n); linha++; });
  linha++;

  titulo('Médias — Onda 1, por grupo', 5);
  sh.getRange(linha, 1, 1, 5).setValues([['Grupo', 'N', 'Autoeficácia', 'Ansiedade', 'Domínio']]).setFontWeight('bold').setBackground('#e8e8e8');
  linha++;
  var grupos = agruparPorParticipacao(o1.porAluno);
  ['Participantes', 'Não participantes'].forEach(function (g) {
    var lista = grupos[g] || [];
    sh.getRange(linha, 1, 1, 5).setValues([[
      g, lista.length,
      mediaCampo(lista, ['autoeficacia_1', 'autoeficacia_2', 'autoeficacia_3']),
      mediaCampo(lista, ['ansiedade_4', 'ansiedade_5', 'ansiedade_6']),
      mediaCampo(lista, ['dominio_7', 'dominio_8', 'dominio_9'])
    ]]);
    linha++;
  });
  linha++;

  var participantes = (grupos['Participantes'] || []).sort(function (a, b) { return a._oficial.localeCompare(b._oficial, 'pt'); });
  titulo('Comparação retrospectiva — participantes (Onda 1): antes das microaulas x agora', 12);
  var cab = ['Nome', 'Autoefic. antes', 'Autoefic. agora', 'Δ', 'Ansiedade antes', 'Ansiedade agora', 'Δ',
    'Domínio antes', 'Domínio agora', 'Δ', 'Confiança nas microaulas', 'Ajudou a ver lacunas'];
  sh.getRange(linha, 1, 1, cab.length).setValues([cab]).setFontWeight('bold').setBackground('#e8e8e8');
  linha++;
  participantes.forEach(function (reg) {
    var autoAgora = media3(reg, 'autoeficacia_1', 'autoeficacia_2', 'autoeficacia_3');
    var ansiAgora = media3(reg, 'ansiedade_4', 'ansiedade_5', 'ansiedade_6');
    var domAgora = media3(reg, 'dominio_7', 'dominio_8', 'dominio_9');
    var retroAuto = Number(reg.retro_autoeficacia_10); retroAuto = isNaN(retroAuto) ? '' : retroAuto;
    var retroAnsi = Number(reg.retro_ansiedade_11); retroAnsi = isNaN(retroAnsi) ? '' : retroAnsi;
    var retroDom = Number(reg.retro_dominio_12); retroDom = isNaN(retroDom) ? '' : retroDom;
    var dAuto = (retroAuto !== '' && autoAgora !== '') ? arred(autoAgora - retroAuto) : '';
    var dAnsi = (retroAnsi !== '' && ansiAgora !== '') ? arred(ansiAgora - retroAnsi) : '';
    var dDom = (retroDom !== '' && domAgora !== '') ? arred(domAgora - retroDom) : '';
    var linhaVal = [reg._oficial, retroAuto, autoAgora, dAuto, retroAnsi, ansiAgora, dAnsi,
      retroDom, domAgora, dDom, reg.microaula_confianca_13, reg.microaula_lacunas_14];
    sh.getRange(linha, 1, 1, linhaVal.length).setValues([linhaVal]);
    corDelta(sh.getRange(linha, 4), dAuto, true);
    corDelta(sh.getRange(linha, 7), dAnsi, false); // ansiedade: cair é bom
    corDelta(sh.getRange(linha, 10), dDom, true);
    linha++;
  });
  linha++;

  var naoIdent = o1.naoIdentificados.concat(o2.naoIdentificados);
  if (naoIdent.length) {
    titulo('Nomes não identificados na lista oficial (' + naoIdent.length + ') — confira manualmente', 4);
    sh.getRange(linha, 1, 1, 3).setValues([['Nome digitado', 'Motivo', 'Recebido em']]).setFontWeight('bold').setBackground('#e8e8e8');
    linha++;
    naoIdent.forEach(function (x) {
      sh.getRange(linha, 1, 1, 3).setValues([[x.nome, x.motivo,
        Utilities.formatDate(new Date(x.recebido_em), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm')]]);
      linha++;
    });
  }

  sh.setColumnWidth(1, 230);
  for (var c = 2; c <= 12; c++) sh.setColumnWidth(c, 105);
  sh.setFrozenRows(2);
  ss.toast('Painel atualizado.', 'Pesquisa', 4);
}
