/* Simulado ENADE/PND — Licenciatura em Artes Visuais
   Estático: nenhuma dependência, roda no GitHub Pages. */
(function () {
  "use strict";
  var CFG = window.CONFIG || {};
  var LETRAS = ["A", "B", "C", "D"];

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function decodeGab(b64) { try { return atob(b64); } catch (e) { return ""; } }
  function slug(s) {
    return (s || "aluno").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "aluno";
  }
  function tipoEndpoint(url) {
    if (CFG.ENDPOINT_TIPO && CFG.ENDPOINT_TIPO !== "auto") return CFG.ENDPOINT_TIPO;
    if (/formspree\.io/.test(url)) return "formspree";
    if (/script\.google\.com/.test(url)) return "appsscript";
    return "formspree";
  }

  window.initSimulado = function (id) {
    var prova = (window.PROVAS || {})[id];
    var root = document.getElementById("app");
    if (!prova) { root.textContent = "Simulado não encontrado."; return; }
    var LS = "enade_simulado_" + id + "_v1";
    var estado = carregar();

    function carregar() {
      try { return JSON.parse(localStorage.getItem(LS)) || {}; }
      catch (e) { return {}; }
    }
    function salvar() {
      try { localStorage.setItem(LS, JSON.stringify(estado)); } catch (e) {}
    }

    // ---- cabeçalho ----
    document.title = prova.curto + " — Simulado ENADE/PND · Artes Visuais";
    var set = function (sel, txt) { var e = document.querySelector(sel); if (e) e.textContent = txt; };
    set("#titulo", prova.curto);
    set("#tema", prova.tema);

    if (estado.enviado) { render(true); return; }
    render(false);

    // ======================================================================
    function render(travado) {
      root.innerHTML = "";

      // identificação
      var wrapId = el("div", { class: "ident" });
      wrapId.appendChild(el("div", { class: "campo" }, [
        el("label", { for: "nome" }, ["Nome completo *"]),
        inputCampo("nome", "Digite seu nome", true)
      ]));
      wrapId.appendChild(el("div", { class: "campo" }, [
        el("label", { for: "turma" }, ["Turma / período (opcional)"]),
        inputCampo("turma", "Ex.: Artes Visuais - 8º período", false)
      ]));
      if (CFG.AVISO) wrapId.appendChild(el("div", { class: "aviso" }, [CFG.AVISO]));
      root.appendChild(wrapId);

      // questões
      prova.questoes.forEach(function (q) { root.appendChild(cardQuestao(q, travado)); });

      // resultado (oculto até enviar)
      var res = el("div", { class: "resultado hidden", id: "resultado" });
      root.appendChild(res);

      // barra de progresso
      montarBarra(travado);
      atualizarProgresso();

      if (travado) mostrarResultadoSalvo();
    }

    function inputCampo(name, ph, req) {
      var i = el("input", { type: "text", id: name, name: name, placeholder: ph, autocomplete: "off" });
      if (req) i.setAttribute("required", "required");
      if (estado[name]) i.value = estado[name];
      i.addEventListener("input", function () { estado[name] = i.value; salvar(); });
      if (estado.enviado) i.disabled = true;
      return i;
    }

    function cardQuestao(q, travado) {
      var c = el("div", { class: "questao", id: "q" + q.n });
      c.appendChild(el("div", { class: "cab" }, [
        el("span", { class: "num" }, ["Questão " + q.n]),
        el("span", { class: "fonte" }, ["(" + q.fonte + ")"])
      ]));
      if (q.obra) c.appendChild(el("div", { class: "obra" }, [q.obra]));
      if (q.img && q.img.length) {
        var fig = el("figure", q.img.length > 1 ? { class: "imgs" } : null);
        var box = q.img.length > 1 ? el("div", { class: "imgs" }) : fig;
        q.img.forEach(function (src) {
          var a = el("a", { href: "img/" + src, target: "_blank", rel: "noopener" }, [
            el("img", { src: "img/" + src, alt: q.obra || "imagem da questão", loading: "lazy" })
          ]);
          box.appendChild(a);
        });
        if (box !== fig) fig.appendChild(box);
        c.appendChild(fig);
      }
      c.appendChild(el("div", { class: "enunciado", html: "<p>" + q.enunciado.split("\n\n").join("</p><p>") + "</p>" }));

      var ul = el("ul", { class: "opcoes" });
      LETRAS.forEach(function (L) {
        var idr = "q" + q.n + L;
        var input = el("input", { type: "radio", name: "q" + q.n, id: idr, value: L });
        if (estado.resp && estado.resp[q.n] === L) input.checked = true;
        if (travado) input.disabled = true;
        var lab = el("label", { for: idr }, [
          input, el("span", { class: "letra" }, [L + ")"]), el("span", { html: q.alt[L] })
        ]);
        if (input.checked) lab.classList.add("marcada");
        input.addEventListener("change", function () {
          estado.resp = estado.resp || {};
          estado.resp[q.n] = L;
          salvar();
          ul.querySelectorAll("label").forEach(function (x) { x.classList.remove("marcada"); });
          lab.classList.add("marcada");
          atualizarProgresso();
        });
        ul.appendChild(el("li", null, [lab]));
      });
      c.appendChild(ul);
      return c;
    }

    function montarBarra(travado) {
      var antiga = document.querySelector("body > .barra");
      if (antiga) antiga.remove();
      var barra = el("div", { class: "barra" });
      var w = el("div", { class: "wrap" });
      var prog = el("div", { class: "prog", id: "prog" });
      w.appendChild(prog);
      if (travado) {
        var b = el("button", { class: "btn sec", type: "button" }, ["Baixar comprovante (CSV)"]);
        b.addEventListener("click", function () { baixarCSV(estado.ultimoEnvio); });
        var b2 = el("button", { class: "btn", type: "button", style: "margin-left:8px" }, ["Refazer"]);
        b2.addEventListener("click", function () {
          if (confirm("Refazer o simulado? Suas respostas anteriores serão apagadas deste dispositivo.")) {
            localStorage.removeItem(LS); location.reload();
          }
        });
        w.appendChild(el("div", null, [b, b2]));
      } else {
        var btn = el("button", { class: "btn", id: "enviar", type: "button" }, ["Finalizar e enviar"]);
        btn.addEventListener("click", finalizar);
        w.appendChild(btn);
      }
      barra.appendChild(w);
      document.body.appendChild(barra); // full-width sticky no rodapé
    }

    function respondidas() {
      var r = estado.resp || {}, c = 0;
      prova.questoes.forEach(function (q) { if (r[q.n]) c++; });
      return c;
    }
    function atualizarProgresso() {
      var p = document.getElementById("prog");
      if (p) p.innerHTML = "<b>" + respondidas() + "</b> de " + prova.n + " respondidas";
    }

    // ---- envio ----
    function finalizar() {
      var nome = (estado.nome || "").trim();
      if (!nome) { alert("Preencha seu nome completo antes de enviar."); document.getElementById("nome").focus(); return; }
      var falta = prova.n - respondidas();
      var msg = falta > 0
        ? "Você deixou " + falta + " questão(ões) em branco. Enviar mesmo assim? Não será possível refazer."
        : "Enviar suas respostas? Não será possível refazer.";
      if (!confirm(msg)) return;

      var gab = decodeGab(prova.g);
      var acertos = 0, respStr = [];
      prova.questoes.forEach(function (q, i) {
        var r = (estado.resp || {})[q.n] || "-";
        respStr.push(q.n + ":" + r);
        if (r !== "-" && r === gab[i]) acertos++;
      });

      var envio = {
        simulado: prova.curto + " — " + prova.tema,
        nome: nome,
        turma: (estado.turma || "").trim(),
        acertos: acertos + "/" + prova.n,
        em_branco: String(falta),
        respostas: respStr.join(" "),
        data_hora: new Date().toLocaleString("pt-BR"),
        origem: location.href
      };
      estado.enviado = true;
      estado.acertos = acertos;
      estado.ultimoEnvio = envio;
      salvar();

      travarTudo();
      mostrarResultado(acertos, "enviando");
      enviar(envio).then(function (ok) {
        estado.enviadoOk = ok; salvar();
        mostrarResultado(acertos, ok ? "enviado" : "falhou");
      });
    }

    function travarTudo() {
      root.querySelectorAll("input").forEach(function (i) { i.disabled = true; });
      var b = document.getElementById("enviar"); if (b) b.disabled = true;
    }

    function enviar(envio) {
      var url = (CFG.ENDPOINT || "").trim();
      if (!url) return Promise.resolve(false);
      var tipo = tipoEndpoint(url);
      if (tipo === "appsscript") {
        return fetch(url, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(envio)
        }).then(function () { return true; }).catch(function () { return false; });
      }
      // formspree (ou genérico com CORS)
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(envio)
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }

    function mostrarResultado(acertos, fase) {
      var box = document.getElementById("resultado");
      box.classList.remove("hidden");
      box.innerHTML = "";
      box.appendChild(el("h2", null, ["Simulado finalizado"]));
      box.appendChild(el("div", { class: "placar" }, ["Você acertou " + acertos + " de " + prova.n]));
      box.appendChild(el("p", { class: "mini" }, [
        "O gabarito comentado e a correção detalhada serão feitos no encontro / enviados pelo(a) professor(a)."
      ]));

      var st = el("div", { class: "status" });
      if (fase === "enviando") {
        st.textContent = "Enviando suas respostas…";
      } else if (fase === "enviado") {
        st.className = "status ok";
        st.textContent = "✔ Respostas enviadas para o(a) professor(a). Você pode fechar a página.";
      } else {
        st.className = "status pend";
        st.innerHTML = "Não foi possível enviar automaticamente (sem internet ou envio não configurado). "
          + "<strong>Baixe o comprovante abaixo e mande para " + (CFG.PROFESSOR_NOME || "o(a) professor(a)")
          + "</strong>" + (CFG.PROFESSOR_CONTATO ? " (" + CFG.PROFESSOR_CONTATO + ")" : "") + " por e-mail ou WhatsApp.";
      }
      box.appendChild(st);

      var acoes = el("div", { class: "acoes" });
      var csv = el("button", { class: "btn", type: "button" }, ["Baixar comprovante (CSV)"]);
      csv.addEventListener("click", function () { baixarCSV(estado.ultimoEnvio); });
      acoes.appendChild(csv);
      if (fase === "falhou" && (CFG.ENDPOINT || "").trim()) {
        var retry = el("button", { class: "btn sec", type: "button" }, ["Tentar enviar de novo"]);
        retry.addEventListener("click", function () {
          retry.disabled = true; retry.textContent = "Enviando…";
          enviar(estado.ultimoEnvio).then(function (ok) { mostrarResultado(acertos, ok ? "enviado" : "falhou"); });
        });
        acoes.appendChild(retry);
      }
      box.appendChild(acoes);
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function mostrarResultadoSalvo() {
      if (typeof estado.acertos === "number") {
        mostrarResultado(estado.acertos, estado.enviadoOk ? "enviado" : "falhou");
      }
    }

    function baixarCSV(envio) {
      if (!envio) return;
      var head = ["nome", "turma", "simulado", "data_hora", "acertos", "em_branco"];
      for (var i = 1; i <= prova.n; i++) head.push("Q" + i);
      var row = [envio.nome, envio.turma, prova.curto, envio.data_hora, envio.acertos, envio.em_branco];
      prova.questoes.forEach(function (q) { row.push((estado.resp || {})[q.n] || "-"); });

      function esc(v) { v = String(v == null ? "" : v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
      var csv = "﻿" + [head, row].map(function (r) { return r.map(esc).join(";"); }).join("\r\n") + "\r\n";
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = el("a", {
        href: URL.createObjectURL(blob),
        download: "simulado-" + id + "-" + slug(envio.nome) + ".csv"
      });
      document.body.appendChild(a); a.click(); a.remove();
    }
  };
})();
