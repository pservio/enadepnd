/**
 * Recebe os envios dos simulados e grava numa planilha Google — uma aba por dia.
 *
 * >>> ATENÇÃO AO PUBLICAR / REPUBLICAR <<<
 * Implantar > (Gerenciar implantações) > editar (lápis) > Nova versão > Implantar
 *   - Executar como:        Eu
 *   - Quem pode acessar:    Qualquer pessoa      <-- NÃO "com Conta do Google"
 * Se ficar diferente disso, os alunos recebem 403 e nada é gravado.
 * A URL /exec continua a mesma depois de republicar.
 *
 * Abas usadas (crie ou serão criadas sozinhas): simulado1, simulado2, simulado3.
 */

var ABAS = { dia14: 'simulado1', dia15: 'simulado2', dia16: 'simulado3' };
var CABECALHO = ['recebido_em', 'nome', 'turma', 'acertos', 'em_branco',
                 'respostas', 'data_hora_aluno', 'simulado', 'origem'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nome = ABAS[d.simulado_id] || 'Respostas';
    var aba = ss.getSheetByName(nome) || ss.insertSheet(nome);
    if (aba.getLastRow() === 0) aba.appendRow(CABECALHO);
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
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
