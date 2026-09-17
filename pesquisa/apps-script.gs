/**
 * Pesquisa — microaulas de revisão ENADE/PND (Artes Visuais)
 * Recebe as respostas dos dois questionários (antes/depois da prova) e grava
 * uma linha por envio nas abas "onda1" e "onda2" de uma planilha própria.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPLANTAR (mesmos passos usados em simulados/apps-script.gs):
 *
 *   Extensões > Apps Script > cole este arquivo > Salvar (💾)
 *   Implantar > Nova implantação > tipo "App da Web"
 *     - Executar como:      Eu
 *     - Quem pode acessar:  Qualquer pessoa      (NÃO "com Conta do Google")
 *   Copie a URL /exec e cole em pesquisa/assets/config.js (campo ENDPOINT).
 *
 *   Se editar o código depois, republique com "Implantar > Gerenciar
 *   implantações > ✏️ Editar > Versão: Nova versão" — a URL /exec não muda.
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
    "codigo", "semestre", "ja_prestou_antes", "participou_microaulas", "quantas_microaulas",
    "autoeficacia_1", "autoeficacia_2", "autoeficacia_3",
    "ansiedade_4", "ansiedade_5", "ansiedade_6",
    "dominio_7", "dominio_8", "dominio_9",
    "retro_autoeficacia_10", "retro_ansiedade_11", "retro_dominio_12",
    "microaula_confianca_13", "microaula_lacunas_14", "microaula_ajudou_texto_15", "microaula_mudaria_16",
    "motivo_nao_participou_17", "motivo_nao_participou_detalhe"
  ],
  onda2: [
    "codigo", "participou_microaulas",
    "autoeficacia_1", "autoeficacia_2", "autoeficacia_3",
    "ansiedade_4", "ansiedade_5", "ansiedade_6",
    "dominio_7", "dominio_8", "dominio_9",
    "desempenho_geral_10", "dificuldade_prova_11", "comentario_prova_12",
    "microaula_ajudou_pos_13", "microaula_conteudo_caiu_14", "recomendaria_15", "sugestao_16",
    "faria_diferenca_17"
  ]
};

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
