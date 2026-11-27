#!/usr/bin/env python3
"""
Génère le tafsir d'une sourate (versets Hafs en gras, explication en noir,
notes de bas de page inline en gris) sous deux formats :
  - .docx  (importable dans Google Docs — source de vérité)
  - .html  (14 pt, Noto Naskh Arabic, autonome, consultable navigateur)

Sources :
  - quran_hafs_alignedwithTafseer.json  → versets Hafs (par sourate/ayah)
  - vol4MTN.rtf                          → texte du tafseer (explication + notes)

Usage :
  python3 scripts/generate-tafsir.py [--surah 114] [--out output/tafsir]

Le Google Doc généré depuis le .docx est la source de vérité : corriger le
Google Doc, puis relancer ce script (ou ré-exporter) pour régénérer l'HTML.
"""
import argparse
import json
import re
from pathlib import Path

# ─── Chemins par défaut ────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_JSON = ROOT / "input" / "forcastedcourses" / "qurandb" / "tafseerinput" / "quran_hafs_alignedwithTafseer.json"
DEFAULT_RTF = ROOT / "input" / "forcastedcourses" / "qurandb" / "tafseerinput" / "vol4MTN.rtf"
DEFAULT_OUT = ROOT / "output" / "tafsir"
R2_BUCKET = 'geberlms-files'

# ─── Normalisation des chiffres (arabes / persans → latins) ─────────────────
DIGIT_TRANS = str.maketrans({
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
})

def norm_digits(s: str) -> str:
    return s.translate(DIGIT_TRANS)


def normalize_verse(s: str) -> str:
    """Normalisation agressive pour faire correspondre le texte de verset du RTF
    (orthographe courante, alef explicite) au texte Hafs du JSON (orthographe du
    moushaf de Médine : alef suscrit ٰ, petit waw/ya ۥ/ۦ).

    Supprime tous les alefs et hamza, unifie ya/waw : les seules lettres restantes
    sont les consonnes « réelles », ce qui absorbe les écarts orthographiques
    (ex. منٰفقون vs منافقون).
    """
    import unicodedata
    out = []
    for c in s:
        if unicodedata.category(c) in ('Mn', 'Me') or c == '\u0640':
            continue  # diacritiques, tatweel, alef suscrit (ٰ)
        if c in 'أإآٱا':
            continue  # toutes les formes d'alef
        if c in 'ىي':
            out.append('ي')
        elif c == 'و':
            out.append('و')
        elif c in 'ءئؤ':
            continue  # hamza (isolée ou sur siège ya/waw)
        elif c in 'ۥۦ':
            continue  # petit waw/ya
        else:
            out.append(c)
    return ''.join(out).replace(' ', '')

# Motifs de bruit à retirer
PAGE_NUMBER = re.compile(r'^\s*\d+\s*$')                 # numéro de page isolé
BASMALA = re.compile(r'^[\s\S]*?بِ?sْمِ?\s*اللهِ?\s*الرَّحْمَ?نِ?\s*الرَّحِيمِ?\s*$')
FOOTNOTE_START = re.compile(r'^[.\s]*\(?(\d+)\)\s*(.*)$')
INLINE_NOTE = re.compile(r'\((\d+)\)')

def is_page_number(line: str) -> bool:
    t = norm_digits(line).strip()
    if not t:
        return False
    # "1014", "۱۰۱۳", "01.1٥" (garbage OCR)
    return bool(re.fullmatch(r'\d+', t)) or bool(re.fullmatch(r'\d+[.]\d+[٠-٩۰-۹]?', t))

def is_basmala(line: str) -> bool:
    t = line.strip()
    return 'بسم الله' in t or 'سم الله' in t


def header_probe(line: str) -> str:
    """Normalise une ligne pour détecter les en-têtes de sourate : retire
    l'honorifique ﷺ (U+FDFA) et le marqueur OCR « (n) » final."""
    t = line.replace('\ufdfa', '').strip()
    t = re.sub(r'\([^)]*\)$', '', t).strip()
    return t


# ─── Extraction des sourates depuis le RTF ────────────────────────────────
def find_surah_starts(rtf_text: str) -> list[tuple[int, int]]:
    """Retourne [(index_ligne, numéro_sourate)] pour les sourates 36..114 du RTF.

    Le RTF contient les sourates 36 (يس) à 114 (الناس), en ordre. Le repère
    fiable de début de sourate est la ligne « سورة <nom> » (nom seul, sans
    plage de versets). Les en-têtes « سورة <nom> X-Y » (plage de versets) sont
    des en-têtes de page, pas des débuts de sourate.
    """
    lines = rtf_text.splitlines()
    idx_index = next((i for i, l in enumerate(lines) if 'الفهرس العام' in l), len(lines))
    starts = []
    for i in range(idx_index):
        l = lines[i].strip()
        if not l.startswith('سورة '):
            continue
        rest = l[len('سورة '):].strip()
        rest = re.sub(r'\([^)]*\)$', '', rest).strip()  # bruit OCR « (۱) »
        if re.search(r'[0-9٠-٩۰-۹]', rest):
            continue  # en-tête de page « سورة X ١-٥ »
        if any(c in rest for c in '،]'):
            continue  # faux positif (référence de verset dans le texte)
        if 'فقال' in rest:
            continue  # faux positif
        if not rest:
            continue
        starts.append((i, rest))
    # Dédupliquer les doublons OCR consécutifs (ex. « سورة الممتحنة » x2)
    dedup = []
    for i, name in starts:
        if dedup and dedup[-1][1] == name:
            continue
        dedup.append((i, name))
    expected = 114 - 36 + 1  # 79 sourates
    if len(dedup) != expected:
        raise SystemExit(
            f"Attendu {expected} sourates (36..114), trouvé {len(dedup)}. "
            f"Vérifier les en-têtes du RTF."
        )
    return [(i, 36 + idx) for idx, (i, _) in enumerate(dedup)]


def extract_blocks(rtf_text: str) -> dict[int, list[str]]:
    """Retourne {numéro_sourate: lignes_du_bloc} pour les sourates 36..114."""
    lines = rtf_text.splitlines()
    idx_index = next((i for i, l in enumerate(lines) if 'الفهرس العام' in l), len(lines))
    starts = find_surah_starts(rtf_text)
    blocks = {}
    for k, (line_idx, surah_no) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else idx_index
        blocks[surah_no] = lines[line_idx:end]
    return blocks


# ─── Parsing du bloc en (explication, notes) ───────────────────────────────
def _strip_verse_block(body: list[str], verse_concat: str) -> list[str]:
    """Retire le bloc de verset en tête du corps (concaténation des ayat de la
    page, éventuellement coupée sur plusieurs lignes), en le comparant au texte
    Hafs complet normalisé. S'arrête à la première ligne qui n'est plus du verset.
    """
    acc = ''
    matched = 0
    for line in body:
        candidate = acc + normalize_verse(line)
        if candidate in verse_concat:
            acc = candidate
            matched += 1
        else:
            break
    return body[matched:]


def parse_block(block: list[str], verses: list[str]) -> list[str]:
    """
    Découpe le bloc en sections (pages). Retourne les paragraphes d'explication
    (notes de bas de page résolues inline) ; le texte de verset du RTF (doublon
    des versets Hafs) est ignoré.
    """
    verse_concat = ''.join(normalize_verse(v) for v in verses)

    # Découpe en sections sur les en-têtes « سورة <nom> X-Y »
    sections: list[list[str]] = []
    current: list[str] = []
    for line in block:
        if re.search(r'^سورة\s+\S+\s*\d', header_probe(line)) and len(current) > 0:
            sections.append(current)
            current = []
        current.append(line)
    if current:
        sections.append(current)

    output_lines: list[str] = []

    for section in sections:
        # Première basmala : sépare la méta de sourate (avant) du verset et de
        # l'explication (après). Les pages de continuation n'ont pas de basmala.
        first_basmala = next(
            (i for i, l in enumerate(section) if is_basmala(l.strip())), None
        )
        body: list[str] = []
        for i, line in enumerate(section):
            t = line.strip()
            if not t:
                continue
            if is_page_number(t) or t.startswith('المجلد') or is_basmala(t):
                continue
            if re.match(r'^سورة\s+\S+\s*\d', header_probe(t)):
                continue  # en-tête de section
            if re.match(r'^سورة\s+\S+$', header_probe(t)):
                continue  # nom seul
            if re.fullmatch(r'-?\s*[0-9٠-٩۰-۹]+', norm_digits(t)):
                continue  # numéro d'ayah isolé « -٣ » / « ٤ »
            # méta de la sourate (nom alternatif, type, nombre d'ayat) : avant la basmala
            if first_basmala is not None and i < first_basmala:
                continue
            body.append(t)

        # Retirer le bloc de verset en tête (doublon du texte Hafs)
        body = _strip_verse_block(body, verse_concat)

        # Trouver le bloc de notes : première ligne commençant par (n)
        note_start = None
        for i, t in enumerate(body):
            if FOOTNOTE_START.match(norm_digits(t)):
                note_start = i
                break

        explanation = body if note_start is None else body[:note_start]
        notes_block = [] if note_start is None else body[note_start:]

        notes: dict[str, str] = {}
        cur_key = None
        for t in notes_block:
            m = FOOTNOTE_START.match(norm_digits(t))
            if m:
                cur_key = m.group(1)
                notes[cur_key] = m.group(2).strip()
            elif cur_key is not None:
                notes[cur_key] = (notes[cur_key] + ' ' + t.strip()).strip()
        # nettoie les artefacts OCR : « .  » → « . » et parenthèses parasites
        for k in notes:
            notes[k] = re.sub(r'\s+\.', '.', notes[k])
            notes[k] = notes[k].rstrip('(').strip()

        for para in explanation:
            out = norm_digits(para)
            def repl(m):
                k = m.group(1)
                return f'({notes[k]})' if k in notes else m.group(0)
            out = INLINE_NOTE.sub(repl, out)
            output_lines.append(out)

    return output_lines


# ─── Génération HTML ───────────────────────────────────────────────────────
def render_html(surah, paragraphs: list[str]) -> str:
    name_ar = surah['name']
    name_en = surah['transliteration']
    verses = surah['verses']
    verses_html = '\n'.join(
        f'<p class="verse"><span class="num">{i + 1}.</span> {v["text"]}</p>'
        for i, v in enumerate(verses)
    )
    paras_html = '\n'.join(_wrap_notes_html(p) for p in paragraphs)

    return f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{name_ar} — {name_en} — Tafsir</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet" />
<style>
  :root {{
    --ink: #1a1a1a;
    --gray: #6b7280;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    background: #fbfaf7;
    color: var(--ink);
    font-family: 'Noto Naskh Arabic', serif;
    font-size: 14pt;
    line-height: 2;
  }}
  main {{ max-width: 46rem; margin: 0 auto; padding: 2rem 1.5rem 4rem; }}
  h1 {{ font-size: 1.9rem; text-align: center; margin: 0 0 .25rem; }}
  .sub {{ text-align: center; color: var(--gray); margin: 0 0 2rem; }}
  .verses {{
    border: 1px solid #e5e0d4;
    background: #fff;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 2rem;
  }}
  .verse {{ font-weight: 700; font-size: 1.25rem; margin: .4rem 0; line-height: 1.9; }}
  .verse .num {{ color: var(--gray); font-size: .8rem; margin-left: .5rem; }}
  .t {{ margin: .6rem 0; text-align: justify; }}
  .note {{ color: var(--gray); }}
</style>
</head>
<body>
<main>
  <h1>سورة {name_ar}</h1>
  <p class="sub">{name_en} — {surah['total_verses']} آيات</p>
  <section class="verses">
{verses_html}
  </section>
  <section class="tafseer">
{paras_html}
  </section>
</main>
</body>
</html>
"""


def _wrap_notes_html(para: str) -> str:
    """Entoure les notes (…) d'un <span class=\"note\"> (gris)."""
    parts = re.split(r'(\([^()]*\))', para)
    out = []
    for part in parts:
        if not part:
            continue
        if part.startswith('(') and part.endswith(')'):
            out.append(f'<span class="note">{part}</span>')
        else:
            out.append(part)
    body = ''.join(out)
    return f'<p class="t">{body}</p>'


# ─── Génération DOCX ───────────────────────────────────────────────────────
def render_docx(surah, paragraphs: list[str], out_path: Path) -> None:
    from docx import Document
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    doc = Document()
    # style de base 14pt
    style = doc.styles['Normal']
    style.font.name = 'Noto Naskh Arabic'
    style.font.size = Pt(14)
    style.element.rPr.rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}cs', 'Noto Naskh Arabic')

    name_ar = surah['name']
    name_en = surah['transliteration']
    verses = surah['verses']

    h = doc.add_heading(f'سورة {name_ar}', level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub = doc.add_paragraph(f'{name_en} — {surah["total_verses"]} آيات')
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER

    for i, v in enumerate(verses):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        run = p.add_run(f'{i + 1}. {v["text"]}')
        run.bold = True
        _set_arabic(run)

    for para in paragraphs:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        _add_para_with_notes(p, para)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(out_path)


def _set_arabic(run):
    run.font.name = 'Noto Naskh Arabic'
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts')
    if rFonts is None:
        rFonts = rPr.makeelement('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rFonts', {})
        rPr.append(rFonts)
    rFonts.set('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}cs', 'Noto Naskh Arabic')


def _add_para_with_notes(p, text: str):
    """Découpe un paragraphe en runs : texte noir + notes (…) en gris."""
    from docx.shared import Pt, RGBColor
    GRAY = RGBColor(0x6b, 0x72, 0x80)
    parts = re.split(r'(\([^()]*\))', text)
    for part in parts:
        if not part:
            continue
        run = p.add_run(part)
        _set_arabic(run)
        if part.startswith('(') and part.endswith(')'):
            run.font.color.rgb = GRAY


# ─── Main ───────────────────────────────────────────────────────────
def _upload_html(out_html: Path, surah_no: int, remote: bool) -> None:
    import subprocess
    key = f'quran/tafseer/{surah_no}.html'
    cmd = ['npx', 'wrangler', 'r2', 'object', 'put', f'{R2_BUCKET}/{key}', '--file', str(out_html)]
    cmd.append('--remote' if remote else '--local')
    subprocess.run(cmd, check=True)
    print(f'  HTML uploadé vers R2 : {key}')


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--surah', type=int, default=None,
                    help='numéro de sourate unique (36..114)')
    ap.add_argument('--all', action='store_true',
                    help='traiter toutes les sourates du RTF (36..114)')
    ap.add_argument('--list', action='store_true',
                    help='lister les sourates détectées et quitter')
    ap.add_argument('--json', type=Path, default=DEFAULT_JSON)
    ap.add_argument('--rtf', type=Path, default=DEFAULT_RTF)
    ap.add_argument('--out', type=Path, default=DEFAULT_OUT)
    ap.add_argument('--upload', action='store_true', help='uploader le HTML vers R2 (bucket geberlms-files)')
    ap.add_argument('--remote', action='store_true', help='uploader vers R2 distant (sinon local)')
    args = ap.parse_args()

    data = json.loads(args.json.read_text(encoding='utf-8'))
    by_no = {s['id']: s for s in data}
    rtf_text = args.rtf.read_text(encoding='utf-8')

    if args.list:
        for line_idx, no in find_surah_starts(rtf_text):
            print(f'{no}\t{by_no[no]["name"]}\t(ligne {line_idx + 1})')
        return

    blocks = extract_blocks(rtf_text)
    available = sorted(blocks)

    if args.all:
        targets = available
    elif args.surah is not None:
        targets = [args.surah]
    else:
        ap.error('fournir --surah N ou --all')

    for no in targets:
        if no not in blocks:
            raise SystemExit(f"Sourate {no} absente du RTF (disponibles : {available[0]}..{available[-1]}).")
        surah = by_no[no]
        verses = [v['text'] for v in surah['verses']]
        paragraphs = parse_block(blocks[no], verses)

        html = render_html(surah, paragraphs)
        out_html = args.out / f'{no}.html'
        out_html.parent.mkdir(parents=True, exist_ok=True)
        out_html.write_text(html, encoding='utf-8')

        out_docx = args.out / f'{no}.docx'
        render_docx(surah, paragraphs, out_docx)

        print(f"Sourate {no} ({surah['name']}) : {len(paragraphs)} paragraphes")
        print(f'  HTML : {out_html}')
        print(f'  DOCX : {out_docx}')

        if args.upload:
            _upload_html(out_html, no, args.remote)


if __name__ == '__main__':
    main()
