<div align="center">

<img src=".github/banner.svg" alt="Worevi · Apple — site minimalista, estilo Apple, feito do zero" width="100%">

<br>

<img src="https://img.shields.io/badge/HTML-e%20CSS-1d1d1f?logo=html5&logoColor=E34F26" alt="HTML e CSS">
<img src="https://img.shields.io/badge/depend%C3%AAncias-0-1d1d1f?labelColor=1d1d1f&color=f2b92a" alt="dependências 0">
<img src="https://img.shields.io/badge/tipografia-vari%C3%A1vel-1d1d1f?labelColor=1d1d1f&color=f2b92a" alt="tipografia variável">


</div>

<br>

> Um exercício de minimalismo: fundo branco, letras pretas, tudo centrado. Feito do zero, sem frameworks, com a tipografia tratada ao detalhe.

---

Site minimalista, estilo Apple, feito do zero passo a passo com o Gui.
Fundo branco, letras pretas, tudo centrado.

Correr:

```powershell
python -m http.server 8786 --directory "C:\Users\Gui\Desktop\Modelos Website\16-worevi-apple"
```

Depois: <http://localhost:8786>

## A letra

É o **SF Pro** do computador do Gui — a versão variável (`SF-Pro.ttf`),
com os dois eixos: o peso (`wght`, 1–1000) e o tamanho ótico (`opsz`,
17–28). O `opsz` é o que faz a Apple ter o "Display" nos títulos e o
"Text" no corpo sem trocar de ficheiro; o browser escolhe sozinho pelo
tamanho da letra (`font-optical-sizing:auto`).

O ficheiro original tem 5,9 MB e 14 826 glifos. Foi reduzido ao latim
(o português inteiro, pontuação, setas) com o `fonttools`: ficou em
**200 KB** e 1 067 glifos, em `fontes/sf-pro.woff`. O itálico ao lado,
157 KB. Sem brotli no PC não dá para woff2; o woff com zlib chega.

> O SF Pro é da Apple e a licença dela só o deixa usar em coisas para as
> plataformas Apple. Para pôr isto online a sério, convém trocar por uma
> letra livre parecida (Inter) ou confirmar a licença antes.

## Os passos

1. **Branco, preto, centrado, só texto** — o logo em cima (o vetor do
   `13-worevi/logo.svg`, a preto em vez de dourado) e as quatro palavras
   no meio: Trabalhos, Serviços, Equipa, Contacto. Mais nada — é este o
   nível de minimalismo. Tinha posto uma frase grande e uma linha por
   baixo; o Gui tirou-as. ✓

2. **A animação das palavras** — nada de sublinhado. Ao passar o rato,
   uma onda de peso atravessa a palavra letra a letra (500 → 800, com
   30 ms entre letras) e as outras três esbatem para cinzento; ao sair,
   a onda recua pela ordem inversa. Só é possível porque a letra é a
   variável. Cada palavra é medida à partida no peso máximo e fica com
   largura fixa, para os vizinhos não saltarem — confirmado: as posições
   não mexem um pixel. ✓

   A onda vale para **todas** as palavras que se leem como lista — as
   quatro do início e as das páginas (serviços, nomes, clientes,
   contactos) — para a sensação não mudar depois de se carregar. O
   JavaScript marca-as todas com `.palavra`. Um espaço sozinho dentro
   de um `inline-block` desaparece ("Redes sociais" ficou
   "Redessociais" à primeira): vai como espaço duro.

3. **As páginas e a troca** — nenhuma página repete a palavra em que
   se carregou: o conteúdo é a própria lista, no mesmo tamanho e no
   mesmo sítio das quatro palavras (Serviços é a lista de serviços,
   Equipa os nomes, Trabalhos os clientes, Contacto o email, o
   telefone e o Instagram). A troca é a mais limpa que há: o que sai
   esvai-se a subir 8 px em 0,3 s; o que entra assenta linha a linha,
   de 14 px abaixo, com 45 ms entre linhas. Só `opacity` e
   `transform`. O Voltar e o Anterior do browser fazem o mesmo ao
   contrário; abrir já com `#trabalhos` vai lá direto. ✓

   Antes disto houve três versões, e as três saíram: uma "água"
   (planos de tinta num canvas), um "voo por dentro das letras" (cada
   letra a voar com desfoque) e um "mergulho" (escala a partir da
   palavra). O Gui achou-as nada suaves e nada limpas. A lição, dita
   por ele: num site assim, a transição não é o espetáculo — e a
   página nova não pode começar por repetir a palavra que se acabou
   de ler.

   Os textos das listas são provisórios, só para se ver o desenho.

   **Ferramentas, atualizadas com dados a sério.** O Gui mandou
   `avaliacao_equipa.pdf` (avaliação interna, com competências,
   ferramentas, idiomas e objetivos de cada um). Usei a secção de
   "Aplicações e ferramentas" para o **Pedro** (CapCut, Canva, After
   Effects — em aprendizagem), o **Samuel** (CapCut, Lightroom,
   Blackmagic, Final Cut Pro), o **Arthur** (DaVinci Resolve,
   Illustrator, equipamento DJI) e o **Guilherme** (After Effects,
   Lightroom, Lightroom Classic, Photoshop, Illustrator, Figma) — seis
   ferramentas no caso dele, por isso as listas já não têm todas o
   mesmo tamanho. A Natália, a Gabriele, o Patrick e a Victoria
   continuam com as ferramentas provisórias de antes, por não estarem
   no PDF. O resto do documento (competências avaliadas, idiomas,
   objetivos, o ranking) ainda não entrou no site — só o que tocava
   nas Ferramentas.

4. **Os perfis da equipa** — cada nome da Equipa abre um perfil: a
   fotografia quadrada com cantos de 28 px, a flutuar (sobe e desce
   10 px em 6 s, com sombra suave por baixo), e a ficha ao lado — nome,
   cargo, duas linhas. A seta por baixo volta à Equipa, não ao início.
   As fotografias são as de `13-worevi/media`, cortadas ao quadrado a
   partir do topo (a cara está no terço de cima), em
   `media/equipa/*.webp` a 640×640. Em ecrã estreito a foto fica em
   cima e o texto por baixo. ✓

   **A seta** deixou de deslizar: aparece e mais nada (só opacidade),
   e no hover já não mexe para o lado.

   Nos perfis só o Guilherme Anjos e a Natália têm o cargo confirmado;
   os outros seis, e todos os textos, são provisórios.

   **A foto inclina com o rato** (semi-3D): roda até 14° em X e Y a
   acompanhar o cursor, com a sombra a crescer. (Tinha uma luz branca
   a andar por cima no sítio do rato; o Gui achou que não fazia falta
   e saiu.)

   **As quatro palavras do início têm cor** — ideia do Gui: ao passar
   o rato, cada uma vai do preto para a sua cor viva, com um brilho na
   mesma cor por trás. São as cores de sistema da Apple: Trabalhos
   azul `#0a84ff`, Serviços rosa `#ff375f`, Equipa verde `#30d158`,
   Contacto laranja `#ff9f0a`. A onda de peso continua por cima.

   Duas correções a este brilho:
   - **A transição saltava direto para a cor**, sem passar por estados
     intermédios: em repouso não havia nenhuma `text-shadow`, e no
     hover havia duas camadas — o browser só sabe misturar suavemente
     duas listas de sombra quando têm o MESMO número de camadas.
     Correção: as duas camadas já existem em repouso, só que a 0px e
     transparentes, e crescem até ao brilho final.
   - **O brilho estava exagerado** ("radioativo"), o Gui pediu mais
     discreto: desceu a opacidade da cor (de ~0,5 para ~0,2) e o
     alcance do desfoque (de 18–46px para 6–14px). Agora é uma luz
     pequena atrás da letra, não um néon. A zona que reage é a ficha inteira,
   para a foto já se virar quando o rato se aproxima. A flutuação
   fica no embrulho `.flutua` e a inclinação na própria foto: são dois
   `transform` e não podem viver no mesmo elemento. Desligado em
   `prefers-reduced-motion`.

   Serviços, na ordem pedida: Redes sociais, Videografia, Fotografia,
   Drone, Sites.

5. **O centro** — o conteúdo centra-se no espaço ABAIXO do logo, não na
   janela inteira (`padding-top` igual ao fundo do logo, 60 px, e zero
   em baixo). Centrar na janela dava o centro geométrico, mas o olho
   centra no que sobra, e tudo parecia alto. ✓

As quatro páginas-destino existem mas só têm o nome e o Voltar: o que
vai dentro de cada uma decide-se a seguir.

Os seguintes decidem-se um a um.

## O perfil virou currículo

Pedido do Gui: a página de cada pessoa deixa de ser só a fichazinha e
passa a portefólio a sério. Cada perfil ganhou:

- **Especialidades** — quatro etiquetas (pílulas cinzentas) com o que
  a pessoa faz. Provisórias, inventadas a partir do papel de cada um.
  Cada uma leva um pequeno ícone, ideia do Gui: um conjunto de 18
  símbolos de traço fino, desenhados à mão (`ICONES` em `app.js`),
  ligados à etiqueta por significado numa tabela (`MAPA`) — máquina
  fotográfica para "Produto", casa para "Interiores", sol para "Luz
  natural", e por aí fora. Ligados por JavaScript e não escritos no
  HTML de cada perfil: só há um sítio a mudar se uma etiqueta passar
  a usar outro ícone.
- **Ferramentas** — os apps que cada pessoa usa. Cinco têm o logótipo
  verdadeiro (Notion, Trello, DaVinci Resolve, DJI, Google Agenda),
  vindo do [Simple Icons](https://simpleicons.org), um projeto de
  código aberto (CC0) feito exatamente para isto — mostrar que
  ferramentas uma pessoa ou um projeto usa, com o desenho oficial de
  cada marca. O Photoshop, o Illustrator, o Premiere Pro, o After
  Effects e o Lightroom ficaram com o monograma a cores (quadrado
  arredondado + "Ps", "Ae", etc.) — não por preguiça: **é mesmo assim
  que o ícone oficial de cada um deles é**, a Adobe desenha as apps
  dela desse jeito. Já o Canva, o CapCut e o Capture One não existem
  no Simple Icons (tentei três caminhos diferentes, todos a dar 404 —
  parece que foram pedidos para sair, coisa que já aconteceu a marcas
  nesse projeto), por isso ficaram também com o monograma, como
  aproximação. **Se o Gui tiver os ficheiros oficiais destes três**
  (do site de imprensa de cada marca), é só mandar que se troca.

  **Atualização — ícones exatos.** O Gui exportou do Figma (Export →
  SVG) e mandou os ficheiros a sério: Photoshop, Illustrator, After
  Effects, Lightroom, Lightroom Classic e Figma. Estão em
  `media/apps/*.svg`, exatamente como saíram de lá — cada um já traz
  o quadrado de fundo desenhado dentro do próprio SVG, por isso
  `.app-icone-svg` não lhes põe cor nenhuma por cima, só a moldura. O
  Premiere Pro continua por fazer (o Gui não mandou esse); fica com o
  monograma de aproximação até chegar o ficheiro a sério. O Canva, o
  CapCut e o Capture One continuam sem ícone verdadeiro — não existem
  no conjunto do Figma que ele usou (é só da Adobe).
- **Trabalhos, em pastas** — o Gui pediu para tirar as fotos: nada de
  imagem, uma pasta como as do Finder no macOS (ícone só em CSS, um
  SVG só, reaproveitado em todas), com o nome do projeto à frente. Do
  **Pedro, Samuel, Arthur e Guilherme** são os nomes a sério, tirados
  de `avaliacao_equipa.pdf` que ele mandou (Podcast Igor, Benjamin,
  Diogo/Garage21, Evex, Thales, Antiga Padaria, JT, Limia Imobiliária,
  JT Rasta…). Da Natália, da Gabriele, do Patrick e da Victoria
  continuam provisórios, reaproveitados de nomes já usados no resto
  do site, por não haver dados.

Como isto já não cabe sempre num ecrã, **só a página de perfil
desliza** (`overflow-y:auto`) — as outras (Trabalhos, Serviços, Equipa,
Contacto, o início) continuam de propósito presas a um ecrã só. A seta
de voltar saiu do fluxo do conteúdo e ficou fixa no canto superior
esquerdo, como o "<" das Definições no iOS: visível mesmo a meio do
scroll. Nas outras páginas continua pendurada por baixo da lista, como
estava.

**Um bug apanhado a meio:** a regra que faz a página de perfil deslizar
(`.pagina.perfil{display:block}`) tinha a mesma força (duas classes)
que a regra que esconde páginas escondidas (`.pagina[hidden]
{display:none}`), e por vir depois no ficheiro ganhava — os oito
perfis ficavam todos a mostrar-se ao mesmo tempo, sobrepostos uns aos
outros. Via-se texto e fotos de pessoas diferentes misturados. Corrigido
com `.pagina.perfil[hidden]{display:none}`, que tem mais uma classe na
conta e garante que esconder continua a esconder.

## O perfil fica sempre centrado

Pedido do Gui: as informações do perfil estavam sempre encostadas ao
topo, mesmo quando havia espaço de sobra por baixo. Era um resto de ter
feito a página deslizar (`display:block`, sem a centragem que o resto
do site tem). Corrigido com `justify-content:safe center`: quando o
conteúdo cabe no ecrã, centra-se como em qualquer outra página; só
quando é mesmo mais alto do que o ecrã é que começa no topo e deixa
fazer scroll — porque centrar à força um conteúdo mais alto do que a
janela escondia o topo dele atrás da borda, impossível de alcançar a
fazer scroll.

## O logo e o cursor

O logo deixou de ser um link: era `<a href="#">`, por isso um clique
saltava para o início e o cursor mudava para a mãozinha — nenhuma das
duas coisas devia acontecer, pediu o Gui. Passou a `<div>`, decoração
pura, sem `href` e fora do alcance do `app.js` (que só ouve cliques em
`a[href^='#']`).

O cursor em todo o site passou a ser uma seta fina desenhada à mão
(`--cursor`, no `:root`), mais próxima da seta do macOS do que da seta
grossa por omissão do Windows/Chrome. Para valer também nas ligações —
o browser dá `cursor:pointer` (a mão) a qualquer `<a>` com `href`, mais
forte do que a herança normal — usa-se `*{cursor:inherit}`, que é uma
regra do autor e por isso ganha à folha de estilo do próprio browser.

## Cores da Apple, para não inventar

- preto dos títulos: `#1d1d1f` (não é `#000`)
- cinzento dos subtítulos: `#6e6e73`
- fio: `#d2d2d7`
- azul das ligações: `#0071e3` (por agora só na seleção e no foco)

---

<div align="center">
<sub>Um projeto da <a href="https://worevi.com">Worevi</a> · <a href="mailto:geral@worevi.com">geral@worevi.com</a></sub>
</div>
