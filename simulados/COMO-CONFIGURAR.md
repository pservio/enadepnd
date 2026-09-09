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

### 1. Criar a planilha

- Vá em <https://sheets.google.com> → **planilha em branco**.
- Dê um nome (ex.: *Simulados ENADE-PND — respostas*).
- Não precisa criar colunas nem abas: o script faz isso sozinho.

### 2. Abrir o editor de script

- Na planilha, menu **Extensões → Apps Script**.
- Abre uma aba nova com um arquivo `Código.gs` contendo `function myFunction() {}`.
- **Apague tudo** e cole o conteúdo do arquivo **`apps-script.gs`** (está nesta pasta).
- Clique no ícone de **salvar** (💾) ou `Ctrl+S`. Dê um nome ao projeto se pedir.

### 3. Publicar como aplicativo da web

- No canto superior direito: **Implantar → Nova implantação**.
- Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" → escolha **App da Web**.
- Preencha:
  - **Descrição:** `receber simulados` (qualquer texto).
  - **Executar como:** **Eu (seu@gmail.com)**.
  - **Quem pode acessar:** **Qualquer pessoa**.
    *(É "qualquer pessoa" mesmo — o site precisa poder chamar o script sem login.
    O script só escreve na planilha; ninguém consegue ler a planilha por ele.)*
- Clique **Implantar**.

### 4. Autorizar (só na primeira vez)

- O Google pede permissão para o script acessar suas planilhas.
- Vai aparecer **"O Google não verificou este app"** — é normal para script próprio.
  Clique em **Avançado → Acessar (nome do projeto) (não seguro)** → **Permitir**.

### 5. Copiar a URL

- Ao final aparece uma **URL do app da Web** terminada em **`/exec`**, tipo:
  `https://script.google.com/macros/s/AKfycb..../exec`
- **Copie essa URL.**

### 6. Colar no config.js

Abra `assets/config.js` e deixe assim (troque pela sua URL):

```js
window.CONFIG = {
  ENDPOINT: "https://script.google.com/macros/s/AKfycb..../exec",
  ENDPOINT_TIPO: "auto",              // detecta sozinho que é Apps Script
  PROFESSOR_NOME: "Prof. Pablo",
  PROFESSOR_CONTATO: "pservio@gmail.com",
  AVISO: "Faça sem consultar material..."
};
```

Salve, faça `git commit` + `git push` (ou suba o arquivo pelo site do GitHub).

### 7. Testar

- Abra `.../simulados/dia14.html`, responda qualquer coisa, coloque um nome de teste
  e envie.
- Volte à **planilha**: deve aparecer a aba **Respostas** com uma linha nova.
- Colunas: `recebido_em`, `simulado`, `nome`, `turma`, `acertos`, `em_branco`,
  `respostas`, `data_hora_aluno`, `origem`.
- A coluna `respostas` vem no formato `1:A 2:C 3:B ...` (número da questão : letra).

### Depois: acompanhar e corrigir

- Cada aluno gera **uma linha por envio**. Se alguém enviar duas vezes, ficam duas
  linhas — vale a de `recebido_em` mais recente (ou combine com a turma que é envio
  único).
- Para calcular quem acertou o quê por questão, cole numa aba ao lado o gabarito:

  | | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 | Q12 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | **Dia 14** | A | A | D | A | B | D | A | B | D | B | C | B |
  | **Dia 15** | A | B | B | D | B | A | C | D | B | D | A | B |
  | **Dia 16** | A | C | A | B | C | A | B | C | A | D | A | B |

  (a coluna `acertos` já vem pronta, tipo `9/12` — isso costuma bastar.)

### Se precisar mudar o script depois

Edite o `apps-script.gs` no editor e faça **Implantar → Gerenciar implantações →
✏️ editar → Nova versão → Implantar**. A URL `/exec` **continua a mesma** — não
precisa mexer no `config.js`.

### Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Aluno vê "não foi possível enviar" mas a planilha recebe | Normal: o Apps Script não devolve confirmação ao navegador. O `.csv` que ele baixa é só um backup — pode ignorar se a linha chegou. |
| Nada chega na planilha | URL não termina em `/exec`; ou "Quem pode acessar" ≠ "Qualquer pessoa"; ou faltou reimplantar após editar o script. |
| Chega, mas sem acentos | Não acontece com o script fornecido (usa UTF-8). |

---

## Campos enviados (qualquer opção)

| campo | exemplo |
|---|---|
| `simulado` | `Dia 14 · 14/09 — Ensino, Metodologias e Avaliação...` |
| `nome` | `Ana Silva` |
| `turma` | `Artes Visuais - 8º período` (opcional) |
| `acertos` | `9/12` |
| `em_branco` | `0` |
| `respostas` | `1:A 2:C 3:B 4:D 5:A 6:D 7:A 8:B 9:D 10:B 11:C 12:B` |
| `data_hora` | `14/09/2026, 15:12:40` (horário do aluno) |
| `origem` | URL da página |

O `.csv` que o aluno baixa tem as mesmas colunas (uma linha), abre no Excel
(separador `;`) e **não contém o gabarito**.
