/**
 * Simulados ENADE/PND — recebe as respostas e monta um painel de correção
 * (grade verde/vermelho estilo Socrative) dentro da própria planilha.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PARTE 1 — RECEBER RESPOSTAS (app da Web)
 *
 *   Implantar > Gerenciar implantações > (editar ✏️) > Versão: Nova versão
 *     - Executar como:      Eu
 *     - Quem pode acessar:  Qualquer pessoa      (NÃO "com Conta do Google")
 *   A URL /exec continua a mesma ao usar "Nova versão".
 *   Se a URL mudar, atualize ENDPOINT em simulados/assets/config.js.
 *
 * PARTE 2 — PAINEL DE CORREÇÃO
 *
 *   Só depende do código salvo (💾) — NÃO precisa reimplantar.
 *   Recarregue a planilha: aparece o menu "Simulados" no topo.
 *     • Atualizar painel        → (re)constrói as abas "Painel · D14/D15/D16"
 *                                  e "Painel · Consolidado" a partir das respostas
 *     • Exportar painéis (PDF)   → salva um PDF de cada painel no Drive
 *   Nas abas de painel, marque a caixa "Esconder nomes" (B2) para projetar.
 * ─────────────────────────────────────────────────────────────────────────────
 */

var ABAS     = { dia14: 'simulado1', dia15: 'simulado2', dia16: 'simulado3' };
var GABARITO = { dia14: 'AADABDABDBCB', dia15: 'ABBDBACDBDAB', dia16: 'ACABCABCADAB' };
var TITULO   = {
  dia14: 'Dia 14 · Ensino, Metodologias e Avaliação',
  dia15: 'Dia 15 · Teoria da Arte e da Imagem · Criação, Percepção, Interpretação',
  dia16: 'Dia 16 · Representação, Identidade e Diversidade'
};
var NQ  = 12;
var CAB = ['recebido_em', 'nome', 'turma', 'acertos', 'em_branco',
           'respostas', 'data_hora_aluno', 'simulado', 'origem'];
var TZ  = 'America/Fortaleza';

// cores
var C_OK = '#c6efce', C_ERRO = '#ffc7ce', C_VAZIO = '#eeeeee',
    C_HEAD = '#1f3a5f', C_GAB = '#fff2cc', C_TOTAL = '#dfe7f1',
    C_HEAT_RUIM = '#f4c7c3', C_HEAT_MEIO = '#ffe6a8', C_HEAT_BOM = '#c6efce';

// ===========================================================================
// PARTE 1 — RECEBER
// ===========================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nome = ABAS[d.simulado_id] || 'Respostas';
    var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
    if (aba.getLastRow() === 0) aba.appendRow(CAB);
    aba.appendRow([
      new Date(),
      d.nome || '', d.turma || '', d.acertos || '', d.em_branco || '',
      d.respostas || '', d.data_hora || '', d.simulado || '', d.origem || ''
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Simulados ENADE/PND — endpoint ativo. Os envios chegam por POST.');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ===========================================================================
// PARTE 2 — PAINEL
// ===========================================================================
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Simulados')
    .addItem('Atualizar painel', 'montarPaineis')
    .addItem('Exportar painéis (PDF no Drive)', 'exportarPDF')
    .addToUi();
}

function montarPaineis() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var erros = [];
  Object.keys(ABAS).forEach(function (id) {
    try { montarDia(ss, id); } catch (err) { erros.push(id + ': ' + err); }
  });
  try { montarConsolidado(ss); } catch (err) { erros.push('consolidado: ' + err); }
  try { ordenarAbas(ss); } catch (err) {}
  if (erros.length) SpreadsheetApp.getUi().alert('Painel atualizado com avisos:\n\n' + erros.join('\n'));
  else ss.toast('Painel atualizado.', 'Simulados', 4);
}

/** lê e normaliza as respostas de um dia; deduplica por nome (mantém o envio mais recente) */
function lerDia(ss, id) {
  var sh = ss.getSheetByName(ABAS[id]);
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, CAB.length).getValues();
  var reg = vals.map(function (r) {
    var m = {}; CAB.forEach(function (c, i) { m[c] = r[i]; });
    var letras = [];
    for (var i = 0; i < NQ; i++) letras.push('-');
    String(m.respostas || '').split(/\s+/).forEach(function (tok) {
      var p = tok.split(':'); var q = parseInt(p[0], 10);
      if (q >= 1 && q <= NQ) letras[q - 1] = String(p[1] || '-').toUpperCase().charAt(0) || '-';
    });
    m.letras = letras;
    m.nome = String(m.nome || '').trim();
    return m;
  }).filter(function (m) { return m.nome && !/^teste\b/i.test(m.nome); });

  var porNome = {};
  reg.forEach(function (m) {
    var k = m.nome.toLowerCase();
    if (!porNome[k] || new Date(m.recebido_em) > new Date(porNome[k].recebido_em)) porNome[k] = m;
  });
  return Object.keys(porNome).map(function (k) { return porNome[k]; })
    .sort(function (a, b) { return a.nome.localeCompare(b.nome, 'pt'); });
}

function montarDia(ss, id) {
  var nome = 'Painel · ' + id.replace('dia', 'D');
  var sh = ss.getSheetByName(nome) || ss.insertSheet(nome);
  var escondiaAntes = sh.getRange('A2').getValue() === true;
  sh.clear();
  try { sh.getRange(1, 1, 1, sh.getMaxColumns()).breakApart(); } catch (err) {}
  var gab = GABARITO[id].split('');
  var alunos = lerDia(ss, id);
  var totalCols = 4 + NQ; // Nº, Aluno, Turma, % + Q1..Q12

  // linha 1 — título (sem mesclar, para não travar o congelamento de colunas)
  sh.getRange(1, 1, 1, totalCols)
    .setBackground(C_HEAD).setFontColor('#ffffff').setFontWeight('bold').setFontSize(12)
    .setVerticalAlignment('middle');
  sh.getRange('A1').setValue('  ' + TITULO[id] + '   ·   ' + alunos.length + ' participante(s)');
  sh.setRowHeight(1, 26);

  // linha 2 — controle projetor (checkbox em A2, rótulo em B2)
  sh.getRange('A2').insertCheckboxes().setValue(false);
  sh.getRange('B2').setValue('← marque para esconder os nomes (modo projetor)').setFontColor('#888');

  // linha 3 — cabeçalho
  var head = ['Nº', 'Aluno', 'Turma', '%'];
  for (var q = 1; q <= NQ; q++) head.push('Q' + q);
  sh.getRange(3, 1, 1, totalCols).setValues([head])
    .setFontWeight('bold').setBackground('#e8e8e8').setHorizontalAlignment('center');
  sh.getRange('B3').setHorizontalAlignment('left');

  // linha 4 — gabarito
  var linhaGab = ['', 'GABARITO', '', ''].concat(gab);
  sh.getRange(4, 1, 1, totalCols).setValues([linhaGab])
    .setFontWeight('bold').setFontStyle('italic').setBackground(C_GAB).setHorizontalAlignment('center');
  sh.getRange('B4').setHorizontalAlignment('left');

  // linhas de alunos
  var linha0 = 5;
  var dados = [], fundos = [], nomesReais = [];
  alunos.forEach(function (m, idx) {
    var acertos = 0;
    var linhaFundo = [null, null, null, null];
    var linhaVal = [idx + 1, m.nome, m.turma || '', 0];
    for (var i = 0; i < NQ; i++) {
      var L = m.letras[i];
      linhaVal.push(L === '-' ? '·' : L);
      if (L === '-') { linhaFundo.push(C_VAZIO); }
      else if (L === gab[i]) { linhaFundo.push(C_OK); acertos++; }
      else { linhaFundo.push(C_ERRO); }
    }
    linhaVal[3] = acertos / NQ;
    dados.push(linhaVal); fundos.push(linhaFundo); nomesReais.push([m.nome]);
  });

  if (dados.length) {
    var rng = sh.getRange(linha0, 1, dados.length, totalCols);
    rng.setValues(dados);
    rng.setBackgrounds(fundos);
    sh.getRange(linha0, 5, dados.length, NQ).setHorizontalAlignment('center').setFontWeight('bold');
    sh.getRange(linha0, 4, dados.length, 1).setNumberFormat('0%');
    sh.getRange(linha0, 1, dados.length, 1).setHorizontalAlignment('center').setFontColor('#999');
    // nomes reais guardados fora da vista (coluna 30) para o modo projetor
    sh.getRange(linha0, 30, nomesReais.length, 1).setValues(nomesReais);
    sh.hideColumns(30);
  }

  // linha total da turma
  var linhaTotal = linha0 + dados.length;
  var totalVal = ['', 'TOTAL DA TURMA', '', 0];
  var totalFundo = [C_TOTAL, C_TOTAL, C_TOTAL, C_TOTAL];
  var somaGeral = 0;
  for (var i = 0; i < NQ; i++) {
    var certos = 0;
    alunos.forEach(function (m) { if (m.letras[i] === gab[i]) certos++; });
    var pct = alunos.length ? certos / alunos.length : 0;
    somaGeral += pct;
    totalVal.push(pct);
    totalFundo.push(pct >= 0.75 ? C_HEAT_BOM : pct >= 0.5 ? C_HEAT_MEIO : C_HEAT_RUIM);
  }
  totalVal[3] = NQ ? somaGeral / NQ : 0;
  sh.getRange(linhaTotal, 1, 1, totalCols).setValues([totalVal]).setBackgrounds([totalFundo])
    .setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange(linhaTotal, 2).setHorizontalAlignment('left');
  sh.getRange(linhaTotal, 4, 1, 1 + NQ).setNumberFormat('0%');

  // aparência
  sh.setColumnWidth(1, 38); sh.setColumnWidth(2, 190); sh.setColumnWidth(3, 120); sh.setColumnWidth(4, 52);
  for (var c = 5; c <= totalCols; c++) sh.setColumnWidth(c, 40);
  sh.setFrozenRows(4); sh.setFrozenColumns(4);
  sh.getRange(1, 1, linhaTotal, totalCols).setBorder(true, true, true, true, true, true, '#cccccc', null);

  if (escondiaAntes) {
    sh.getRange('A2').setValue(true);
    aplicarProjetor(sh, true);
  }
}

/** troca a coluna Aluno entre nomes reais e "Aluno N" */
function aplicarProjetor(sh, esconder) {
  var linha0 = 5;
  var ult = sh.getLastRow();
  var n = ult - 1 - linha0 + 1; // exclui a linha TOTAL
  if (n <= 0) return;
  var alvo = sh.getRange(linha0, 2, n, 1);
  if (esconder) {
    var anon = [];
    for (var i = 0; i < n; i++) anon.push(['Aluno ' + (i + 1)]);
    alvo.setValues(anon);
  } else {
    alvo.setValues(sh.getRange(linha0, 30, n, 1).getValues());
  }
}

function onEdit(e) {
  var sh = e.range.getSheet();
  if (!/^Painel · /.test(sh.getName())) return;
  if (e.range.getA1Notation() !== 'A2') return;
  aplicarProjetor(sh, e.range.getValue() === true);
}

function montarConsolidado(ss) {
  var sh = ss.getSheetByName('Painel · Consolidado') || ss.insertSheet('Painel · Consolidado');
  sh.clear();
  try { sh.getRange(1, 1, 1, sh.getMaxColumns()).breakApart(); } catch (err) {}
  var ids = Object.keys(ABAS);
  var mapa = {};
  ids.forEach(function (id) {
    lerDia(ss, id).forEach(function (m) {
      var k = m.nome.toLowerCase();
      mapa[k] = mapa[k] || { nome: m.nome };
      var certos = 0, gab = GABARITO[id].split('');
      for (var i = 0; i < NQ; i++) if (m.letras[i] === gab[i]) certos++;
      mapa[k][id] = certos / NQ;
    });
  });
  var linhas = Object.keys(mapa).map(function (k) {
    var r = mapa[k];
    var feitos = ids.filter(function (id) { return r[id] != null; });
    var soma = feitos.reduce(function (s, id) { return s + r[id]; }, 0);
    r.geral = feitos.length ? soma / feitos.length : 0;
    r.feitos = feitos.length;
    return r;
  }).sort(function (a, b) { return b.geral - a.geral; });

  var head = ['Nº', 'Aluno', 'Dia 14', 'Dia 15', 'Dia 16', 'Geral', 'Feitos'];
  var out = [head];
  linhas.forEach(function (r, i) {
    out.push([i + 1, r.nome,
      r.dia14 == null ? '' : r.dia14,
      r.dia15 == null ? '' : r.dia15,
      r.dia16 == null ? '' : r.dia16,
      r.geral, r.feitos + '/3']);
  });
  sh.getRange(1, 1, 1, 7).setBackground(C_HEAD).setFontColor('#fff').setFontWeight('bold').setFontSize(12);
  sh.getRange('A1').setValue('  Consolidado dos 3 simulados');
  sh.getRange(3, 1, out.length, 7).setValues(out);
  sh.getRange(3, 1, 1, 7).setFontWeight('bold').setBackground('#e8e8e8');
  if (out.length > 1) {
    sh.getRange(4, 3, out.length - 1, 4).setNumberFormat('0%');
    // heatmap simples na coluna Geral
    var fundos = [];
    linhas.forEach(function (r) {
      fundos.push([r.geral >= 0.75 ? C_HEAT_BOM : r.geral >= 0.5 ? C_HEAT_MEIO : C_HEAT_RUIM]);
    });
    sh.getRange(4, 6, fundos.length, 1).setBackgrounds(fundos);
  }
  sh.setColumnWidth(1, 38); sh.setColumnWidth(2, 200);
  [3, 4, 5, 6, 7].forEach(function (c) { sh.setColumnWidth(c, 70); });
  sh.setFrozenRows(3);
}

function ordenarAbas(ss) {
  var ordem = ['simulado1', 'simulado2', 'simulado3',
    'Painel · D14', 'Painel · D15', 'Painel · D16', 'Painel · Consolidado'];
  ordem.forEach(function (n, i) {
    var sh = ss.getSheetByName(n);
    if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); }
  });
}

function exportarPDF() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pais = DriveApp.getFileById(ss.getId()).getParents();
  var pasta = pais.hasNext() ? pais.next() : DriveApp.getRootFolder();
  var carimbo = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HHmm');
  var alvo = pasta.createFolder('Paineis simulados ' + carimbo);
  var abas = ['Painel · D14', 'Painel · D15', 'Painel · D16', 'Painel · Consolidado'];
  abas.forEach(function (n) {
    var sh = ss.getSheetByName(n);
    if (!sh) return;
    var url = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?format=pdf'
      + '&gid=' + sh.getSheetId()
      + '&portrait=false&fitw=true&gridlines=false&printtitle=false&pagenumbers=false&sheetnames=false';
    var blob = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } })
      .getBlob().setName(n.replace(' · ', ' ') + '.pdf');
    alvo.createFile(blob);
  });
  SpreadsheetApp.getUi().alert('PDFs salvos na pasta do Drive:\n' + alvo.getUrl());
}
