# Como configurar os simulados

O site é estático (roda no GitHub Pages). Você só precisa decidir **para onde vão as
respostas dos alunos** e escrever isso em `assets/config.js`.

Se não configurar nada, os simulados **continuam funcionando**: ao terminar, o aluno
baixa um arquivo `.csv` e te manda por e-mail/WhatsApp. Configurar um endpoint só
automatiza a coleta (as respostas caem sozinhas numa planilha ou no seu e-mail).

Há duas opções. **Para uma turma, recomendo a Opção B (Google Planilha)** — é grátis,
sem limite de envios, e você acompanha tudo numa planilha só.

---

## Opção A — Formspree (rápido, mas com limite)

1. Crie conta em <https://formspree.io> (grátis).
2. **New Form** → dê um nome → copie o *endpoint*, algo como
   `https://formspree.io/f/abcdwxyz`.
3. Em `assets/config.js`, coloque essa URL em `ENDPOINT`.
4. No **primeiro** envio de teste, a Formspree te manda um e-mail pedindo para
   confirmar o formulário. Confirme uma vez.
5. As respostas passam a chegar no seu e-mail e no painel da Formspree.

⚠️ **Plano grátis: ~50 envios por mês no total.** 3 simulados × ~15 alunos remotos já
chega perto do limite. Se a turma for maior, use a Opção B.

---

## Opção B — Google Planilha (grátis, ilimitado) — PASSO A PASSO

A ideia: um pequeno script (Google Apps Script) recebe cada envio e grava uma linha
numa planilha sua. Tudo dentro da sua conta Google, sem instalar nada.

> **Estado atual:** a planilha *"simulados enade/pnd"* já existe com as abas
> `simulado1`, `simulado2`, `simulado3`, e a URL `/exec` já está no `config.js`.
> Falta só **liberar o acesso da implantação** e **republicar com o código atual**.

### 1. Planilha e abas

Já feito. Cada dia grava numa aba: **dia 14 → `simulado1`**, **dia 15 → `simulado2`**,
**dia 16 → `simulado3`**. Se os nomes das abas forem outros, ajuste o objeto `ABAS`
no topo do `apps-script.gs`.

### 2. Colar o código atual

- Na planilha: **Extensões → Apps Script**.
- Apague o que estiver lá e cole **todo** o conteúdo de **`apps-script.gs`** (versão
  desta pasta — a que roteia para 3 abas).
- Salvar (💾).

### 3. Republicar com "Qualquer pessoa"  ← O PASSO QUE FALTA

Sua implantação atual está **restrita** (dá "Acesso negado"). Corrija:

- **Implantar → Gerenciar implantações**.
- No card da implantação ativa, clique no **lápis ✏️ (Editar)**.
- **Versão:** escolha **Nova versão** (isso publica o código novo).
- **Quem pode acessar:** mude para **`Qualquer pessoa`**
  — **não** "Qualquer pessoa com Conta do Google".
- **Executar como:** **Eu**.
- **Implantar**.

A **URL `/exec` continua a mesma** — não precisa mexer no `config.js`.

> Se o Google pedir autorização de novo: **Avançado → Acessar (projeto) (não seguro)
> → Permitir**. É normal para script próprio.

### 4. Conferir o acesso

Abra a URL `/exec` numa **aba anônima** (ou num navegador sem login Google).
Você deve ver o texto *"Simulados ENADE/PND — endpoint ativo…"*.
Se aparecer tela de login ou "Você precisa ter acesso", o passo 3 não pegou.

### 5. Testar de ponta a ponta

- Abra `.../simulados/dia14.html`, responda, ponha um nome de teste, envie.
- Volte à planilha, aba **`simulado1`**: deve surgir uma linha.
- Colunas: `recebido_em`, `nome`, `turma`, `acertos`, `em_branco`, `respostas`,
  `data_hora_aluno`, `simulado`, `origem`.
- A coluna `respostas` vem como `1:A 2:C 3:B …` (nº da questão : letra).

> Com Apps Script, **o aluno sempre vê "enviado"** (o script não devolve
> confirmação ao navegador). Por isso o teste do passo 5 é obrigatório: só a linha
> na planilha confirma que está funcionando. Se você editar o script depois, tem que
> **republicar** (passo 3, "Nova versão") — senão continua rodando o código antigo.

---

## Painel de correção (grade verde/vermelho, estilo Socrative)

O `apps-script.gs` deste repositório monta um painel visual **dentro da própria
planilha** a partir das respostas: uma grade aluno × questão, verde = acertou,
vermelho = errou, com o total da turma por questão em "mapa de calor".

### Ligar

1. Cole a versão atual do **`apps-script.gs`** no editor (Extensões → Apps Script) e
   **salve** (💾).
2. **Reimplante** (o `doPost` mudou — passou a gravar tudo como texto literal):
   Implantar → Gerenciar implantações → ✏️ Editar → Versão: **Nova versão** → Implantar.
   (URL `/exec` continua a mesma.)
3. **Recarregue a planilha.** Aparece o menu **Simulados** na barra superior.
4. **Simulados → Atualizar painel.** Na primeira vez o Google pede autorização
   (Avançado → Permitir — agora só a permissão de "planilha atual"). São criadas as abas:
   - **`Painel · D14` / `D15` / `D16`** — grade de um dia
   - **`Painel · Consolidado`** — os 3 dias por aluno, ordenado pela média geral

### Usar

- **Sempre que quiser ver os resultados atualizados:** Simulados → Atualizar painel
  (o painel não se atualiza sozinho a cada envio).
- **Modo projetor:** em cada aba de painel, marque a caixa **A2 "Esconder nomes"** —
  a coluna Aluno vira "Aluno 1, 2, 3…" para discutir com a turma sem expor ninguém.
  Desmarque para ver os nomes de novo.
- **Exportar:** Arquivo → Fazer download → **PDF**, escolhendo a aba do painel
  (na caixa de diálogo dá para ajustar orientação e escala). É o modo nativo do
  Sheets — não usa nenhuma permissão extra.
- **Linhas de teste:** nomes que começam com "teste" são ignorados no painel.
- **Envio duplicado:** o painel usa o **envio mais recente** de cada nome.

### Gabarito (embutido no script, aqui para conferência)

| | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Dia 14** | A | A | D | A | B | D | A | B | D | B | C | D |
| **Dia 15** | A | B | B | D | B | A | C | D | B | D | A | B |
| **Dia 16** | A | C | A | B | C | A | B | C | A | D | A | B |

Se alguma questão for anulada ou trocada, ajuste a string em `GABARITO` no topo do
`apps-script.gs`, salve e rode "Atualizar painel".

### Problemas comuns

| Sintoma | Causa provável / solução |
|---|---|
| URL `/exec` dá "Acesso negado" / pede login | "Quem pode acessar" ≠ **Qualquer pessoa**. Refaça o passo 3. |
| Aba anônima mostra o texto "endpoint ativo", mas nada chega na planilha ao enviar | Faltou **Nova versão** ao republicar — está rodando o código antigo, sem as 3 abas. Refaça o passo 3 escolhendo "Nova versão". |
| Grava tudo numa aba só chamada `Respostas` | Os nomes das abas na planilha são diferentes de `simulado1/2/3`. Renomeie as abas ou ajuste `ABAS` no `apps-script.gs` e republique. |
| Aluno vê "enviado", mas a linha não aparece | Sempre teste você mesmo (passo 5). O aluno não tem como saber — o `.csv` que ele baixa é o backup. |

---

## Campos enviados (uma linha por aluno)

| coluna | exemplo |
|---|---|
| `recebido_em` | (data/hora do servidor) |
| `nome` | `Ana Silva` |
| `turma` | `Artes Visuais - 8º período` (opcional) |
| `acertos` | `9/12` |
| `em_branco` | `0` |
| `respostas` | `1:A 2:C 3:B 4:D 5:A 6:D 7:A 8:B 9:D 10:B 11:C 12:B` |
| `data_hora_aluno` | `14/09/2026, 15:12:40` (relógio do aluno) |
| `simulado` | `Dia 14 · 14/09 — Ensino, Metodologias e Avaliação...` |
| `origem` | URL da página |

O `.csv` que o aluno baixa tem as mesmas colunas (uma linha), abre no Excel
(separador `;`) e **não contém o gabarito**.

---

## Segurança

- **O site** (GitHub Pages) é só HTML/CSS/JS estático. Não guarda segredo nenhum e
  não tem como afetar sua conta.
- **O Apps Script** roda "como você", mas com escopo **"planilha atual"**: só
  lê/escreve *nesta* planilha. Não acessa Drive, Gmail, Agenda, suas outras
  planilhas, nem devolve dados pela URL (`doGet` é um texto fixo). O aviso "app não
  verificado" é o padrão do Google para qualquer script próprio — é você
  autorizando o *seu* script.
- **Endpoint público:** o `/exec` aceita POST de qualquer um (necessário para o
  navegador do aluno). A URL fica visível no `config.js` do repositório público.
  Consequências possíveis e como estão tratadas:
  - *spam de linhas* → no máximo enche a planilha / estoura a cota diária (reseta
    sozinha). Você apaga as linhas.
  - *injeção de fórmula* (`=IMPORTDATA(...)` no nome) → **bloqueado**: o script
    grava todo campo de aluno como texto literal (`limpa()`).
- **Botão de pânico:**
  - desligar o endpoint: Apps Script → Gerenciar implantações → **Arquivar** (os
    alunos voltam ao `.csv`, a planilha fica intacta);
  - revogar o acesso do script: <https://myaccount.google.com/permissions>;
  - arquive as **implantações antigas** — cada uma "Qualquer pessoa" é um endpoint
    vivo. Deixe só a atual.
- Mantenha a **planilha** compartilhada só com você (ou "somente leitura" para
  colegas). Quem for *editor* da planilha pode editar o script.
