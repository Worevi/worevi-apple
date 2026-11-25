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
   AS FERRAMENTAS COM LOGO A SÉRIO
   O Gui pediu os logótipos verdadeiros das apps, não inventados. Cinco
   destes conseguimos a sério — Notion, Trello, DaVinci Resolve, DJI e
   Google Agenda — vindos do Simple Icons (simpleicons.org), um projeto
   de código aberto feito exatamente para isto: mostrar que ferramentas
   uma pessoa usa, com o desenho oficial de cada marca, sem ser preciso
   pedir autorização a cada uma. Os outros (Photoshop, Illustrator,
   Premiere, After Effects, Lightroom, Canva, CapCut, Capture One)
   ficam com o monograma — ver estilo.css e o LEIA-ME para o porquê.
   ===================================================================== */
(function () {
  "use strict";

  var LOGOS = {
    notion: {
      cor: "#000000",
      caminho: 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z'
    },
    trello: {
      cor: "#0052CC",
      caminho: 'M21.147 0H2.853A2.86 2.86 0 000 2.853v18.294A2.86 2.86 0 002.853 24h18.294A2.86 2.86 0 0024 21.147V2.853A2.86 2.86 0 0021.147 0zM10.34 17.287a.953.953 0 01-.953.953h-4a.954.954 0 01-.954-.953V5.38a.953.953 0 01.954-.953h4a.954.954 0 01.953.953zm9.233-5.467a.944.944 0 01-.953.947h-4a.947.947 0 01-.953-.947V5.38a.953.953 0 01.953-.953h4a.954.954 0 01.953.953z'
    },
    davinci: {
      cor: "#233A51",
      caminho: 'M17.621 0 5.977.004c-1.37 0-2.756.345-3.762 1.11a4.925 4.925 0 0 0-1.61 2.003C.233 3.93 0 5.02 0 5.951l.012 12.2c.002 1.604.479 3.057 1.461 4.112.984 1.056 2.462 1.683 4.331 1.691L16.856 24c1.26.005 3.095-.036 4.303-.714 1.075-.605 2.025-1.556 2.497-2.984.278-.84.345-2.084.344-3.147l-.021-11.13c-.002-.888-.15-2.023-.547-2.934-.425-.976-1.181-1.815-2.322-2.425C20.353.26 19.123 0 17.622 0zm0 .93c1.378 0 2.538.295 3.04.565.977.523 1.544 1.166 1.889 1.96.315.721.47 1.793.473 2.572l.018 11.13c.002 1.013-.097 2.257-.298 2.86-.396 1.202-1.146 1.946-2.063 2.462-.814.457-2.612.593-3.82.588l-11.05-.044c-1.657-.007-2.832-.534-3.626-1.386-.792-.851-1.212-2.06-1.212-3.485L.999 5.95c0-.829.196-1.827.474-2.437.345-.757.75-1.207 1.365-1.674C3.585 1.27 4.868.97 6.08.97zm-5.66 3.423c-1.976.089-3.204 1.658-3.214 3.29.019 1.443 1.635 3.481 2.884 4.53.12.099.154.109.33.18.062.025.198-.047.327-.135.36-.245.993-.947 1.648-1.738a7.67 7.67 0 0 0 1.031-1.683c.409-.89.261-1.599.235-1.888a3.983 3.983 0 0 0-.99-1.692 3.36 3.36 0 0 0-2.251-.864zm4.172 7.922a10.185 10.185 0 0 0-3.244.61c-.15.058-.26.1-.374.17-.057.036-.11.135-.105.292.017.433.29 1.278.624 2.27.384 1.135 1.066 2.27 1.844 2.74a3.23 3.23 0 0 0 2.53.342c.832-.243 1.595-.868 1.962-1.546.986-1.818.19-3.548-1.121-4.417-.447-.296-1.133-.445-1.89-.46-.074 0-.15-.002-.226-.001zm-8.432.038a6.201 6.201 0 0 0-.752.047c-.596.078-.932.273-1.29.51a3.177 3.177 0 0 0-1.365 1.979c-.075.552-.086 1.053.033 1.507.433 1.389 1.326 2.222 2.847 2.452.636.028 1.37-.063 1.99-.45 1.269-.782 2.08-3.17 2.412-4.742.053-.176.035-.357-.013-.42-.005-.067-.044-.113-.19-.183-.398-.192-1.32-.417-2.375-.6a7.68 7.68 0 0 0-1.297-.1z'
    },
    dji: {
      cor: "#000000",
      caminho: 'M19.2 7.8a716.856 716.856 0 0 0-1.232 4.63c-.202.772-.401 1.544-.634 2.308-.226.743-.504 1.535-.91 2.21-.422.703-.969 1.253-1.726 1.604-.3.137-.615.24-.939.306-.46.09-.926.146-1.394.165-1.163.065-3.628.056-4.79.056l.713-2.64c.539 0 1.078.002 1.617-.013.52-.014 1.092-.042 1.605-.163.56-.133.984-.36 1.355-.817.337-.416.564-.935.75-1.424.34-.893.688-2.173.934-3.093.277-1.041.544-2.085.812-3.129zm4.8 0-2.072 7.68h-3.84l2.073-7.68ZM11.339 4.92h3.84c-.403 1.5-.805 2.999-1.212 4.496-.283 1.044-.565 2.088-.872 3.124-.135.452-.269.903-.445 1.342-.141.352-.3.666-.591.93a1.908 1.908 0 0 1-.734.405c-.356.112-.717.154-1.085.184-.53.043-1.06.054-1.591.063-1.991.02-3.983.02-5.974-.001a21.408 21.408 0 0 1-.954-.034 5.319 5.319 0 0 1-.632-.07 1.851 1.851 0 0 1-.412-.119c-.44-.192-.664-.575-.677-1.043 0-.263.032-.525.093-.78.076-.367.171-.728.265-1.09.179-.691.506-1.966.762-2.638.2-.526.464-1.05.966-1.382.28-.186.576-.285.901-.35.241-.05.483-.075.728-.093.41-.03.82-.04 1.23-.047.582-.01 1.165-.013 1.748-.015L8.148 7.8h1.454l-.518 1.92c-.864 0-1.728-.002-2.593.003-.252.001-.504 0-.756.016a.968.968 0 0 0-.264.042c-.113.04-.17.11-.22.213-.073.15-.115.31-.162.468a84.804 84.804 0 0 0-.503 1.857c-.035.14-.07.28-.1.42-.022.099-.04.197-.05.298-.01.11-.014.242.053.345.068.103.182.127.29.143.12.018.241.021.363.025.199.006.398.007.597.008.544.003 1.089.003 1.633 0 .25-.002.501-.004.752-.014.173-.007.343-.013.513-.054.13-.031.23-.08.318-.186.056-.071.1-.15.133-.235.088-.209.15-.425.213-.641.245-.83.466-1.665.692-2.499l.675-2.503.67-2.505h3.84z'
    },
    googlecalendar: {
      cor: "#4285F4",
      caminho: 'M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z'
    }
  };

  Array.prototype.forEach.call(document.querySelectorAll(".app-icone[data-app]"), function (el) {
    var chave = el.getAttribute("data-app");
    var logo = LOGOS[chave];
    if (!logo) return;

    el.textContent = "";
    el.classList.add("app-icone-real");  // tira o degradê, põe fundo claro
    el.style.removeProperty("--a");
    el.style.removeProperty("--b");

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "28");
    svg.setAttribute("height", "28");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", logo.caminho);
    path.setAttribute("fill", logo.cor);
    svg.appendChild(path);
    el.appendChild(svg);
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
