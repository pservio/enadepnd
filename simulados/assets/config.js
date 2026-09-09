// ============================================================================
//  CONFIGURAÇÃO — edite só este arquivo
// ============================================================================
//
//  ENDPOINT: para onde as respostas dos alunos são enviadas automaticamente.
//  Deixe "" (vazio) para funcionar só com download de arquivo (CSV).
//
//  Opção A — Formspree (mais simples):
//    1. Crie conta grátis em https://formspree.io
//    2. Novo formulário → copie o endpoint (ex.: https://formspree.io/f/abcdwxyz)
//    3. Cole abaixo em ENDPOINT. Confirme o e-mail que a Formspree enviar.
//    (plano grátis: ~50 envios/mês no total)
//
//  Opção B — Google Apps Script → Planilha (grátis e ilimitado):
//    Siga o passo a passo do README.md (arquivo apps-script.gs).
//    Cole a URL /exec abaixo em ENDPOINT.
//
//  O tipo é detectado pela URL. Se precisar forçar, mude ENDPOINT_TIPO
//  para "formspree" ou "appsscript".
// ============================================================================

window.CONFIG = {
  // Google Apps Script → planilha "simulados enade/pnd" (abas simulado1/2/3).
  // Só funciona se a implantação estiver com "Quem pode acessar: Qualquer pessoa".
  ENDPOINT: "https://script.google.com/macros/s/AKfycbwKxVK-_ZgGPIPVzhuokBc7yNd514TDo_XJQw1rmVfj3mA0npgJD3WLyIQ5a0un6BOcRw/exec",
  ENDPOINT_TIPO: "auto",           // "auto" | "formspree" | "appsscript"

  PROFESSOR_NOME: "Prof. Pablo",
  PROFESSOR_CONTATO: "pservio@gmail.com",   // e-mail/WhatsApp mostrado ao aluno para enviar o arquivo

  // Texto opcional exibido na abertura de cada simulado
  AVISO: "Faça sem consultar material, como se fosse a prova. Não há cronômetro — mas cronometre-se: a meta é 48 minutos."
};
