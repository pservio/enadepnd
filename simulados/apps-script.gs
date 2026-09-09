/**
 * Recebe os envios dos simulados e grava numa planilha Google.
 * Opção B do config.js (grátis e sem limite de envios).
 *
 * PASSO A PASSO
 * 1. Crie uma Planilha Google nova (Google Sheets).
 * 2. Menu  Extensões > Apps Script.  Apague o conteúdo e cole este arquivo.
 * 3. Menu  Implantar > Nova implantação > tipo "App da Web".
 *      - Executar como: eu
 *      - Quem pode acessar: qualquer pessoa
 *    Copie a URL que termina em /exec
 * 4. Cole essa URL em assets/config.js, no campo ENDPOINT.
 * 5. Pronto. Cada envio vira uma linha na aba "Respostas".
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var dados = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var aba = ss.getSheetByName('Respostas') || ss.insertSheet('Respostas');
    if (aba.getLastRow() === 0) {
      aba.appendRow(['recebido_em', 'simulado', 'nome', 'turma', 'acertos', 'em_branco', 'respostas', 'data_hora_aluno', 'origem']);
    }
    aba.appendRow([
      new Date(),
      dados.simulado || '',
      dados.nome || '',
      dados.turma || '',
      dados.acertos || '',
      dados.em_branco || '',
      dados.respostas || '',
      dados.data_hora || '',
      dados.origem || ''
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Simulado ENADE/PND — endpoint ativo.');
}
