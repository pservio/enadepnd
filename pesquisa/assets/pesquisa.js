/* Pesquisa — microaulas ENADE/PND · Artes Visuais (Licenciatura)
   Estático: nenhuma dependência, roda no GitHub Pages. */
(function () {
  "use strict";
  var CFG = window.CONFIG || {};

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

  function tipoEndpoint(url) {
    if (CFG.ENDPOINT_TIPO && CFG.ENDPOINT_TIPO !== "auto") return CFG.ENDPOINT_TIPO;
    if (/script\.google\.com/.test(url)) return "appsscript";
    return "formspree";
  }

  var ESCALA_CONCORDA = [
    { v: "1", t: "Discordo totalmente" },
    { v: "2", t: "Discordo" },
    { v: "3", t: "Neutro" },
    { v: "4", t: "Concordo" },
    { v: "5", t: "Concordo totalmente" }
  ];

  window.initPesquisa = function (config) {
    var root = document.getElementById("app");
    var estado = {};

    function campoVisivel(campo) {
      if (!campo.mostrarSe) return true;
      return estado[campo.mostrarSe.campo] === campo.mostrarSe.valor;
    }
    function blocoVisivel(bloco) {
      if (!bloco.mostrarSe) return true;
      return estado[bloco.mostrarSe.campo] === bloco.mostrarSe.valor;
    }

    function marcarRadio(box, lab) {
      box.querySelectorAll("label").forEach(function (l) { l.classList.remove("marcada"); });
      lab.classList.add("marcada");
    }

    function renderCampo(campo) {
      var wrap = el("div", { class: "campo" });
      if (campo.label) {
        wrap.appendChild(el("label", { class: "rotulo" }, [
          campo.label + (campo.obrigatorio || campo.tipo === "likert" ? " " : ""),
          (campo.obrigatorio || campo.tipo === "likert") ? el("span", { class: "obrigatorio" }, ["*"]) : ""
        ].filter(function (x) { return x !== ""; })));
      }
      if (campo.ajuda) wrap.appendChild(el("div", { class: "ajuda" }, [campo.ajuda]));

      if (campo.tipo === "texto") {
        var inp = el("input", { type: "text", id: campo.id, name: campo.id, autocomplete: "off" });
        inp.addEventListener("input", function () { estado[campo.id] = inp.value; });
        wrap.appendChild(inp);

      } else if (campo.tipo === "textarea") {
        var ta = el("textarea", { id: campo.id, name: campo.id });
        ta.addEventListener("input", function () { estado[campo.id] = ta.value; });
        wrap.appendChild(ta);

      } else if (campo.tipo === "select") {
        var sel = el("select", { id: campo.id, name: campo.id });
        sel.appendChild(el("option", { value: "" }, ["selecione…"]));
        (campo.opcoes || []).forEach(function (o) { sel.appendChild(el("option", { value: o }, [o])); });
        sel.addEventListener("change", function () { estado[campo.id] = sel.value; refresh(); });
        wrap.appendChild(sel);

      } else if (campo.tipo === "radio") {
        var box = el("div", { class: "radio-inline" });
        (campo.opcoes || []).forEach(function (o) {
          var idr = campo.id + "_" + o.replace(/\s+/g, "-");
          var input = el("input", { type: "radio", name: campo.id, id: idr, value: o });
          var lab = el("label", { for: idr }, [input, o]);
          input.addEventListener("change", function () { estado[campo.id] = o; marcarRadio(box, lab); refresh(); });
          box.appendChild(lab);
        });
        wrap.appendChild(box);

      } else if (campo.tipo === "likert") {
        var escala = campo.escala
          ? campo.escala.map(function (t, i) { return { v: String(i + 1), t: t }; })
          : ESCALA_CONCORDA;
        var boxL = el("div", { class: "likert" });
        escala.forEach(function (o) {
          var idr = campo.id + "_" + o.v;
          var input = el("input", { type: "radio", name: campo.id, id: idr, value: o.v });
          var lab = el("label", { for: idr }, [
            input, el("span", { class: "n" }, [o.v]), el("span", { class: "t" }, [o.t])
          ]);
          input.addEventListener("change", function () { estado[campo.id] = o.v; marcarRadio(boxL, lab); });
          boxL.appendChild(lab);
        });
        wrap.appendChild(boxL);
      }
      return wrap;
    }

    function restaurarValores() {
      Object.keys(estado).forEach(function (id) {
        var val = estado[id];
        root.querySelectorAll('[name="' + id + '"]').forEach(function (elx) {
          if (elx.type === "radio") {
            if (elx.value === val) { elx.checked = true; if (elx.closest("label")) elx.closest("label").classList.add("marcada"); }
          } else {
            elx.value = val;
          }
        });
      });
    }

    function renderBlocos() {
      root.innerHTML = "";
      config.blocos.forEach(function (bloco) {
        if (!blocoVisivel(bloco)) return;
        var b = el("div", { class: "bloco" });
        b.appendChild(el("h2", null, [bloco.titulo]));
        if (bloco.subtitulo) b.appendChild(el("div", { class: "subtitulo" }, [bloco.subtitulo]));
        bloco.campos.forEach(function (campo) {
          if (!campoVisivel(campo)) return;
          b.appendChild(renderCampo(campo));
        });
        root.appendChild(b);
      });
      restaurarValores();
    }
    function refresh() { renderBlocos(); }

    function camposFaltando() {
      var faltando = [];
      config.blocos.forEach(function (bloco) {
        if (!blocoVisivel(bloco)) return;
        bloco.campos.forEach(function (campo) {
          if (!campoVisivel(campo)) return;
          var precisa = campo.obrigatorio || campo.tipo === "likert";
          if (precisa && !estado[campo.id]) faltando.push(campo.label || campo.id);
        });
      });
      return faltando;
    }

    function montarBarra() {
      var antiga = document.querySelector("body > .barra");
      if (antiga) antiga.remove();
      var barra = el("div", { class: "barra" });
      var w = el("div", { class: "wrap" });
      var btn = el("button", { class: "btn", type: "button", id: "enviar" }, ["Enviar respostas"]);
      btn.addEventListener("click", enviarClique);
      w.appendChild(btn);
      barra.appendChild(w);
      document.body.appendChild(barra);
    }

    function enviarClique() {
      var faltando = camposFaltando();
      if (faltando.length) {
        alert("Faltam responder:\n\n- " + faltando.join("\n- "));
        return;
      }
      var envio = {};
      Object.keys(estado).forEach(function (k) { envio[k] = estado[k]; });
      envio.onda = config.onda;
      envio.data_hora = new Date().toLocaleString("pt-BR");
      envio.origem = location.href;

      var btn = document.getElementById("enviar");
      btn.disabled = true; btn.textContent = "Enviando…";

      enviarRede(envio).then(function (ok) { mostrarResultado(ok, envio); });
    }

    function enviarRede(envio) {
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
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(envio)
      }).then(function (r) { return r.ok; }).catch(function () { return false; });
    }

    function mostrarResultado(ok, envio) {
      root.innerHTML = "";
      var barra = document.querySelector("body > .barra");
      if (barra) barra.remove();
      var box = el("div", { class: "resultado" });
      box.appendChild(el("h2", null, ["Obrigado por responder!"]));
      if (ok) {
        box.appendChild(el("div", { class: "status ok" }, ["✔ Resposta registrada. Você pode fechar a página."]));
      } else {
        box.appendChild(el("div", { class: "status pend" }, [
          "Não foi possível enviar automaticamente (sem internet ou envio não configurado). " +
          "Baixe o comprovante abaixo e mande para " + (CFG.PROFESSOR_NOME || "o(a) professor(a)") +
          (CFG.PROFESSOR_CONTATO ? " (" + CFG.PROFESSOR_CONTATO + ")" : "") + " por e-mail ou WhatsApp."
        ]));
        var btnCsv = el("button", { class: "btn", type: "button" }, ["Baixar comprovante (CSV)"]);
        btnCsv.addEventListener("click", function () { baixarCSV(envio); });
        box.appendChild(btnCsv);
      }
      root.appendChild(box);
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function baixarCSV(envio) {
      var chaves = Object.keys(envio);
      function esc(v) { v = String(v == null ? "" : v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
      var csv = "﻿" + [chaves, chaves.map(function (k) { return envio[k]; })]
        .map(function (r) { return r.map(esc).join(";"); }).join("\r\n") + "\r\n";
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = el("a", {
        href: URL.createObjectURL(blob),
        download: "pesquisa-" + config.onda + "-" + (envio.codigo || "resposta") + ".csv"
      });
      document.body.appendChild(a); a.click(); a.remove();
    }

    renderBlocos();
    montarBarra();
  };
})();
