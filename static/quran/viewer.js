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

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePageSpec(spec) {
  const s = String(spec == null ? "" : spec).trim();
  if (!s) return null;
  const dash = s.indexOf("-");
  if (dash === -1) {
    const n = Number(s);
    return Number.isFinite(n) ? [n] : null;
  }
  const a = Number(s.slice(0, dash).trim());
  const b = Number(s.slice(dash + 1).trim());
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  const pages = [];
  for (let p = a; p <= b; p++) pages.push(p);
  return pages;
}

function pageSpecContains(spec, page) {
  const pages = parsePageSpec(spec);
  return pages != null && pages.includes(page);
}

function isInteractiveArea(target) {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(".control-panel, .topbar, input, select, textarea, button, a"));
}

function mergeRanges(ranges) {
  const sorted = ranges
    .filter((r) => Array.isArray(r) && Number.isFinite(r[0]) && Number.isFinite(r[1]) && r[1] > r[0])
    .slice()
    .sort((a, b) => a[0] - b[0]);
  if (!sorted.length) return [];
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = out[out.length - 1];
    const cur = sorted[i];
    if (cur[0] <= prev[1]) prev[1] = Math.max(prev[1], cur[1]);
    else out.push(cur);
  }
  return out;
}

function arabicLettersAndMap(s) {
  let letters = "";
  const map = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= "\u0621" && ch <= "\u064A") {
      letters += ch;
      map.push(i);
    }
  }
  return { letters, map };
}

function highlightedLinesToHtml(pageObj, highlightChar, ranges) {
  if (!pageObj || !highlightChar) return linesToHtml(pageObj);
  const lines = [];
  for (let i = 1; i <= 15; i++) {
    const k = `line${i}`;
    lines.push(pageObj[k] ? String(pageObj[k]) : "");
  }

  const merged = Array.isArray(ranges) ? mergeRanges(ranges) : [];
  let rangeIdx = 0;

  const out = [];
  let baseOffset = 0;
  for (const line of lines) {
    if (!line.length) {
      out.push("&nbsp;");
      baseOffset += 1;
      continue;
    }

    let s = "";
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      const pos = baseOffset + j;
      while (rangeIdx < merged.length && pos >= merged[rangeIdx][1]) rangeIdx++;
      const inRange = !merged.length || (rangeIdx < merged.length && pos >= merged[rangeIdx][0] && pos < merged[rangeIdx][1]);

      if (inRange && ch === highlightChar) {
        s += `<span style="color:#1b8f2e; font-weight:700;">${escapeHtml(ch)}</span>`;
      } else {
        s += escapeHtml(ch);
      }
    }
    out.push(s);
    baseOffset += line.length + 1;
  }
  return out.join("<br>");
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

function renderSingle(pages, page, dimColor) {
  const rightPage = byId("rightPage");
  const leftPage = byId("leftPage");
  leftPage.classList.add("hidden");

  const obj = pages[String(page)];
  byId("rightLabel").textContent = `Page ${page}`;
  byId("rightSura").textContent = obj?.sura_name_en ? String(obj.sura_name_en) : "";
  byId("rightText").innerHTML = dimColor ? linesToHtmlLongest(obj, dimColor) : linesToHtml(obj);

  rightPage.classList.remove("hidden");
}

function renderSpread(pages, page, dimColor) {
  const rightPage = byId("rightPage");
  const leftPage = byId("leftPage");
  const spread = computeSpread(page);

  const rightObj = pages[String(spread.right)];
  byId("rightLabel").textContent = `Page ${spread.right}`;
  byId("rightSura").textContent = rightObj?.sura_name_en ? String(rightObj.sura_name_en) : "";
  byId("rightText").innerHTML = dimColor ? linesToHtmlLongest(rightObj, dimColor) : linesToHtml(rightObj);
  rightPage.classList.remove("hidden");

  if (spread.left) {
    const leftObj = pages[String(spread.left)];
    byId("leftLabel").textContent = `Page ${spread.left}`;
    byId("leftSura").textContent = leftObj?.sura_name_en ? String(leftObj.sura_name_en) : "";
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
  const drawBtn = document.getElementById("drawBtn");
  const chartContainer = document.getElementById("chartContainer");
  const dimRange = document.getElementById("dimRange");
  const dimValue = document.getElementById("dimValue");

  let warshDataCache = null;
  async function loadWarshData() {
    if (warshDataCache) return warshDataCache;
    const res = await fetch("./inputdata/warshData_v2-1.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load warshData_v2-1.json (${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid warshData_v2-1.json structure (expected array)");
    warshDataCache = data;
    return warshDataCache;
  }

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

  let rangeSyncPage = null;
  let currentRange = null;

  function idsForPage(data, page) {
    const ids = [];
    for (const o of data) {
      if (!pageSpecContains(o?.page, page)) continue;
      const id = Number(o?.id);
      if (Number.isFinite(id)) ids.push(id);
    }
    if (!ids.length) return null;
    ids.sort((a, b) => a - b);
    return [ids[0], ids[ids.length - 1]];
  }

  async function syncRangeToPage(page) {
    rangeSyncPage = page;
    try {
      const data = await loadWarshData();
      if (rangeSyncPage !== page) return;
      const range = idsForPage(data, page);
      currentRange = range ? { lo: range[0], hi: range[1] } : null;
    } catch {
      // keep previous range if data can't be loaded
    }
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
      const fs = next.fs != null ? clampFontSizePx(next.fs) : getStoredFontSize();
      fontSize.value = String(fs);
      fontSizeValue.textContent = `${fs}px`;
      setMushafFontSize(fs);

      if (dimRange) dimRange.value = String(clampDimLevel(dimLevel));
      if (dimValue) dimValue.textContent = `${clampDimLevel(dimLevel)}%`;

      if (normalizedPage !== rangeSyncPage) syncRangeToPage(normalizedPage);
    } else {
      document.body.classList.remove("memorize-mode");
      fontSizeWrap.classList.remove("visible");
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

  if (drawBtn && chartContainer) {
    drawBtn.addEventListener("click", async () => {
      if (!currentRange) {
        chartContainer.innerHTML = `<div style="direction:ltr;">No range loaded for the current page.</div>`;
        return;
      }

      const lo = currentRange.lo;
      const hi = currentRange.hi;

      chartContainer.innerHTML = `<div style="direction:ltr;">Loading…</div>`;
      let data;
      try {
        data = await loadWarshData();
      } catch (e) {
        chartContainer.innerHTML = `<div style="direction:ltr;">${escapeHtml(String(e))}</div>`;
        return;
      }

      const cur = getState();
      const curMode = cur.mode === "spread" ? "spread" : cur.mode === "memorize" ? "memorize" : "single";
      const curPage = normalizePageForMode(curMode, clampPage(cur.page));

      let combined = "";
      const ayasInRange = [];
      const ayasOnCurrentPage = [];
      const pagesTouched = new Set();
      for (const o of data) {
        const id = Number(o?.id);
        if (!Number.isFinite(id) || id < lo || id > hi) continue;
        if (o && o.aya_text != null) {
          const t = String(o.aya_text);
          combined += t;
          ayasInRange.push(t);
          const specPages = parsePageSpec(o?.page);
          if (specPages) for (const p of specPages) pagesTouched.add(p);
          if (pageSpecContains(o?.page, curPage)) ayasOnCurrentPage.push(t);
        }
      }

      const cleaned = combined.replace(/[^\u0621-\u064A]/g, "").replace(/[ءآأؤإئاى]/g, "");

      const counts = new Map();
      for (const ch of cleaned) counts.set(ch, (counts.get(ch) || 0) + 1);

      if (!counts.size) {
        chartContainer.innerHTML = `<div style="direction:ltr;">No letters found for id range ${lo}..${hi} after filters.</div>`;
        return;
      }

      let max = 0;
      for (const v of counts.values()) if (v > max) max = v;

      const rows = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
      const total = cleaned.length;
      const topChar = rows[0]?.[0] ? String(rows[0][0]) : "";

      const parts = [];
      const touched = Array.from(pagesTouched).sort((a, b) => a - b);
      const touchedNote = touched.length ? ` — Pages: ${touched.join(", ")}` : "";
      const onPageNote = ayasOnCurrentPage.length ? "" : ` — none on current page ${curPage}`;
      parts.push(
        `<div style="direction:ltr; font-size:12px; color:#333; margin-bottom:10px;">Range ${lo}..${hi} — Total letters: ${total}${touchedNote}${onPageNote}</div>`
      );

      for (const [ch, n] of rows) {
        const pct = (n / max) * 100;
        const pctText = (Math.round(pct * 10) / 10).toFixed(1);
        parts.push(
          `<div style="direction:ltr; display:flex; align-items:center; gap:10px; margin:6px 0;">` +
            `<div style="width:26px; text-align:center; font-family:arab;">${escapeHtml(String(ch))}</div>` +
            `<div style="width:46px; text-align:right; font-variant-numeric: tabular-nums;">${n}</div>` +
            `<div style="flex:1 1 auto; height:12px; background:#e6e6e6; border-radius:8px; overflow:hidden;">` +
              `<div style="height:100%; width:${pctText}%; background:#4a90e2;"></div>` +
            `</div>` +
          `</div>`
        );
      }

      chartContainer.innerHTML = parts.join("");
      const pageObj = pages[String(curPage)];
      if (!pageObj || !topChar) return;
      if (!ayasOnCurrentPage.length) return;

      const lines = [];
      for (let i = 1; i <= 15; i++) lines.push(pageObj[`line${i}`] ? String(pageObj[`line${i}`]) : "");
      const pageText = lines.join("\n");
      const pageLM = arabicLettersAndMap(pageText);
      const ranges = [];
      let from = 0;
      for (const ayaText of ayasOnCurrentPage) {
        const ayaLetters = String(ayaText).replace(/[^\u0621-\u064A]/g, "");
        if (!ayaLetters) continue;
        const idx = pageLM.letters.indexOf(ayaLetters, from);
        if (idx === -1) continue;
        const start = pageLM.map[idx];
        const end = pageLM.map[idx + ayaLetters.length - 1] + 1;
        ranges.push([start, end]);
        from = idx + ayaLetters.length;
      }

      const merged = mergeRanges(ranges);
      if (!merged.length) return;
      byId("rightText").innerHTML = highlightedLinesToHtml(pageObj, topChar, merged);
    });
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
