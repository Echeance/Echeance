// Génère les visuels SVG du profil (assets/*.svg).
// Usage : node build/build.mjs
// Les polices sont embarquées en base64 (sous-ensembles WOFF2), car un SVG affiché comme image
// sur GitHub ne peut pas charger de police externe.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "assets");
mkdirSync(out, { recursive: true });

const font = (name, file) => `@font-face{font-family:"${name}";src:url(data:font/woff2;base64,${readFileSync(join(here, "fonts", file)).toString("base64")}) format("woff2")}`;
const FONTS = {
  black: font("AnyBlack", "any-black.woff2"),
  wide: font("AnyWide", "any-wide.woff2"),
  it: font("LitIt", "lit-it.woff2"),
  lit: font("Lit", "lit.woff2"),
  mono: font("Mono", "mono.woff2"),
};
const C = { bg: "#120e0b", bg2: "#1d1611", cream: "#efe6d6", dim: "#8f8270", amber: "#ffb547", red: "#d8402a", line: "#2c231b", paper: "#efe5cf", ink: "#2b2420" };
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* grain + vignette réutilisables */
const defs = (id = "g") => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .07 0"/></filter>
  <radialGradient id="${id}v" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`;
const svg = (w, h, fonts, css, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>
<style>${fonts.map(f => FONTS[f]).join("")}
.b{font-family:AnyBlack,Impact,sans-serif}.w{font-family:AnyWide,Arial,sans-serif}.i{font-family:LitIt,Georgia,serif;font-style:italic}.l{font-family:Lit,Georgia,serif}.m{font-family:Mono,monospace}
${css}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>${body}</svg>`;
const write = (name, s) => { writeFileSync(join(out, name), s); console.log(name, (s.length / 1024).toFixed(1) + " Ko"); };

/* ------------------------------------------------------------------ */
/* 1. En-tête                                                          */
/* ------------------------------------------------------------------ */
{
  const W = 1280, H = 540;
  // oscilloscope : deux tracés que l'on alterne pour faire vivre l'onde
  const wave = (ph, amp) => { let d = ""; for (let x = 0; x <= 420; x += 6) { const k = x / 420 * Math.PI * 2; const y = 60 - (Math.sin(k * 3 + ph) * .6 + Math.sin(k * 7 - ph * 1.7) * .28 + Math.sin(k * 13 + ph) * .12) * amp; d += (x ? " L" : "M") + x + " " + y.toFixed(1); } return d; };
  let ticks = ""; for (let i = 0; i <= 40; i++) { const x = 760 + i * 11; ticks += `<line x1="${x}" x2="${x}" y1="${i % 5 ? 104 : 96}" y2="112" stroke="${C.ink}" stroke-width="${i % 5 ? 1 : 2}"/>`; if (i % 10 === 0) ticks += `<text x="${x}" y="128" class="b" font-size="13" fill="${C.ink}" text-anchor="middle">${88 + i / 2}</text>`; }
  const letters = (t, x, y, size, cls, fill, delay) => [...t].map((c, i) => `<tspan class="up" style="animation-delay:${(delay + i * .06).toFixed(2)}s">${esc(c)}</tspan>`).join("");
  write("hero.svg", svg(W, H, ["black", "it", "mono", "wide"], `
    .up{opacity:0;animation:up .9s cubic-bezier(.2,.9,.2,1) forwards}
    @keyframes up{from{opacity:0}to{opacity:1}}
    .rise{animation:rise 1.1s cubic-bezier(.2,.9,.2,1) both}
    @keyframes rise{from{transform:translateY(40px);opacity:0}}
    .fade{opacity:0;animation:fade 1.2s ease forwards}
    @keyframes fade{to{opacity:1}}
    .blink{animation:blink 1.4s steps(1) infinite}
    @keyframes blink{50%{opacity:.15}}
    .needle{animation:tune 7s cubic-bezier(.6,0,.2,1) infinite alternate}
    @keyframes tune{0%{transform:translateX(0)}35%{transform:translateX(250px)}60%{transform:translateX(170px)}100%{transform:translateX(330px)}}
    .glow{animation:glow 3.2s ease-in-out infinite}
    @keyframes glow{50%{opacity:.55}}
  `, `
  <defs>${defs()}<linearGradient id="dial" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e3ae"/><stop offset="1" stop-color="#e1b05c"/></linearGradient>
    <clipPath id="dc"><rect x="740" y="70" width="480" height="70" rx="8"/></clipPath></defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>
  <radialGradient id="hl" cx="78%" cy="8%" r="60%"><stop offset="0" stop-color="${C.amber}" stop-opacity=".16"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></radialGradient><rect width="${W}" height="${H}" rx="18" fill="url(#hl)" class="glow"/>

  <text x="64" y="64" class="m" font-size="15" fill="${C.dim}">echeance · Nathan Ghys</text>
  <circle cx="1188" cy="58" r="6" fill="${C.red}" class="blink"/><text x="1176" y="64" class="w" font-size="14" fill="${C.cream}" text-anchor="end" letter-spacing="1">EN ONDE</text>

  <!-- cadran -->
  <g class="fade" style="animation-delay:.2s">
    <rect x="740" y="70" width="480" height="70" rx="8" fill="url(#dial)"/>
    <g clip-path="url(#dc)">${ticks}<g class="needle"><rect x="772" y="72" width="3" height="66" fill="${C.red}"/></g></g>
    <rect x="740" y="70" width="480" height="70" rx="8" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="2"/>
  </g>

  <text x="58" y="292" class="b" font-size="172" fill="${C.cream}" letter-spacing="-4">${letters("NATHAN", 0, 0, 0, "", "", .1)}</text>
  <text x="58" y="440" class="b" font-size="172" fill="${C.amber}" letter-spacing="-4">${letters("GHYS", 0, 0, 0, "", "", .5)}</text>
  <text x="58" y="440" class="b" font-size="172" fill="none" stroke="${C.red}" stroke-width="1.5" letter-spacing="-4" transform="translate(5 5)" opacity=".55">${letters("GHYS", 0, 0, 0, "", "", .55)}</text>

  <g class="rise" style="animation-delay:.9s">
    <text x="640" y="268" class="i" font-size="34" fill="#f3d9a8">Je construis des choses</text>
    <text x="640" y="310" class="i" font-size="34" fill="#f3d9a8">qui tournent pour de vrai.</text>
  </g>
  <g class="fade" style="animation-delay:1.3s">
    <text x="640" y="360" class="m" font-size="16" fill="${C.dim}">Développeur full-stack · C++ · Java · JavaScript</text>
    <text x="640" y="386" class="m" font-size="16" fill="${C.dim}">BUT Informatique · IUT d'Arles · Aix-Marseille Université</text>
  </g>
  <g transform="translate(640 400)" class="fade" style="animation-delay:1.1s">
    <rect width="580" height="96" rx="8" fill="#0d0a07" stroke="${C.line}"/>
    <g transform="translate(20 -12)" fill="none" stroke="${C.amber}" stroke-width="2.4" stroke-linejoin="round">
      <path d="${wave(0, 34)}"><animate attributeName="d" dur="2.4s" repeatCount="indefinite" values="${wave(0, 34)};${wave(2.1, 26)};${wave(4.2, 36)};${wave(0, 34)}"/></path>
    </g>
    <text x="560" y="84" class="w" font-size="12" fill="${C.dim}" text-anchor="end" letter-spacing="1">SIGNAL CALÉ</text>
  </g>
  <rect width="${W}" height="${H}" rx="18" fill="url(#gv)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="17" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
  `, "Nathan Ghys, développeur full-stack : je construis des choses qui tournent pour de vrai."));
}

/* ------------------------------------------------------------------ */
/* 2. Les cinq mondes du portfolio (une vignette par template)         */
/* ------------------------------------------------------------------ */
{
  const W = 248, H = 180;
  const frame = (name, body, label, sub, fg, bg, fonts, css = "") => write(`world-${name}.svg`, svg(W, H, ["wide", "it", ...fonts], css, `
    <defs><clipPath id="c"><rect width="${W}" height="${H}" rx="12"/></clipPath>${defs()}</defs>
    <g clip-path="url(#c)"><rect width="${W}" height="${H}" fill="${bg}"/>${body}<rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect y="${H - 46}" width="${W}" height="46" fill="${bg}" opacity=".92"/>
    <text x="14" y="${H - 21}" class="w" font-size="16" fill="${fg}">${esc(label)}</text>
    <text x="14" y="${H - 7}" class="i" font-size="11.5" fill="${fg}" opacity=".7">${esc(sub)}</text></g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="11.5" fill="none" stroke="#000" stroke-opacity=".35"/>`, `${label} : ${sub}`));

  // L'Atlas : courbes de niveau + route rouge qui se trace
  let iso = ""; for (let k = 0; k < 6; k++) iso += `<ellipse cx="${118 + k * 3}" cy="${66 - k}" rx="${92 - k * 14}" ry="${50 - k * 8}" fill="none" stroke="#8a6a46" stroke-opacity="${.3 + k * .1}" stroke-width="${k ? 1 : 1.8}" transform="rotate(${-8 + k * 3} 120 66)"/>`;
  frame("atlas", `${iso}<path d="M28 116 C70 40 120 110 160 50 S220 40 226 24" fill="none" stroke="#b3341f" stroke-width="2" stroke-dasharray="6 5" class="route"/>
    ${[[28, 116], [92, 76], [160, 50], [226, 24]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" fill="#b3341f" stroke="${C.paper}" stroke-width="2" class="pin" style="animation-delay:${i * .5}s"/>`).join("")}`,
    "L'Atlas", "une carte gravée, projet par projet", C.ink, C.paper, [],
    `.route{stroke-dashoffset:300;animation:draw 4s ease-in-out infinite}@keyframes draw{to{stroke-dashoffset:0}}.pin{transform-box:fill-box;transform-origin:center;animation:pin 2s ease-in-out infinite}@keyframes pin{50%{transform:scale(1.35)}}`);

  // Mémoires : pellicule qui défile
  let holes = ""; for (let i = -1; i < 12; i++) holes += `<rect x="${i * 24}" y="8" width="14" height="10" rx="2" fill="#e9dcc4"/><rect x="${i * 24}" y="114" width="14" height="10" rx="2" fill="#e9dcc4"/>`;
  frame("memoires", `<g class="roll"><rect x="-40" y="0" width="340" height="132" fill="#151210"/>${holes}
      <rect x="10" y="26" width="104" height="80" fill="#3a2a1d"/><rect x="128" y="26" width="104" height="80" fill="#5a3b22"/><rect x="246" y="26" width="104" height="80" fill="#3a2a1d"/></g>
    <circle cx="70" cy="66" r="18" fill="#f0a33a" opacity=".55"/><path d="M150 96 L178 52 L206 96Z" fill="#f0a33a" opacity=".45"/>`,
    "Mémoires", "une bobine de souvenirs, en 3D", C.cream, "#0e0c0a", [],
    `.roll{animation:roll 3s linear infinite}@keyframes roll{to{transform:translateX(-24px)}}`);

  // Fréquences : cadran et aiguille
  let t2 = ""; for (let i = 0; i < 22; i++) t2 += `<line x1="${16 + i * 10.5}" x2="${16 + i * 10.5}" y1="${i % 5 ? 70 : 62}" y2="80" stroke="${C.ink}" stroke-width="${i % 5 ? 1 : 2}"/>`;
  frame("frequences", `<rect x="10" y="20" width="228" height="78" rx="6" fill="url(#d2)"/><defs><linearGradient id="d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e3ae"/><stop offset="1" stop-color="#e1b05c"/></linearGradient></defs>
    ${t2}<text x="20" y="44" class="w" font-size="10" fill="${C.ink}">DELTARISE · FACELOG · AVENOIR</text><rect x="40" y="22" width="3" height="74" fill="${C.red}" class="nd"/>
    <path d="M10 118 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="${C.amber}" stroke-width="2" class="wv"/>`,
    "Fréquences", "un poste radio, une station par projet", C.cream, "#16110d", [],
    `.nd{animation:nd 4s cubic-bezier(.6,0,.2,1) infinite alternate}@keyframes nd{to{transform:translateX(160px)}}.wv{animation:wv 1.2s linear infinite}@keyframes wv{to{transform:translateX(-24px)}}`);

  // Chambre noire : un tirage qui se révèle sous la lampe rouge
  frame("chambre-noire", `<rect width="${W}" height="${H}" fill="#3a0a05"/><rect x="34" y="18" width="180" height="104" rx="8" fill="#5b1a10"/>
    <rect x="52" y="30" width="144" height="82" fill="#f3efe6" class="pp"/><g class="dev"><circle cx="98" cy="62" r="14" fill="#2a1410"/><path d="M60 104 L104 70 L132 90 L160 64 L188 104Z" fill="#2a1410"/></g>
    <path d="M0 10 Q124 26 248 10" fill="none" stroke="#c9a" stroke-opacity=".5"/>`,
    "Chambre noire", "les projets se révèlent dans le bac", "#f3e2da", "#2a0704", [],
    `.dev{opacity:0;animation:dev 4.5s ease-in infinite}@keyframes dev{70%,100%{opacity:1}}`);

  // Planches : case de BD tramée + onomatopée
  frame("planches", `<rect width="${W}" height="${H}" fill="#f2e8d0"/><rect x="10" y="10" width="140" height="116" fill="#f6d75a" stroke="#141210" stroke-width="4"/>
    <rect x="160" y="10" width="78" height="116" fill="#9cc9e6" stroke="#141210" stroke-width="4"/>
    <pattern id="ht" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.6" fill="#141210" opacity=".35"/></pattern>
    <rect x="12" y="12" width="136" height="112" fill="url(#ht)"/>
    <g class="pow"><text x="80" y="82" class="b" font-size="44" fill="#d9374b" stroke="#141210" stroke-width="3" paint-order="stroke" text-anchor="middle" transform="rotate(-8 80 70)">300 !</text></g>
    <ellipse cx="199" cy="58" rx="32" ry="22" fill="#fff" stroke="#141210" stroke-width="2.5"/><text x="199" y="62" class="w" font-size="10" text-anchor="middle" fill="#141210">À suivre…</text>`,
    "Planches", "une BD animée, case après case", "#141210", "#f2e8d0", ["black"],
    `.pow{transform-box:fill-box;transform-origin:center;animation:pow 1.8s cubic-bezier(.3,1.6,.4,1) infinite}@keyframes pow{0%{transform:scale(.6)}40%,100%{transform:scale(1)}}`);
}

/* ------------------------------------------------------------------ */
/* 3. En ce moment : Avenoir                                           */
/* ------------------------------------------------------------------ */
{
  const W = 1280, H = 320;
  const peng = readFileSync(join(here, "penguin.svg"), "utf8").match(/<rect[^>]*\/>/g).join("");
  const lines = [
    ["› ", "lance firefox", C.cream, 0],
    ["✓ ", "voie rapide : exécuté sans IA, même hors ligne", C.amber, 1.6],
    ["› ", "supprime le dossier Téléchargements", C.cream, 3.0],
    ["! ", "action sensible : confirmation obligatoire [o/N]", C.red, 4.6],
  ];
  write("now.svg", svg(W, H, ["black", "it", "mono", "wide", "lit"], `
    .ln{opacity:0;animation:ln 9s steps(1) infinite}
    @keyframes ln{0%{opacity:0}1%,92%{opacity:1}100%{opacity:0}}
    .cur{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
    .bob{animation:bob 2.6s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-6px)}}
  `, `<defs>${defs()}</defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.bg}"/><rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>
  <text x="64" y="70" class="w" font-size="15" fill="${C.red}" letter-spacing="2">● EN CE MOMENT</text>
  <text x="64" y="138" class="b" font-size="82" fill="${C.cream}">Avenoir</text>
  <text x="64" y="182" class="i" font-size="23" fill="#f3d9a8">Parler à son ordinateur,</text>
  <text x="64" y="212" class="i" font-size="23" fill="#f3d9a8">sans lui confier les clés de la maison.</text>
  <text x="64" y="262" class="m" font-size="14" fill="${C.dim}">C++23 · CMake · Linux et Windows</text>
  <g transform="translate(470 54)">
    <rect width="746" height="212" rx="10" fill="#0b0907" stroke="${C.line}"/>
    <circle cx="20" cy="18" r="5" fill="#3a2c20"/><circle cx="38" cy="18" r="5" fill="#3a2c20"/><circle cx="56" cy="18" r="5" fill="#3a2c20"/>
    <text x="373" y="23" class="m" font-size="12" fill="${C.dim}" text-anchor="middle">avenoir</text>
    ${lines.map(([p, t, col, d], i) => `<text x="28" y="${70 + i * 36}" class="m ln" font-size="17" style="animation-delay:${d}s"><tspan fill="${col === C.cream ? C.amber : col}">${esc(p)}</tspan><tspan fill="${col}">${esc(t)}</tspan></text>`).join("")}
    <rect x="28" y="182" width="10" height="18" fill="${C.amber}" class="cur"/>
    <g transform="translate(640 92) scale(6)" class="bob" shape-rendering="crispEdges">${peng}</g>
  </g>
  <text x="1216" y="300" class="i" font-size="12" fill="${C.dim}" text-anchor="end">illustration du fonctionnement</text>
  <rect width="${W}" height="${H}" rx="18" fill="url(#gv)"/>`, "En ce moment : Avenoir, un assistant système sûr par défaut."));
}

/* ------------------------------------------------------------------ */
/* 4. Cartes de projets                                                */
/* ------------------------------------------------------------------ */
{
  const W = 620, H = 330;
  const cards = [
    { id: "deltarise", n: "1", nl: "accord officiel du studio", t: "DeltaRise", k: "Plateforme esport européenne", h: ["Une scène esport construite", "de zéro, pour toute l'Europe."], s: "React · Node.js · PostgreSQL · Socket.io", y: "2026", col: "#5b8cff" },
    { id: "facelog", n: "99,7 %", nl: "réponses justes · 12 403 paires", t: "FaceLog", k: "Reconnaissance faciale · équipe de 5", h: ["L'appel se fait tout seul,", "en un regard."], s: "Electron · C++ N-API · OpenCV · OpenSSL", y: "SAÉ S3", col: C.amber },
    { id: "neverless", n: "40", nl: "positions mémorisées par joueur", t: "NeverLessSpigot", k: "Moteur de serveur multithread", h: ["Le serveur remonte le temps", "pour que chaque coup compte."], s: "Java · NMS · Netty · Maven", y: "2024 → 26", col: "#7fd1c7" },
    { id: "rinaorc", n: "300", nl: "joueurs simultanés sur mon mode", t: "Rinaorc", k: "Collaborateur Java · modes de jeu", h: ["Un mode de jeu inventé,", "codé, et joué en masse."], s: "Java · Spigot · Maven · MySQL", y: "2024", col: C.red },
    { id: "emerixe", n: "0", nl: "déconnexion pendant un transfert", t: "EmerixeProxy", k: "Proxy pour serveurs de jeu", h: ["Un seul point d'entrée,", "des serveurs à la demande."], s: "Java · Netty · Redis · Docker", y: "2024", col: "#c98bff" },
    { id: "navyra", n: "1", nl: "passe pour tous les trajets", t: "Navyra", k: "Carte et itinéraires · SAÉ S2", h: ["Brest → Nice : le plus court", "chemin, pour toutes les villes."], s: "C++ · Qt · Floyd-Warshall", y: "SAÉ S2", col: "#9ad36a" },
  ];
  for (const c of cards) {
    write(`card-${c.id}.svg`, svg(W, H, ["black", "it", "mono", "wide"], `
      .num{animation:num 1.2s cubic-bezier(.2,.9,.2,1) both}@keyframes num{from{transform:translateY(24px);opacity:0}}
      .bar{transform-origin:left;animation:bar 1.4s cubic-bezier(.2,.9,.2,1) both .3s}@keyframes bar{from{transform:scaleX(0)}}
    `, `<defs>${defs()}</defs>
    <rect width="${W}" height="${H}" rx="16" fill="${C.bg}"/><rect width="${W}" height="${H}" rx="16" fill="url(#g)"/>
    <rect x="36" y="36" width="64" height="5" fill="${c.col}" class="bar"/>
    <text x="36" y="72" class="w" font-size="13" fill="${C.dim}" letter-spacing="1">${esc(c.k.toUpperCase())}</text>
    <text x="${W - 36}" y="72" class="m" font-size="13" fill="${C.dim}" text-anchor="end">${esc(c.y)}</text>
    <text x="36" y="128" class="b" font-size="52" fill="${C.cream}">${esc(c.t)}</text>
    <text x="36" y="170" class="i" font-size="21" fill="#f3d9a8">${esc(c.h[0])}</text>
    <text x="36" y="198" class="i" font-size="21" fill="#f3d9a8">${esc(c.h[1])}</text>
    <g class="num"><text x="${W - 36}" y="268" class="b" font-size="74" fill="${c.col}" text-anchor="end">${esc(c.n)}</text>
    <text x="${W - 36}" y="292" class="m" font-size="12" fill="${C.dim}" text-anchor="end">${esc(c.nl)}</text></g>
    <text x="36" y="240" class="m" font-size="13" fill="${C.cream}" opacity=".8">${esc(c.s)}</text>
    <rect width="${W}" height="${H}" rx="16" fill="url(#gv)"/>`, `${c.t} — ${c.h.join(" ")}`));
  }
}

/* ------------------------------------------------------------------ */
/* 5. Le studio (compétences)                                          */
/* ------------------------------------------------------------------ */
{
  const W = 1280, H = 420;
  const cats = [
    ["Langages", ["Java", "C++", "C", "JavaScript", "TypeScript", "Python", "ASM", "HTML / CSS"]],
    ["Web & apps", ["React", "Node.js", "Express", "Vite", "Socket.io", "Electron", "Qt", "N-API", "Tailwind"]],
    ["Données", ["PostgreSQL", "MySQL", "SQLite", "Redis", "Hibernate", "OpenCV", "OpenSSL"]],
    ["Outils & système", ["Git", "Docker", "Maven", "GDB", "Valgrind", "SSH", "Linux · CachyOS", "Bash", "Niri / Wayland"]],
    ["Électronique & 3D", ["Raspberry Pi", "Arduino", "ESP32", "UART · I2C · SPI", "SolidWorks"]],
  ];
  const colW = (W - 128) / cats.length;
  write("studio.svg", svg(W, H, ["black", "mono", "wide", "it"], `
    .it{opacity:0;animation:in .6s ease forwards}@keyframes in{to{opacity:1}}
    .lvl{transform-box:fill-box;transform-origin:bottom;animation:lv 2.6s ease-in-out infinite alternate}@keyframes lv{from{transform:scaleY(.35)}}
  `, `<defs>${defs()}</defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.bg}"/><rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>
  <text x="64" y="74" class="w" font-size="15" fill="${C.amber}" letter-spacing="2">LE STUDIO</text>
  <text x="200" y="74" class="i" font-size="18" fill="${C.dim}">le matériel avec lequel j'émets</text>
  ${cats.map(([cat, items], ci) => {
    const x = 64 + ci * colW;
    return `<g transform="translate(${x} 110)">
      ${[0, 1, 2, 3, 4, 5].map(b => `<rect x="${b * 9}" y="${-2 - (b + 2) * 3}" width="6" height="${(b + 2) * 3}" fill="${C.amber}" opacity="${.35 + b * .12}" class="lvl" style="animation-delay:${(ci * .3 + b * .1).toFixed(2)}s"/>`).join("")}
      <text y="34" class="b" font-size="27" fill="${C.cream}">${esc(cat)}</text>
      ${items.map((it, i) => `<text y="${70 + i * 27}" class="m it" font-size="15" fill="#cfc3b0" style="animation-delay:${(ci * .15 + i * .05).toFixed(2)}s">${esc(it)}</text>`).join("")}
    </g>`;
  }).join("")}
  <rect width="${W}" height="${H}" rx="18" fill="url(#gv)"/>`, "Compétences : Java, C++, C, JavaScript, TypeScript, Python, React, Node.js, PostgreSQL, Docker, Linux, Raspberry Pi, SolidWorks et plus."));
}

/* ------------------------------------------------------------------ */
/* 6. Pied de page                                                     */
/* ------------------------------------------------------------------ */
{
  const W = 1280, H = 170;
  write("footer.svg", svg(W, H, ["black", "it", "wide", "mono"], `
    .sig{stroke-dasharray:900;stroke-dashoffset:900;animation:sig 3.5s ease forwards .4s}@keyframes sig{to{stroke-dashoffset:0}}
  `, `<defs>${defs()}</defs>
  <rect width="${W}" height="${H}" rx="18" fill="${C.amber}"/>
  <text x="64" y="96" class="b" font-size="64" fill="${C.bg}">QSL ?</text>
  <text x="270" y="78" class="i" font-size="24" fill="${C.bg}">Stage, alternance ou projet :</text>
  <text x="270" y="110" class="i" font-size="24" fill="${C.bg}">je suis à l'écoute.</text>
  <path class="sig" d="M820 110 C850 40 870 130 900 80 S950 50 960 100 S1010 60 1040 96 S1100 70 1130 92 S1180 80 1216 74" fill="none" stroke="${C.bg}" stroke-width="3" stroke-linecap="round"/>
  <text x="1216" y="140" class="m" font-size="13" fill="${C.bg}" text-anchor="end" opacity=".75">Nathan Ghys · Arles · fin de transmission</text>
  <rect width="${W}" height="${H}" rx="18" fill="url(#g)"/>`, "Stage, alternance ou projet : je suis à l'écoute."));
}
