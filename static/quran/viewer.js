const DEFAULT_DATA_URL = "out604/pages.json";
const MAX_PAGE = 604;

function clampPage(p) {
  if (!Number.isFinite(p)) return 1;
  return Math.max(1, Math.min(MAX_PAGE, Math.trunc(p)));
}

function clampFontSizePx(n) {
  if (!Number.isFinite(n)) return 28;
  return Math.max(16, Math.min(60, Math.trunc(n)));
}

const DIM_DEFAULT = 30;

function clampDimLevel(n) {
  if (!Number.isFinite(n)) return DIM_DEFAULT;
  return Math.max(0, Math.min(100, Math.trunc(n)));
}

function dimLevelToColor(level) {
  const v = Math.round(255 * (1 - clampDimLevel(level) / 100));
  return `rgb(${v}, ${v}, ${v})`;
}

function getStoredDimLevel() {
  try {
    const v = localStorage.getItem("mushafDimLevel");
    return v == null ? DIM_DEFAULT : clampDimLevel(Number(v));
  } catch {
    return DIM_DEFAULT;
  }
}

function setStoredDimLevel(level) {
  try {
    localStorage.setItem("mushafDimLevel", String(clampDimLevel(level)));
  } catch {}
}

function parseHash() {
  const raw = (location.hash || "").replace(/^#/, "");
  const qs = new URLSearchParams(raw);
  const page = clampPage(Number(qs.get("p") || "1"));
  const modeRaw = qs.get("mode");
  const mode = modeRaw === "spread" ? "spread" : modeRaw === "memorize" ? "memorize" : "single";
  const fs = qs.has("fs") ? clampFontSizePx(Number(qs.get("fs"))) : null;
  const dim = qs.has("d") ? clampDimLevel(Number(qs.get("d"))) : null;
  return { page, mode, fs, dim };
}

function setHash(state) {
  const qs = new URLSearchParams();
  qs.set("p", String(state.page));
  qs.set("mode", state.mode);
  if (state.mode === "memorize" && state.fs != null) qs.set("fs", String(clampFontSizePx(state.fs)));
  if (state.mode === "memorize" && state.dim != null) qs.set("d", String(clampDimLevel(state.dim)));
  const next = `#${qs.toString()}`;
  if (location.hash !== next) location.hash = next;
}

function getDataUrl() {
  const qs = new URLSearchParams(location.search);
  return qs.get("data") || DEFAULT_DATA_URL;
}

function linesToHtml(pageObj) {
  if (!pageObj) return "";
  const out = [];
  for (let i = 1; i <= 15; i++) {
    const k = `line${i}`;
    const t = pageObj[k] ? String(pageObj[k]) : "";
    out.push(t.length ? escapeHtml(t) : "&nbsp;");
  }
  return out.join("<br>");
}

function arabicLetterCount(s) {
  const m = s.match(/[\u0621-\u064A]/g);
  return m ? m.length : 0;
}

function tokenizeLine(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    while (i < line.length && /\s/.test(line[i])) i++;
    if (i >= line.length) break;
    const start = i;
    while (i < line.length && !/\s/.test(line[i])) i++;
    const end = i;
    tokens.push({ start, end, letters: arabicLetterCount(line.slice(start, end)) });
  }
  return tokens;
}

function lineToHtmlLongest(line, dimColor) {
  if (!line.length) return "&nbsp;";
  const tokens = tokenizeLine(line);
  const strong = new Set(
    tokens
      .map((t, idx) => ({ idx, letters: t.letters }))
      .filter((t) => t.letters > 0)
      .sort((a, b) => b.letters - a.letters || a.idx - b.idx)
      .slice(0, 3)
      .map((t) => t.idx)
  );
  let out = "";
  let pos = 0;
  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];
    out += escapeHtml(line.slice(pos, t.start));
    const color = strong.has(idx) ? "#000" : dimColor;
    const cls = strong.has(idx) ? "" : ' class="w-dim"';
    out += `<span${cls} style="color:${color}">${escapeHtml(line.slice(t.start, t.end))}</span>`;
    pos = t.end;
  }
  out += escapeHtml(line.slice(pos));
  return out;
}

function linesToHtmlLongest(pageObj, dimColor) {
  if (!pageObj) return "";
  const out = [];
  for (let k = 1; k <= 15; k++) {
    const t = pageObj[`line${k}`] ? String(pageObj[`line${k}`]) : "";
    out.push(lineToHtmlLongest(t, dimColor));
  }
  return out.join("<br>");
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isInteractiveArea(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(".control-panel, .topbar, input, select, textarea, button, a"));
}

function computeSpread(page) {
  const right = page % 2 === 1 ? page : page - 1;
  const left = right + 1;
  return {
    right: clampPage(right),
    left: left <= MAX_PAGE ? left : null,
  };
}

async function loadBundle() {
  const url = getDataUrl();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  const data = await res.json();
  if (!data || !data.pages) throw new Error("Invalid pages.json structure");
  return { pages: data.pages, suras: data.suras || {} };
}

function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element ${id}`);
  return el;
}

function surahLabel(obj) {
  const name = obj?.sura_name_en ? String(obj.sura_name_en) : "";
  const no = obj?.sura_no ? Number(obj.sura_no) : null;
  const link = no === 114
    ? ` <a href="/quran/tafseer/${no}" title="Tafseer" style="color:#1a0dab;">Tafsir</a>`
    : "";
  return escapeHtml(name) + link;
}

function renderSingle(pages, page, dimColor) {
  const rightPage = byId("rightPage");
  const leftPage = byId("leftPage");
  const sideSpacer = byId("sideSpacer");
  leftPage.classList.add("hidden");

  const obj = pages[String(page)];
  byId("rightLabel").textContent = `Page ${page}`;
  byId("rightSura").innerHTML = surahLabel(obj);
  byId("rightText").innerHTML = dimColor ? linesToHtmlLongest(obj, dimColor) : linesToHtml(obj);

  rightPage.classList.remove("hidden");

  // Indicateur droite/gauche : bloc de 2 cm du côté opposé (comme en spread).
  const isRight = page % 2 === 1; // impaire = page de droite
  sideSpacer.classList.remove("hidden");
  sideSpacer.style.order = isRight ? "2" : "-1";
}

function renderSpread(pages, page, dimColor) {
  const rightPage = byId("rightPage");
  const leftPage = byId("leftPage");
  const sideSpacer = byId("sideSpacer");
  sideSpacer.classList.add("hidden");
  const spread = computeSpread(page);

  const rightObj = pages[String(spread.right)];
  byId("rightLabel").textContent = `Page ${spread.right}`;
  byId("rightSura").innerHTML = surahLabel(rightObj);
  byId("rightText").innerHTML = dimColor ? linesToHtmlLongest(rightObj, dimColor) : linesToHtml(rightObj);
  rightPage.classList.remove("hidden");

  if (spread.left) {
    const leftObj = pages[String(spread.left)];
    byId("leftLabel").textContent = `Page ${spread.left}`;
    byId("leftSura").innerHTML = surahLabel(leftObj);
    byId("leftText").innerHTML = dimColor ? linesToHtmlLongest(leftObj, dimColor) : linesToHtml(leftObj);
    leftPage.classList.remove("hidden");
  } else {
    leftPage.classList.add("hidden");
  }
}

function stepForMode(mode) {
  return mode === "spread" ? 2 : 1;
}

function normalizePageForMode(mode, page) {
  if (mode !== "spread") return page;
  const spread = computeSpread(page);
  return spread.right;
}

function getStoredFontSize() {
  try {
    const v = localStorage.getItem("mushafFontSizePx");
    if (!v) return 28;
    return clampFontSizePx(Number(v));
  } catch {
    return 28;
  }
}

function setStoredFontSize(px) {
  try {
    localStorage.setItem("mushafFontSizePx", String(clampFontSizePx(px)));
  } catch {}
}

function setMushafFontSize(px) {
  const size = clampFontSizePx(px);
  const els = document.querySelectorAll(".mushaf");
  for (const el of els) el.style.fontSize = `${size}px`;
}

async function main() {
  const status = byId("status");
  const prevBtn = byId("prevBtn");
  const nextBtn = byId("nextBtn");
  const pageInput = byId("pageInput");
  const modeSelect = byId("modeSelect");
  const prevSuraBtn = byId("prevSuraBtn");
  const nextSuraBtn = byId("nextSuraBtn");
  const suraSelect = byId("suraSelect");
  const fontSizeWrap = byId("fontSizeWrap");
  const fontSize = byId("fontSize");
  const fontSizeValue = byId("fontSizeValue");
  const dimWrap = byId("dimWrap");
  const dimRange = document.getElementById("dimRange");
  const dimValue = document.getElementById("dimValue");

  let pages;
  let suras;
  let suraList = [];
  try {
    status.textContent = "Loading…";
    const bundle = await loadBundle();
    pages = bundle.pages;
    suras = bundle.suras;
    suraList = Object.values(suras)
      .map((s) => ({
        sura_no: Number(s.sura_no),
        sura_name_en: s.sura_name_en ? String(s.sura_name_en) : "",
        sura_name_ar: s.sura_name_ar ? String(s.sura_name_ar) : "",
        start_page: clampPage(Number(s.start_page)),
      }))
      .filter((s) => Number.isFinite(s.sura_no) && Number.isFinite(s.start_page))
      .sort((a, b) => a.sura_no - b.sura_no);
    suraSelect.innerHTML = "";
    for (const s of suraList) {
      const opt = document.createElement("option");
      opt.value = String(s.sura_no);
      const label = `${s.sura_no} ${s.sura_name_en} — ${s.sura_name_ar}`.trim();
      opt.textContent = label;
      suraSelect.appendChild(opt);
    }
    status.textContent = "";
  } catch (e) {
    status.textContent = String(e);
    return;
  }

  function currentSuraNoForPage(page) {
    if (!suraList.length) return null;
    let cur = suraList[0];
    for (const s of suraList) {
      if (s.start_page <= page) cur = s;
      else break;
    }
    return cur.sura_no;
  }

  function suraByNo(suraNo) {
    for (const s of suraList) if (s.sura_no === suraNo) return s;
    return null;
  }

  function applyState(next) {
    const page = clampPage(next.page);
    const mode = next.mode === "spread" ? "spread" : next.mode === "memorize" ? "memorize" : "single";
    const normalizedPage = normalizePageForMode(mode, page);
    pageInput.value = String(normalizedPage);
    modeSelect.value = mode;

    const dimLevel = mode === "memorize"
      ? (next.dim != null ? clampDimLevel(next.dim) : getStoredDimLevel())
      : DIM_DEFAULT;
    const dimColor = mode === "memorize" ? dimLevelToColor(dimLevel) : null;

    if (mode === "spread") renderSpread(pages, normalizedPage, dimColor);
    else renderSingle(pages, normalizedPage, dimColor);

    const suraNo = currentSuraNoForPage(normalizedPage);
    if (suraNo != null) suraSelect.value = String(suraNo);

    if (mode === "memorize") {
      document.body.classList.add("memorize-mode");
      fontSizeWrap.classList.add("visible");
      dimWrap.classList.add("visible");
      const fs = next.fs != null ? clampFontSizePx(next.fs) : getStoredFontSize();
      fontSize.value = String(fs);
      fontSizeValue.textContent = `${fs}px`;
      setMushafFontSize(fs);

      if (dimRange) dimRange.value = String(clampDimLevel(dimLevel));
      if (dimValue) dimValue.textContent = `${clampDimLevel(dimLevel)}%`;

    } else {
      document.body.classList.remove("memorize-mode");
      fontSizeWrap.classList.remove("visible");
      dimWrap.classList.remove("visible");
      fontSizeValue.textContent = "";
      if (dimValue) dimValue.textContent = "";
      for (const el of document.querySelectorAll(".mushaf")) el.style.removeProperty("font-size");
    }
  }

  function getState() {
    return parseHash();
  }

  function update(partial) {
    const cur = getState();
    const next = { ...cur, ...partial };
    next.page = normalizePageForMode(next.mode, clampPage(next.page));
    if (next.mode !== "memorize") { next.fs = null; next.dim = null; }
    setHash(next);
  }

  window.addEventListener("hashchange", () => {
    applyState(getState());
  });

  prevBtn.addEventListener("click", () => {
    const cur = getState();
    const step = stepForMode(cur.mode);
    update({ page: cur.page - step });
  });

  nextBtn.addEventListener("click", () => {
    const cur = getState();
    const step = stepForMode(cur.mode);
    update({ page: cur.page + step });
  });

  modeSelect.addEventListener("change", () => {
    const cur = getState();
    const nextMode = modeSelect.value;
    const fs = nextMode === "memorize" ? getStoredFontSize() : null;
    const dim = nextMode === "memorize" ? getStoredDimLevel() : null;
    update({ mode: nextMode, page: cur.page, fs, dim });
  });

  fontSize.addEventListener("input", () => {
    const cur = getState();
    const fs = clampFontSizePx(Number(fontSize.value));
    fontSizeValue.textContent = `${fs}px`;
    setStoredFontSize(fs);
    setMushafFontSize(fs);
    if (cur.mode === "memorize") {
      const dim = dimRange ? clampDimLevel(Number(dimRange.value)) : getStoredDimLevel();
      setHash({ page: cur.page, mode: cur.mode, fs, dim });
    }
  });

  if (dimRange) {
    dimRange.addEventListener("input", () => {
      const cur = getState();
      const level = clampDimLevel(Number(dimRange.value));
      if (dimValue) dimValue.textContent = `${level}%`;
      setStoredDimLevel(level);
      const color = dimLevelToColor(level);
      for (const el of document.querySelectorAll(".mushaf .w-dim")) el.style.color = color;
      if (cur.mode === "memorize") {
        setHash({ page: cur.page, mode: cur.mode, fs: clampFontSizePx(Number(fontSize.value)), dim: level });
      }
    });
  }

  suraSelect.addEventListener("change", () => {
    const cur = getState();
    const s = suraByNo(Number(suraSelect.value));
    if (!s) return;
    update({ page: s.start_page, mode: cur.mode });
  });

  prevSuraBtn.addEventListener("click", () => {
    const cur = getState();
    const page = normalizePageForMode(cur.mode, clampPage(cur.page));
    const suraNo = currentSuraNoForPage(page);
    if (suraNo == null) return;
    const prev = suraByNo(suraNo - 1);
    if (!prev) return;
    update({ page: prev.start_page, mode: cur.mode });
  });

  nextSuraBtn.addEventListener("click", () => {
    const cur = getState();
    const page = normalizePageForMode(cur.mode, clampPage(cur.page));
    const suraNo = currentSuraNoForPage(page);
    if (suraNo == null) return;
    const nextS = suraByNo(suraNo + 1);
    if (!nextS) return;
    update({ page: nextS.start_page, mode: cur.mode });
  });

  pageInput.addEventListener("change", () => {
    const cur = getState();
    update({ page: Number(pageInput.value || "1"), mode: cur.mode });
  });

  document.addEventListener("keydown", (ev) => {
    const t = ev.target;
    const tag = t && t.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    const cur = getState();
    const step = stepForMode(cur.mode);
    if (ev.key === "ArrowLeft" || ev.key === "PageDown") {
      update({ page: cur.page + step });
      ev.preventDefault();
    } else if (ev.key === "ArrowRight" || ev.key === "PageUp") {
      update({ page: cur.page - step });
      ev.preventDefault();
    }
  });

  let downX = null;
  document.addEventListener("pointerdown", (ev) => {
    downX = isInteractiveArea(ev.target) ? null : ev.clientX;
  });
  document.addEventListener("pointerup", (ev) => {
    if (downX == null) return;
    const dx = ev.clientX - downX;
    downX = null;
    if (Math.abs(dx) < 40) return;
    const cur = getState();
    const step = stepForMode(cur.mode);
    if (dx < 0) update({ page: cur.page + step });
    else update({ page: cur.page - step });
  });

  if (!location.hash) setHash({ page: 1, mode: "single" });
  applyState(getState());
}

main();
