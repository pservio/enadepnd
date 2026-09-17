# Como configurar a pesquisa

O site é estático (roda no GitHub Pages). Falta só criar a planilha que recebe as
respostas e apontar o `config.js` para ela — os mesmos passos já usados em
`simulados/`, numa planilha nova e separada.

Se não configurar nada, os questionários **continuam funcionando**: ao terminar,
o aluno baixa um `.csv` e te manda por e-mail/WhatsApp.

## Passo a passo (Google Planilha — grátis, ilimitado)

### 1. Criar a planilha

- Crie uma planilha nova no Google Sheets, ex.: **"Pesquisa microaulas ENADE/PND — Respostas"**.
- Não precisa criar abas manualmente — o script cria `onda1` e `onda2` sozinho no primeiro envio de cada uma.

### 2. Colar o script

- Na planilha: **Extensões → Apps Script**.
- Apague o conteúdo padrão e cole **todo** o conteúdo de **`pesquisa/apps-script.gs`**.
- Salvar (💾).

### 3. Implantar como App da Web

- **Implantar → Nova implantação**.
- Tipo: **App da Web**.
- **Executar como:** **Eu**.
- **Quem pode acessar:** **`Qualquer pessoa`** — **não** "Qualquer pessoa com Conta do Google".
- **Implantar**. Na primeira vez o Google pede autorização: **Avançado → Acessar
  (projeto) (não seguro) → Permitir**. É normal para script próprio.
- Copie a **URL que termina em `/exec`**.

### 4. Ligar o site à planilha

- Abra `pesquisa/assets/config.js` neste repositório.
- Cole a URL copiada no campo `ENDPOINT`.
- Publique (`git commit` + `git push`) — o GitHub Pages atualiza sozinho em
  1–2 minutos.

### 5. Conferir o acesso

Abra a URL `/exec` numa **aba anônima**. Deve aparecer o texto
*"Pesquisa microaulas ENADE/PND — endpoint ativo…"*. Se pedir login, o passo 3
não pegou — repita escolhendo "Qualquer pessoa".

### 6. Testar de ponta a ponta

- Abra `pesquisa/onda1.html`, responda com um código de teste, envie.
- Volte à planilha: deve aparecer a aba **`onda1`** com uma linha.
- Repita para `pesquisa/onda2.html` (aba `onda2`).

> Com Apps Script, **o aluno sempre vê "enviado"** (o script não devolve
> confirmação ao navegador). Por isso o teste do passo 6 é obrigatório. Se
> editar o script depois, **republique** (Implantar → Gerenciar implantações →
> ✏️ Editar → Versão: Nova versão) — a URL `/exec` não muda.

## Campos gravados

Uma aba por onda (`onda1`, `onda2`), uma linha por envio, colunas na mesma
ordem dos itens dos questionários (ver `pesquisa/assets/onda1-dados.js` e
`onda2-dados.js`). A coluna `codigo` é o identificador pessoal que permite
parear as duas ondas de um mesmo aluno sem usar o nome.

## Segurança

Mesmas garantias do endpoint de `simulados/`:

- O site é só HTML/CSS/JS estático, não guarda segredo nenhum.
- O Apps Script roda com escopo **"planilha atual"**: não acessa Drive, Gmail
  nem outras planilhas.
- Campos de texto livre são gravados como texto literal (`limpa()`), o que
  neutraliza injeção de fórmula (`=IMPORTDATA(...)` etc.).
- Para desligar o endpoint: Apps Script → Gerenciar implantações → **Arquivar**
  (os alunos voltam ao `.csv`, a planilha fica intacta).
- Mantenha a planilha compartilhada só com você.
