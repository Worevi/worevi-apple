/* =====================================================================
   WOREVI · apple — o que se mexe.

   1. A ONDA DE PESO (ao passar o rato)
      Uma onda de peso atravessa a palavra letra a letra (500 → 800) e
      as outras três esbatem. Só é possível porque o SF Pro é variável.

   2. O VOO (ao carregar)
      A palavra em que se carrega é o portal. A câmara voa por dentro
      dela: as letras do meio vêm primeiro ao encontro de quem olha, as
      das pontas abrem para os lados e rodam, tudo passa e desfoca —
      como atravessar um túnel de letras. As outras palavras afastam-se
      para o fundo. Quando a última letra passa, a página nova aterra
      do fundo, do desfocado ao nítido. O Voltar faz tudo ao contrário.

      É perspetiva CSS a sério; aqui só se calculam os caminhos de cada
      letra e se marcam os tempos. Sem bibliotecas.
   ===================================================================== */
(function () {
  "use strict";

  /* todas as palavras que se leem como lista: as quatro do início e as
     das páginas (um nome, um serviço, um cliente). Quando a linha tem
     ligação, a onda vai na ligação; senão, na própria linha. */
  var ligacoes = [];
  Array.prototype.forEach.call(document.querySelectorAll(".caminhos a"), function (a) { ligacoes.push(a); });
  Array.prototype.forEach.call(document.querySelectorAll(".lista > li"), function (li) {
    ligacoes.push(li.querySelector("a") || li);
  });
  if (!ligacoes.length) return;
  ligacoes.forEach(function (el) { el.classList.add("palavra"); });

  var quieto = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ as letras em spans */

  Array.prototype.forEach.call(ligacoes, function (a) {
    var texto = a.textContent.trim();
    a.setAttribute("aria-label", texto);   // o leitor de ecrã lê a palavra inteira
    a.textContent = "";

    var letras = Array.from(texto);        // por pontos de código: o ç é um
    letras.forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "l";
      s.style.setProperty("--i", i);
      s.style.setProperty("--n", letras.length);
      // um espaço sozinho dentro de um inline-block desaparece
      // ("Redes sociais" ficava "Redessociais"): vai como espaço duro
      s.textContent = (ch === " ") ? " " : ch;
      s.setAttribute("aria-hidden", "true");
      a.appendChild(s);
    });
  });

  if (quieto) return;

  /* Medir cada palavra no peso máximo e reservar-lhe essa largura, para
     os vizinhos não mexerem quando a onda passa. Só depois de a letra
     estar carregada (medir com a letra de recurso partia as palavras),
     como largura mínima, e o CSS proíbe a quebra de qualquer maneira. */
  function medir() {
    Array.prototype.forEach.call(ligacoes, function (a) {
      a.style.minWidth = "";
      a.classList.add("medir");
      var w = a.getBoundingClientRect().width;
      a.classList.remove("medir");
      a.style.minWidth = Math.ceil(w) + "px";
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  else window.addEventListener("load", medir);

  var atraso;
  window.addEventListener("resize", function () {
    clearTimeout(atraso);
    atraso = setTimeout(medir, 150);
  });
})();


/* =====================================================================
   A TROCA DE PÁGINA — ver o comentário no estilo.css.
   O que sai esvai-se; o que entra assenta linha a linha. Aqui só se
   numeram as linhas (--k, para o desfasamento), se ligam as classes e
   se limpa no fim.
   ===================================================================== */
(function () {
  "use strict";

  var ecra = document.getElementById("inicio");
  var paginas = Array.prototype.slice.call(document.querySelectorAll(".pagina"));
  if (!ecra || !paginas.length) return;

  var quieto = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var aCorrer = false;
  var PASSO = 45, ARRANQUE = 120, LINHA = 650, SAIDA = 300;

  function reflow(el) { void el.offsetWidth; }

  /* numerar as linhas de cada camada, para entrarem uma a seguir à outra */
  function numerar(camada) {
    var linhas = camada.querySelectorAll(".lista li, .ficha > *, .voltar, .caminhos a");
    Array.prototype.forEach.call(linhas, function (l, k) {
      l.style.setProperty("--k", k);
    });
    return linhas.length;
  }
  numerar(ecra);
  paginas.forEach(numerar);

  function mostrarSo(alvo) {
    ecra.hidden = (alvo !== ecra);
    paginas.forEach(function (p) { p.hidden = (p !== alvo); });
  }

  /* a troca é simétrica: serve para ir e para voltar */
  function trocar(de, para) {
    aCorrer = true;
    document.body.classList.add("aViajar");

    de.classList.add("aSair");

    para.classList.add("aEntrar");
    para.hidden = false;
    reflow(para);
    para.classList.add("cá");

    var n = para.querySelectorAll(".lista li, .ficha > *, .voltar, .caminhos a").length;
    var dura = ARRANQUE + n * PASSO + LINHA;

    setTimeout(function () {
      de.hidden = true;
      de.classList.remove("aSair");
    }, SAIDA + 20);

    setTimeout(function () {
      para.classList.remove("aEntrar", "cá");
      document.body.classList.remove("aViajar");
      aCorrer = false;
    }, dura);
  }

  function ir(alvo, empurrarHistorico) {
    if (aCorrer || !alvo) return;
    var atual = document.querySelector("#inicio:not([hidden]), .pagina:not([hidden])");
    if (atual === alvo) return;
    if (empurrarHistorico) history.pushState({ id: alvo.id }, "", "#" + alvo.id);
    if (quieto) { mostrarSo(alvo); return; }
    trocar(atual, alvo);
  }

  function porId(id) {
    if (!id || id === "inicio") return ecra;
    var el = document.getElementById(id);
    return (el && el.classList.contains("pagina")) ? el : null;
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']");
    if (!a) return;
    var alvo = porId(a.getAttribute("href").slice(1));
    if (!alvo) return;
    e.preventDefault();
    ir(alvo, true);
  });

  window.addEventListener("popstate", function (e) {
    var id = (e.state && e.state.id) || location.hash.slice(1) || "inicio";
    ir(porId(id), false);
  });

  var la = porId(location.hash.slice(1));
  if (la && la !== ecra) mostrarSo(la);
  history.replaceState({ id: (la || ecra).id }, "");
})();

/* =====================================================================
   AS FOTOS A INCLINAR COM O RATO
   Semi-3D: a foto roda até 14° a acompanhar o rato, e uma luz branca
   anda por cima dela no sítio do cursor. A zona que reage é a ficha
   inteira (foto e texto), para a foto já estar a virar-se quando o
   rato se aproxima. Ao sair, volta devagar ao lugar.
   ===================================================================== */
(function () {
  "use strict";

  var quieto = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (quieto) return;

  var MAX = 14;   // graus

  Array.prototype.forEach.call(document.querySelectorAll(".ficha"), function (ficha) {
    var caixa = ficha.querySelector(".flutua");
    if (!caixa) return;
    var pedido = null;

    function mover(e) {
      var r = caixa.getBoundingClientRect();
      // posição do rato em relação à FOTO, de 0 a 1 (pode passar de 1
      // quando está sobre o texto: a foto continua a seguir)
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      var ry = (px - 0.5) * 2 * MAX;
      var rx = -(py - 0.5) * 2 * MAX;
      ry = Math.max(-MAX, Math.min(MAX, ry));
      rx = Math.max(-MAX, Math.min(MAX, rx));
      if (pedido) return;
      pedido = requestAnimationFrame(function () {
        pedido = null;
        caixa.style.setProperty("--rx", rx.toFixed(2) + "deg");
        caixa.style.setProperty("--ry", ry.toFixed(2) + "deg");
        caixa.style.setProperty("--mx", (Math.max(0, Math.min(1, px)) * 100).toFixed(1) + "%");
        caixa.style.setProperty("--my", (Math.max(0, Math.min(1, py)) * 100).toFixed(1) + "%");
      });
    }

    ficha.addEventListener("mouseenter", function () { caixa.classList.add("aInclinar"); });
    ficha.addEventListener("mousemove", mover);
    ficha.addEventListener("mouseleave", function () {
      caixa.classList.remove("aInclinar");
      caixa.style.setProperty("--rx", "0deg");
      caixa.style.setProperty("--ry", "0deg");
    });
  });
})();
