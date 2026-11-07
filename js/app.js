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


    // games grid
    $("#games-grid").innerHTML = games.map((g) => {
      const tag = g.url ? "a" : "div";
      const attrs = g.url ? ` href="${esc(g.url)}" target="_blank" rel="noopener"` : "";
      return `<${tag} class="game"${attrs}>
        <span class="game-img"><img src="${esc(g.thumbnail)}" alt="" loading="lazy">${g.url ? `<span class="game-play">Play ↗</span>` : ""}</span>
        <span class="game-name">${esc(g.game)}</span>
        <span class="game-role">${esc(g.role)}${g.studio ? ` · ${esc(g.studio)}` : ""}</span>
        <span class="game-nums">${g.visits ? `<b>${esc(g.visits)}</b> visits` : ""}${g.ccu ? `<span>${esc(g.ccu)} CCU</span>` : ""}</span>
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

    // mosaic: images only
    $("#grid").innerHTML = items.map((c, i) => `
      <button type="button" class="tile" data-i="${i}" aria-label="View image ${i + 1}">${swap(c)}</button>`).join("");
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
  function buyButtons(p, big) {
    const a = (url, cls, label, kind) => url
      ? `<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`
      : `<a class="btn ${cls}" href="#" data-nolink="${kind}">${label}</a>`;
    return `<div class="buy-row">${a(p.paypalUrl, "btn-primary", big ? "Buy with PayPal" : "PayPal", "paypal")}${a(p.robuxUrl, "btn-white", big ? "Buy with Robux" : "Robux", "robux")}</div>`;
  }
  const rbx = (v) => `R$ ${num(v)}`;
  function renderPacks(d) {
    const packs = d.packs || [], shop = d.shop || {};
    const feat = packs.find((p) => p.featured) || packs[0];
    const rest = packs.filter((p) => p !== feat);

    $("#featured-pack").innerHTML = feat ? `
      <article class="fx">
        <span class="fx-ring" aria-hidden="true"></span>
        <div class="fx-in">
          <div class="fx-media">
            <img src="${esc(feat.cover)}" alt="${esc(feat.title)}">
            <span class="fx-shine" aria-hidden="true"></span>
            <span class="fx-badge">${icon("sparkle")}Featured pack</span>
            ${feat.priceEur ? `<span class="fx-tag">€${esc(feat.priceEur)}</span>` : ""}
          </div>
          <div class="fx-body">
            <div class="fx-main">
              <h2 class="fx-title">${esc(feat.title)}</h2>
              <p class="feat-tag">${esc(feat.tagline)}</p>
              ${(feat.includes || []).length ? `<ul class="checks">${feat.includes.map((x) => `<li>${icon("check")}${esc(x)}</li>`).join("")}</ul>` : ""}
            </div>
            <div class="fx-buy">
              <div class="price">${feat.priceEur ? `<b>€${esc(feat.priceEur)}</b>` : ""}${feat.priceRobux ? `<span>or</span><span class="rbx">${rbx(feat.priceRobux)}</span>` : ""}</div>
              ${buyButtons(feat, true)}
              <p class="buy-note">Files are delivered right after payment.</p>
            </div>
          </div>
        </div>
      </article>` : "";
    $("#featured").hidden = !feat;

    $("#pack-grid").innerHTML = rest.map((p) => `
      <article class="card pack">
        <div class="pack-img"><img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy"></div>
        <div class="pack-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.tagline)}</p>
          <div class="pack-price">${p.priceEur ? `<b>€${esc(p.priceEur)}</b>` : "<span></span>"}${p.priceRobux ? `<span class="rbx">${rbx(p.priceRobux)}</span>` : ""}</div>
          ${buyButtons(p, false)}
        </div>
      </article>`).join("");
    $("#all-packs").hidden = !rest.length;

    $("#paypal-steps").innerHTML = (shop.paypalSteps || []).map((s) => `<li>${esc(s)}</li>`).join("");
    $("#robux-steps").innerHTML = (shop.robuxSteps || []).map((s) => `<li>${esc(s)}</li>`).join("");
    $("#faq").innerHTML = (shop.faq || []).map((f) => `<details class="card"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");
  }

  /* ---------- routing + dock ---------- */
  const DOCKS = {
    portfolio: [["home", "Home"], ["work", "Work"], ["games", "Games"], ["about", "About"], ["contact", "Contact"]],
    packs: [["featured", "Featured"], ["all-packs", "Packs"], ["buying", "Buying"], ["faq-sec", "FAQ"]],
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
    const top = id === "home" || id === "featured";
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
    $$(".sec-head, .tile, .game, .dp, .about-main, .end, .pack, .how-col, .faq details, .more, .filters", page).forEach((el, i) => {
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
