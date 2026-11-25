# Worevi · apple

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

## Cores da Apple, para não inventar

- preto dos títulos: `#1d1d1f` (não é `#000`)
- cinzento dos subtítulos: `#6e6e73`
- fio: `#d2d2d7`
- azul das ligações: `#0071e3` (por agora só na seleção e no foco)
