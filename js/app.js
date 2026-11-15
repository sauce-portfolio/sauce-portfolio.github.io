/* Sauce portfolio — everything on the page comes from the files in /content.
   You shouldn't need to edit this file to add work, games or packs. */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => { const x = Number(n); return Number.isFinite(x) && String(n).trim() !== "" ? x.toLocaleString("en-US") : esc(n); };
  const icon = (id) => `<svg><use href="#i-${id}"/></svg>`;
  const ICONS = ["brush", "sparkle", "handshake", "bolt", "cube", "user", "steps", "check", "bag", "help"];

  const FILES = ["profile", "creations", "contributions", "packs", "shop"];
  async function load() {
    if (window.__CONTENT__) return window.__CONTENT__;
    const out = {};
    await Promise.all(FILES.map(async (f) => {
      const res = await fetch(`content/${f}.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error(`content/${f}.json → ${res.status}`);
      out[f] = await res.json();
    }));
    return out;
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
  }

  /* ---------- theme + bindings ---------- */
  const THEME_MAP = { background: "--ground", surface: "--card", text: "--ink", accent: "--accent", button: "--btn", heroFrom: "--hero-a", heroTo: "--hero-b" };
  function applyTheme(t, packs) {
    if (!t) return;
    const ok = (v) => /^#[0-9a-f]{3,8}$|^rgb|^hsl/i.test(String(v || "").trim());
    if (!packs) { for (const [k, v] of Object.entries(THEME_MAP)) if (ok(t[k])) document.documentElement.style.setProperty(v, t[k]); return; }
    const decl = Object.entries(THEME_MAP).filter(([k]) => ok(t[k])).map(([k, v]) => `${v}:${t[k]}`).join(";");
    const st = document.createElement("style"); st.textContent = `body.on-packs{${decl}}`; document.head.appendChild(st);
  }
  function bind(p) {
    $$("[data-bind]").forEach((el) => { const v = p[el.dataset.bind]; if (v != null && v !== "") el.textContent = v; });
    $$("[data-bind-src]").forEach((el) => { const v = p[el.dataset.bindSrc]; if (v) el.src = v; else el.hidden = true; });
    $$("[data-href]").forEach((el) => { const v = p[el.dataset.href]; if (v) el.href = v; else { el.removeAttribute("target"); el.dataset.nolink = "contact"; } });
    $("#year").textContent = new Date().getFullYear();
    const open = !p.status || p.status.open;
    const st = $("#status");
    st.classList.toggle("closed", !open);
    $("#logo-dot").classList.toggle("closed", !open);
    $("span", st).textContent = open ? (p.status?.label || "Available") : (p.status?.closedLabel || "Not available");
  }

  function socialIcon(s) {
    const t = `${s.label} ${s.url}`.toLowerCase();
    if (t.includes("discord")) return "discord";
    if (t.includes("x.com") || t.includes("twitter") || s.label.trim().toLowerCase() === "x") return "x";
    if (t.includes("artstation")) return "artstation";
    return "link";
  }

  const swap = (c) => `<span class="swap"><img class="r" src="${esc(c.cover)}" alt="${esc(c.title || "3D model")}" loading="lazy"></span>`;

  /* ---------- portfolio ---------- */
  function renderPortfolio(d) {
    const p = d.profile, items = d.creations || [], games = d.contributions || [];

    $("#stat-games").textContent = games.length;


    // studios + games: big cards. The first two are wide; the last row is widened so it never leaves a hole.
    const wide = new Set([0, 1]);
    const left = games.length - 2;
    if (left % 3 === 2) [1, 2].forEach((k) => wide.add(games.length - k));
    if (left % 3 === 1 && left >= 4) [1, 2, 3, 4].forEach((k) => wide.add(games.length - k));
    $("#games-grid").innerHTML = games.map((g, i) => {
      const tag = g.url ? "a" : "div";
      const attrs = g.url ? ` href="${esc(g.url)}" target="_blank" rel="noopener"` : "";
      const okBg = /^#[0-9a-f]{3,8}$/i.test(String(g.bg || "").trim());
      const cover = g.fit === "cover";
      const mono = String(g.game || "").split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase();
      const art = g.thumbnail
        ? `${okBg || cover ? "" : `<img class="fit-bg" src="${esc(g.thumbnail)}" alt="" aria-hidden="true" loading="lazy">`}<img class="fit-img" src="${esc(g.thumbnail)}" alt="${esc(g.game)}" loading="lazy">`
        : `<span class="game-mono" aria-hidden="true">${esc(mono)}</span>`;
      const soon = /soon|unreleased|upcoming|not released/i.test(g.badge || "");
      const cls = ["game", wide.has(i) ? "wide" : "", left % 3 === 1 && left < 4 && i === games.length - 1 ? "full" : ""].filter(Boolean).join(" ");
      return `<${tag} class="${cls}"${attrs}>
        <span class="game-img${cover ? " cover" : ""}${okBg ? " plate" : ""}"${okBg ? ` style="background:${esc(g.bg.trim())}"` : ""}>${art}
          ${g.badge ? `<span class="game-badge${soon ? " soon" : ""}${/current/i.test(g.badge) ? " live" : ""}"><i></i>${esc(g.badge)}</span>` : ""}
          ${g.url ? `<span class="game-play">${/roblox\.com\/games/.test(g.url) ? "Play" : "Visit"} ↗</span>` : ""}
        </span>
        <span class="game-info">
          <span class="game-text">
            <span class="game-name">${esc(g.game)}</span>
            <span class="game-role">${esc([g.role, g.studio].filter(Boolean).join(" · "))}</span>
          </span>
          ${g.visits || g.ccu ? `<span class="game-nums">${g.visits ? `<b>${esc(g.visits)}</b><small>visits</small>` : ""}${g.ccu ? `<em>${esc(g.ccu)} peak CCU</em>` : ""}</span>` : ""}
        </span>
      </${tag}>`;
    }).join("");
    $("#games").hidden = !games.length;

    // about: discord-style profile card
    if (p.banner) $("#dp-banner").style.backgroundImage = `url("${String(p.banner).replace(/"/g, "")}")`;
    const open = !p.status || p.status.open;
    $("#dp-dot").classList.toggle("closed", !open);
    $("#dp-bubble").classList.toggle("closed", !open);
    $("#dp-bubble span").textContent = open ? (p.status?.label || "Available") : (p.status?.closedLabel || "Not available");
    $("#dp-socials").innerHTML = (p.socials || []).map((s) =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(socialIcon(s))}</a>`).join("");
    $("#dp-meta").innerHTML = [
      ["Tools", (p.tools || []).join(", ")],
      ["Experience", p.experience ? `${p.experience} years` : ""],
      ["Contributed", p.visits ? `${p.visits} visits` : ""],
      ["Games", games.length ? String(games.length) : ""],
    ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");

    $("#about-body").innerHTML = String(p.about || "").split(/\n\s*\n/).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join("");
    $("#facts").innerHTML = (p.aboutCards || []).map((c) => {
      const ic = ICONS.includes(c.icon) ? c.icon : "sparkle";
      return `<li><span class="ico">${icon(ic)}</span><div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div></li>`;
    }).join("");
    $("#tags").innerHTML = (p.tags || p.tools || []).map((t) => `<li>${esc(t)}</li>`).join("");

    // filters + mosaic (images only)
    const cats = ["All", ...new Set(items.map((c) => c.category).filter(Boolean))];
    const count = (cat) => (cat === "All" ? items.length : items.filter((c) => c.category === cat).length);
    $("#filters").innerHTML = cats.length > 2 ? cats.map((c, i) =>
      `<button type="button" data-cat="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}<span>${count(c)}</span></button>`).join("") : "";
    $("#filters").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#filters button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      filter(b.dataset.cat);
    };
    $("#grid").innerHTML = items.map((c, i) => `
      <button type="button" class="tile" data-i="${i}" data-cat="${esc(c.category)}" aria-label="View image ${i + 1}">${swap(c)}</button>`).join("");
    $("#grid").onclick = (e) => { const t = e.target.closest(".tile"); if (t) openViewer(+t.dataset.i); };
    layoutMosaic();

    const art = (p.socials || []).find((s) => socialIcon(s) === "artstation");
    $("#more").innerHTML = art ? `<a class="btn btn-white" href="${esc(art.url)}" target="_blank" rel="noopener">${icon("artstation")}See more on ArtStation</a>` : "";

    // contact pills
    const rows = [];
    if (p.discordUsername) rows.push(`<li><button type="button" data-copy="${esc(p.discordUsername)}">${icon("discord")}${esc(p.discordUsername)} <small>Copy</small></button></li>`);
    (p.socials || []).forEach((s) => rows.push(`<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${icon(socialIcon(s))}${esc(s.handle || s.label)}</a></li>`));
    if (p.email) rows.push(`<li><button type="button" data-copy="${esc(p.email)}">${icon("link")}${esc(p.email)} <small>Copy</small></button></li>`);
    $("#links").innerHTML = rows.join("");

    $("#foot-links").innerHTML = (p.socials || []).map((s) =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(socialIcon(s))}</a>`).join("");
  }

  // alternating 2/4 then 3/3 widths, like the reference gallery
  function layoutMosaic() {
    const vis = $$("#grid .tile:not(.is-hidden)");
    vis.forEach((t, k) => {
      t.classList.remove("s2", "s3", "s4", "full");
      t.classList.add(k === vis.length - 1 && k % 2 === 0 ? "full" : "s3");
    });
  }
  function filter(cat) {
    $$("#grid .tile").forEach((t) => {
      const show = cat === "All" || t.dataset.cat === cat;
      t.classList.toggle("is-hidden", !show);
      if (show) { t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop"); }
    });
    layoutMosaic();
  }

  /* ---------- viewer ---------- */
  let items = [], cur = 0, view = "render";
  const visibleIdx = () => $$("#grid .tile:not(.is-hidden)").map((c) => +c.dataset.i);
  function drawViewer() {
    const c = items[cur]; if (!c) return;
    $("#v-media").innerHTML = c.video
      ? `<video src="${esc(c.video)}" poster="${esc(c.cover)}" autoplay muted loop playsinline controls></video>`
      : `<img src="${esc(c.cover)}" alt="${esc(c.title || "3D model")}">`;
    const vis = visibleIdx();
    $("#v-count").textContent = `${vis.indexOf(cur) + 1} / ${vis.length}`;
    $("#v-prev").hidden = $("#v-next").hidden = vis.length < 2;
  }
  function openViewer(i) { cur = i; view = "render"; drawViewer(); const d = $("#viewer"); if (!d.open) { d.showModal(); lenis?.stop(); } }
  function step(dir) {
    const vis = visibleIdx(); if (!vis.length) return;
    let k = vis.indexOf(cur); if (k < 0) k = 0;
    cur = vis[(k + dir + vis.length) % vis.length]; drawViewer();
  }
  function wireViewer() {
    const dlg = $("#viewer");
    $("#v-close").onclick = () => dlg.close();
    $("#v-prev").onclick = () => step(-1);
    $("#v-next").onclick = () => step(1);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => { $("#v-media").innerHTML = ""; lenis?.start(); });
    document.addEventListener("keydown", (e) => {
      if (!dlg.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
    let x0 = null;
    $(".v-stage").addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    $(".v-stage").addEventListener("touchend", (e) => {
      if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
  }

  /* ---------- packs ---------- */
  let buyLink = "";   // where "Buy on Discord" goes when a pack has no payment link yet
  const packImages = (p) => (Array.isArray(p.images) && p.images.length ? p.images : [p.cover]).filter(Boolean);
  const rbx = (v) => `R$ ${num(v)}`;
  function buyButtons(p, big) {
    const out = [];
    const link = (url, cls, label) => `<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
    if (p.paypalUrl) out.push(link(p.paypalUrl, "btn-primary", big ? "Buy with PayPal" : "PayPal"));
    if (p.robuxUrl) out.push(link(p.robuxUrl, p.paypalUrl ? "btn-white" : "btn-primary", big ? "Buy with Robux" : "Robux"));
    if (!out.length) out.push(buyLink
      ? link(buyLink, "btn-primary", `${icon("discord")}Buy on Discord`)
      : `<a class="btn btn-primary" href="#" data-nolink="contact">${icon("discord")}Buy on Discord</a>`);
    return `<div class="buy-row${out.length === 1 ? " one" : ""}">${out.join("")}</div>`;
  }
  const priceHtml = (p) => p.priceUsd || p.priceRobux
    ? `${p.priceUsd ? `<b>$${esc(p.priceUsd)}</b>` : ""}${p.priceUsd && p.priceRobux ? "<span>or</span>" : ""}${p.priceRobux ? `<span class="rbx">${rbx(p.priceRobux)}</span>` : ""}`
    : `<b class="ask">Price on request</b>`;
  // an image shown whole (no cropping) over a blurred copy of itself, so any image ratio fills its frame
  const fit = (src, alt, lazy) => `<img class="fit-bg" src="${esc(src)}" alt="" aria-hidden="true"${lazy ? ' loading="lazy"' : ""}><img class="fit-img" src="${esc(src)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ""}>`;

  /* featured carousel: one slide per pack image, featured pack first */
  let fxSlides = [], fxCur = 0, fxTimer = null, fxPaused = false, fxNote = "";
  const fxBody = (p) => `
    <div class="fx-main">
      <h2 class="fx-title">${esc(p.title)}</h2>
      <p class="feat-tag">${esc(p.tagline)}</p>
      ${(p.includes || []).length ? `<ul class="checks">${p.includes.map((x) => `<li>${icon("check")}${esc(x)}</li>`).join("")}</ul>` : ""}
    </div>
    <div class="fx-buy">
      <div class="price">${priceHtml(p)}</div>
      ${buyButtons(p, true)}
      ${fxNote ? `<p class="buy-note">${esc(fxNote)}</p>` : ""}
    </div>`;
  function fxShow(i, byUser) {
    const n = fxSlides.length; if (!n) return;
    const before = fxSlides[fxCur]?.pack;
    fxCur = ((i % n) + n) % n;
    const s = fxSlides[fxCur];
    $$("#fx-media .fx-slide").forEach((el, k) => el.classList.toggle("on", k === fxCur));
    $$("#fx-dots button").forEach((el, k) => el.setAttribute("aria-current", k === fxCur));
    // every pack's text sits in the same grid cell, so the card keeps the height of the longest one
    if (s.pack !== before || !$("#fx-panes .on")) $$("#fx-panes .fx-pane").forEach((el, k) => el.classList.toggle("on", k === s.pi));
    $("#fx-badge").hidden = !s.pack.featured;
    const tag = $("#fx-tag"); tag.hidden = !s.pack.priceUsd; tag.textContent = s.pack.priceUsd ? `$${s.pack.priceUsd}` : "";
    if (byUser) fxAuto();
  }
  function fxAuto() {
    clearInterval(fxTimer);
    if (REDUCED || fxSlides.length < 2) return;
    fxTimer = setInterval(() => { if (!fxPaused && !document.hidden && !$("#page-packs").hidden) fxShow(fxCur + 1); }, 5000);
  }

  function renderPacks(d) {
    const all = d.packs || [], shop = d.shop || {};
    const feat = all.find((p) => p.featured) || all[0];
    const packs = feat ? [feat, ...all.filter((p) => p !== feat)] : [];
    buyLink = d.profile?.ctaUrl || "";
    fxNote = shop.buyNote || "";

    // hero
    if (shop.headline) $("#shop-headline").textContent = shop.headline;
    if (shop.headlineAccent != null) $("#shop-accent").textContent = shop.headlineAccent;
    $("#shop-intro").textContent = shop.intro || "";
    const prices = packs.map((p) => Number(p.priceUsd)).filter((x) => Number.isFinite(x) && x > 0);
    $("#shop-stats").innerHTML = [
      [packs.length, packs.length === 1 ? "pack available" : "packs available"],
      prices.length ? [`$${Math.min(...prices)}`, "starting price"] : null,
      ["PayPal · R$", "ways to pay"],
    ].filter(Boolean).map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("");
    const words = [...packs.map((p) => p.title), ...(shop.tags || [])].filter(Boolean);
    const strip = words.map((w, i) => `<span${i % 2 ? ' class="o"' : ""}>${esc(w)}</span>`).join("");
    $("#marquee").innerHTML = words.length ? strip.repeat(Math.ceil(24 / words.length)).repeat(2) : "";
    $(".marquee").hidden = !words.length;

    // featured carousel
    fxSlides = packs.flatMap((p, pi) => packImages(p).map((src) => ({ pack: p, pi, src })));
    fxCur = 0;
    $("#featured-pack").innerHTML = fxSlides.length ? `
      <article class="fx" id="fx">
        <span class="fx-ring" aria-hidden="true"></span>
        <div class="fx-in">
          <div class="fx-media" id="fx-media">
            ${fxSlides.map((s, i) => `<figure class="fx-slide${i ? "" : " on"}">${fit(s.src, s.pack.title, i > 0)}</figure>`).join("")}
            <span class="fx-shine" aria-hidden="true"></span>
            <span class="fx-badge" id="fx-badge">${icon("sparkle")}Featured pack</span>
            <span class="fx-tag" id="fx-tag"></span>
            ${fxSlides.length > 1 ? `
            <button type="button" class="fx-nav fx-prev" data-step="-1" aria-label="Previous image">‹</button>
            <button type="button" class="fx-nav fx-next" data-step="1" aria-label="Next image">›</button>
            <div class="fx-dots" id="fx-dots">${fxSlides.map((s, i) => `<button type="button" data-slide="${i}" aria-label="Image ${i + 1}: ${esc(s.pack.title)}"></button>`).join("")}</div>` : ""}
          </div>
          <div class="fx-panes" id="fx-panes">${packs.map((p) => `<div class="fx-body fx-pane">${fxBody(p)}</div>`).join("")}</div>
        </div>
      </article>` : "";
    $("#featured").hidden = !fxSlides.length;
    $("#featured-hint").hidden = fxSlides.length < 2;
    if (fxSlides.length) {
      const fx = $("#fx"), media = $("#fx-media");
      media.onclick = (e) => {
        const nav = e.target.closest("[data-step]"), dot = e.target.closest("[data-slide]");
        if (nav) fxShow(fxCur + Number(nav.dataset.step), true);
        else if (dot) fxShow(Number(dot.dataset.slide), true);
      };
      fx.addEventListener("mouseenter", () => { fxPaused = true; });
      fx.addEventListener("mouseleave", () => { fxPaused = false; });
      fx.addEventListener("focusin", () => { fxPaused = true; });
      fx.addEventListener("focusout", () => { fxPaused = false; });
      let x0 = null;
      media.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      media.addEventListener("touchend", (e) => {
        if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) fxShow(fxCur + (dx < 0 ? 1 : -1), true);
      });
      fxShow(0);
      fxAuto();
    }

    // every pack, as cards
    $("#pack-grid").innerHTML = packs.map((p, i) => {
      const imgs = packImages(p);
      return `
      <article class="card pack">
        <button type="button" class="pack-img" data-pack="${i}" aria-label="See ${esc(p.title)} bigger">
          ${imgs[0] ? fit(imgs[0], p.title, true) : ""}
          ${p.featured ? `<span class="pack-flag">${icon("sparkle")}Featured</span>` : ""}
          ${imgs.length > 1 ? `<span class="pack-count">${imgs.length} images</span>` : ""}
        </button>
        <div class="pack-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.tagline)}</p>
          <div class="pack-price">${priceHtml(p)}</div>
          ${buyButtons(p, false)}
        </div>
      </article>`;
    }).join("");
    $("#pack-grid").onclick = (e) => {
      const b = e.target.closest("[data-pack]"); if (!b) return;
      const k = fxSlides.findIndex((s) => s.pack === packs[Number(b.dataset.pack)]);
      if (k >= 0) { fxShow(k, true); goto("featured"); }
    };
    $("#all-packs").hidden = !packs.length;

    $("#paypal-steps").innerHTML = (shop.paypalSteps || []).map((s) => `<li>${esc(s)}</li>`).join("");
    $("#robux-steps").innerHTML = (shop.robuxSteps || []).map((s) => `<li>${esc(s)}</li>`).join("");
    $("#faq").innerHTML = (shop.faq || []).map((f) => `<details class="card"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  }

  /* ---------- routing + dock ---------- */
  const DOCKS = {
    portfolio: [["home", "Home"], ["work", "Work"], ["games", "Games"], ["about", "About"], ["contact", "Contact"]],
    packs: [["shop-home", "Home"], ["featured", "Featured"], ["all-packs", "Packs"], ["buying", "Buying"], ["faq-sec", "FAQ"]],
  };
  let io;
  function route() {
    const page = location.hash === "#packs" ? "packs" : "portfolio";
    $("#page-portfolio").hidden = page !== "portfolio";
    $("#page-packs").hidden = page !== "packs";
    document.body.classList.toggle("on-portfolio", page === "portfolio");
    document.body.classList.toggle("on-packs", page === "packs");
    $$("[data-door]").forEach((a) => a.dataset.door === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    const list = DOCKS[page].filter(([id]) => { const el = document.getElementById(id); return el && !el.hidden; });
    $("#dock").innerHTML = list.map(([id, label], i) => `<button type="button" data-goto="${id}"${i === 0 ? ' class="on"' : ""}>${label}</button>`).join("");
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) $$("#dock button").forEach((b) => b.classList.toggle("on", b.dataset.goto === en.target.id)); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    list.forEach(([id]) => io.observe(document.getElementById(id)));
    if (lenis) lenis.scrollTo(0, { immediate: true }); else window.scrollTo(0, 0);
    reveal();
  }
  function goto(id) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.closest(".page")?.hidden) { location.hash = el.closest("#page-packs") ? "#packs" : "#portfolio"; setTimeout(() => goto(id), 40); return; }
    const top = id === "home" || id === "shop-home";
    if (lenis) { lenis.scrollTo(top ? 0 : el, { offset: -86, duration: 1.3 }); return; }
    const smooth = !REDUCED;
    if (top) window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    else el.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }

  /* ---------- global clicks ---------- */
  function wireClicks() {
    document.addEventListener("click", async (e) => {
      const door = e.target.closest("[data-door], .logo");
      if (door) {
        const target = door.dataset.door || "portfolio";
        const current = location.hash === "#packs" ? "packs" : "portfolio";
        if (target === current) { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.2 }); else window.scrollTo({ top: 0, behavior: "smooth" }); }
        return;
      }
      const g = e.target.closest("[data-goto]");
      if (g) { e.preventDefault(); goto(g.dataset.goto); return; }
      const n = e.target.closest("[data-nolink]");
      if (n) { e.preventDefault(); toast(n.dataset.nolink === "contact" ? "Contact link not set yet." : "This payment link isn't set up yet."); return; }
      const c = e.target.closest("[data-copy]");
      if (c) {
        const text = c.dataset.copy;
        try { await navigator.clipboard.writeText(text); toast(`Copied “${text}”`); }
        catch { toast(`Discord: ${text}`); }
      }
    });
    window.addEventListener("hashchange", route);
  }

  /* ---------- smooth scroll (Lenis) + reveal on scroll ---------- */
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  if (window.Lenis && !REDUCED) {
    try {
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (err) { lenis = null; }
  }
  let rio;
  function reveal() {
    if (REDUCED || !("IntersectionObserver" in window)) return;
    rio?.disconnect();
    rio = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); rio.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    const page = document.querySelector(".page:not([hidden])");
    if (!page) return;
    $$(".sec-head, .tile, .game, .dp, .about-main, .end, .pack, .how-col, .faq details, .more, .filters, .fx, .shop-end", page).forEach((el, i) => {
      if (el.classList.contains("in")) return;
      el.classList.add("rv");
      const sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty("--d", `${Math.min(sib, 6) * 70}ms`);
      rio.observe(el);
    });
  }

  /* ---------- boot ---------- */
  wireClicks();
  wireViewer();
  load().then((d) => {
    items = d.creations || [];
    applyTheme(d.profile.theme);
    applyTheme(d.profile.packsTheme, true);
    bind(d.profile);
    renderPortfolio(d);
    renderPacks(d);
    route();
  }).catch((err) => {
    console.error(err);
    route();
    document.querySelector("main").insertAdjacentHTML("afterbegin",
      `<p class="wrap" style="padding-top:110px;color:#c2453b">Couldn't load the site content (${esc(err.message)}). If you opened index.html straight from your computer, use a local server or GitHub Pages instead.</p>`);
  });
})();
