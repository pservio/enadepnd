// ============================================================================
//  CONFIGURAÇÃO — edite só este arquivo
// ============================================================================
//
//  ENDPOINT: para onde as respostas dos alunos são enviadas automaticamente.
//  Deixe "" (vazio) para funcionar só com download de arquivo (CSV) — o aluno
//  baixa e te manda por e-mail/WhatsApp.
//
//  Google Apps Script → Planilha (grátis e ilimitado):
//    Siga o passo a passo em pesquisa/COMO-CONFIGURAR.md (arquivo apps-script.gs).
//    Cole a URL /exec abaixo em ENDPOINT.
// ============================================================================

window.CONFIG = {
  // Cole aqui a URL /exec depois de implantar pesquisa/apps-script.gs
  // (veja pesquisa/COMO-CONFIGURAR.md).
  ENDPOINT: "",
  ENDPOINT_TIPO: "auto",           // "auto" | "formspree" | "appsscript"

  PROFESSOR_NOME: "Prof. Pablo",
  PROFESSOR_CONTATO: "pservio@gmail.com"   // e-mail/WhatsApp mostrado ao aluno se o envio falhar
};
