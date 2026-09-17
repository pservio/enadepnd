# enadepnd

Materiais de estudo e revisão para o componente específico de **Artes Visuais
(Licenciatura)** nas avaliações nacionais — ENADE e Prova Nacional Docente (PND).

## Conteúdo

| Pasta | Descrição |
|---|---|
| [`revisao/`](revisao/) | Material didático de revisão em HTML autocontido |
| [`simulados/`](simulados/) | Três simulados objetivos interativos (12 questões cada) |
| [`pesquisa/`](pesquisa/) | Questionários de pesquisa (antes/depois da prova) sobre as microaulas de revisão |

### `revisao/revisao_2024_2025_material_didatico.html`

Revisão dirigida a partir do **ENADE 2024** e da **PND 2025**:

- panorama comparativo das duas provas (formato, organização, nível cognitivo);
- revisão do conteúdo cobrado, organizada por categorias e subtemas temáticos;
- análise dos padrões de redação das alternativas corretas e incorretas, com
  checklist de decisão.

Abra o arquivo em qualquer navegador (tema claro/escuro/automático, imprimível).

### `simulados/`

Três micro-provas objetivas — **Ensino, Metodologias e Avaliação** · **Teoria da Arte
e da Imagem** · **Representação, Identidade e Diversidade** — com 12 questões cada,
adaptadas do ENADE 2024 e da PND 2025. O participante responde no navegador, informa
o nome e envia; vê apenas o **número de acertos**. Sem cronômetro.

As respostas são enviadas para um endpoint configurável (Formspree ou Google
Planilha via Apps Script) e, como alternativa, exportadas em `.csv`. Configuração em
**`simulados/assets/config.js`** — veja [`simulados/COMO-CONFIGURAR.md`](simulados/COMO-CONFIGURAR.md).

### `pesquisa/`

Dois questionários curtos sobre o efeito das microaulas de revisão — respondidos
por quem participou e por quem não participou delas:

- **`onda1.html`** — antes da prova: autoeficácia, ansiedade de teste e percepção
  de domínio de conteúdo no momento atual, mais um bloco retrospectivo (para quem
  fez as microaulas) sobre como se sentia antes delas.
- **`onda2.html`** — depois da prova: os mesmos construtos, agora sobre a
  experiência da prova, mais avaliação das microaulas com a prova já feita.

Mesmo mecanismo de envio dos simulados (Google Planilha via Apps Script, com
fallback em `.csv`). Configuração em **`pesquisa/assets/config.js`** — veja
[`pesquisa/COMO-CONFIGURAR.md`](pesquisa/COMO-CONFIGURAR.md).

---

Os enunciados oficiais são documentos públicos do INEP e aqui aparecem apenas de
forma abreviada, para fins de estudo.
