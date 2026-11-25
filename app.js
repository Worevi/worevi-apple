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
    var linhas = camada.querySelectorAll(".lista li, .ficha > *, .cv-bloco, .voltar, .caminhos a");
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

    var n = para.querySelectorAll(".lista li, .ficha > *, .cv-bloco, .voltar, .caminhos a").length;
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
   OS ÍCONES DAS ESPECIALIDADES
   Ideia do Gui: um símbolo pequeno antes de cada etiqueta, a dizer o
   que é aquilo de relance — como os ícones da lista de Definições no
   iOS. É um conjunto de 18 símbolos, desenhados à mão no mesmo
   traço fino (stroke, sem preenchimento) que a seta de voltar já usa,
   para parecerem uma família e não um conjunto apanhado à pressa.

   Ligados aqui, por JavaScript, e não escritos no HTML de cada perfil:
   assim só há UM sítio a mudar se amanhã a etiqueta "Produto" passar a
   usar outro ícone, em vez de oito.
   ===================================================================== */
(function () {
  "use strict";

  var ICONES = {
    camera: '<rect x="3" y="7" width="18" height="13" rx="2.3"/><path d="M8 7l1.6-2.2h4.8L16 7"/><circle cx="12" cy="13.6" r="3.3"/>',
    retrato: '<circle cx="12" cy="8.6" r="3.3"/><path d="M5.3 20c.9-4.2 3.8-6.4 6.7-6.4s5.8 2.2 6.7 6.4"/>',
    predio: '<path d="M4 11.3 12 5l8 6.3"/><path d="M6.3 10v9.2h11.4V10"/><path d="M10 19.2v-5h4v5"/>',
    sol: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3.3v2.2M12 18.5v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M3.3 12h2.2M18.5 12h2.2M4.4 19.6l1.6-1.6M18 6l1.6-1.6"/>',
    video: '<rect x="3" y="7" width="12" height="10" rx="2.2"/><path d="M15 10.3 20.5 7.2v9.6L15 13.7"/>',
    reel: '<circle cx="12" cy="12" r="8.5"/><path d="M10 9.3l5 2.7-5 2.7z"/>',
    mic: '<rect x="9.2" y="3.3" width="5.6" height="10.4" rx="2.8"/><path d="M5.8 11.3a6.2 6.2 0 0 0 12.4 0"/><path d="M12 17.7v3M9 20.7h6"/>',
    paleta: '<path d="M12 3a9 9 0 1 0 0 18h.6a2.3 2.3 0 0 0 1.6-3.9 2 2 0 0 1 1.4-3.5H17a4 4 0 0 0 4-4A8.1 8.1 0 0 0 12 3z"/><circle cx="7.6" cy="10.6" r="1" fill="currentColor" stroke="none"/><circle cx="8.7" cy="15.2" r="1" fill="currentColor" stroke="none"/><circle cx="13.3" cy="7.3" r="1" fill="currentColor" stroke="none"/>',
    sliders: '<path d="M4 7h7M15 7h5M4 12h11M19 12h1M4 17h3M11 17h9"/><circle cx="13" cy="7" r="1.9"/><circle cx="17" cy="12" r="1.9"/><circle cx="9" cy="17" r="1.9"/>',
    mala: '<rect x="3" y="8" width="18" height="11.2" rx="2.2"/><path d="M9 8V6.3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V8"/><path d="M3 13.2h18"/>',
    chat: '<path d="M4 5h16v11.4H9.2L5 20.5V5z"/><path d="M8 9.2h8M8 12.7h5"/>',
    moeda: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4v9.2"/><path d="M9.2 9.5c0-1.3 1.2-2.1 2.8-2.1s2.6.8 2.6 1.9c0 2.6-5.4 1.3-5.4 4 0 1.1 1.2 1.9 2.8 1.9s2.8-.8 2.8-2.1"/>',
    calendario: '<rect x="3.3" y="5" width="17.4" height="15" rx="2.2"/><path d="M3.3 9.6h17.4M8 3v4M16 3v4"/><circle cx="8.3" cy="13.4" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13.4" r="1" fill="currentColor" stroke="none"/><circle cx="15.7" cy="13.4" r="1" fill="currentColor" stroke="none"/>',
    texto: '<path d="M6 3.5h9l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"/><path d="M15 3.5V8h4"/><path d="M8 12.6h8M8 16.1h5"/>',
    pessoas: '<circle cx="8.6" cy="9" r="2.6"/><circle cx="16.2" cy="9.5" r="2.2"/><path d="M3.3 19.2c.7-3.3 2.8-5.1 5.3-5.1s4.5 1.8 5.2 5.1"/><path d="M14.4 14.4c2.1.3 3.8 2 4.3 4.8"/>',
    drone: '<circle cx="12" cy="12" r="2.3"/><path d="M12 9.6V6.2M12 14.4v3.4M9.6 12H6.2M14.4 12h3.4"/><circle cx="6" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
    expandir: '<path d="M4 9.2V5h4.2M19.8 9.2V5h-4.2M4 14.8V19h4.2M19.8 14.8V19h-4.2"/>',
    escudo: '<path d="M12 3 5.2 6v5.3c0 4.4 2.9 7.3 6.8 8.7 3.9-1.4 6.8-4.3 6.8-8.7V6z"/><path d="M9 12.2l2 2 4-4.3"/>'
  };

  var MAPA = {
    "Direção de arte": "paleta", "Branding": "paleta",
    "Fotografia": "camera", "Produto": "camera",
    "Edição": "sliders", "Montagem": "sliders", "Color grading": "sliders",
    "Gestão de projetos": "mala", "Operações": "mala",
    "Produção": "mala", "Logística": "mala",
    "Apoio ao cliente": "chat", "Orçamentos": "moeda",
    "Retrato": "retrato", "Interiores": "predio", "Luz natural": "sol",
    "Calendário editorial": "calendario", "Calendário": "calendario",
    "Copywriting": "texto", "Reels": "reel", "Comunidade": "pessoas",
    "Casting": "pessoas",
    "Filmes de marca": "video", "Motion": "video",
    "Som direto": "mic", "Som": "mic",
    "Pilotagem FPV": "drone", "Planeamento aéreo": "drone",
    "4K": "expandir", "Licenças": "escudo"
  };

  Array.prototype.forEach.call(document.querySelectorAll(".tag"), function (t) {
    var chave = MAPA[t.textContent.trim()];
    var miolo = ICONES[chave];
    if (!miolo) return;     // etiqueta que não conhecemos: fica só o texto
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", "tag-icone");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.innerHTML = miolo;
    t.insertBefore(svg, t.firstChild);
  });
})();

/* =====================================================================
   AS FOTOS A INCLINAR COM O RATO
   Semi-3D: a foto roda até 14° a acompanhar o rato, com a sombra a
   crescer. A zona que reage é a ficha inteira (foto e texto), para a
   foto já estar a virar-se quando o rato se aproxima. Ao sair, volta
   devagar ao lugar. (Havia aqui uma luz a andar por cima da foto; o
   Gui achou que não fazia falta e saiu — ver estilo.css.)
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
