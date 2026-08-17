#!/usr/bin/env python3
"""
Render a .pptx to PNGs with Pillow, using the real brand fonts.

LibreOffice is unavailable in this environment, so this stands in for it well
enough to judge composition: it honours fills, transparency, rounded corners,
images with alpha, per-run type, alignment, vertical alignment, wrapping with
true font metrics, line spacing and bullets.

  python3 tools/render-deck.py deck.pptx outdir [slide numbers...]
"""
import sys, os, io, math
from pptx import Presentation
from PIL import Image, ImageDraw, ImageFont

EMU = 914400
SCALE = 150            # px per inch
FONTDIR = os.path.join(os.path.dirname(__file__), '..', '..', 'shot', 'ttf')
if not os.path.isdir(FONTDIR):
    FONTDIR = os.environ.get('DECK_TTF', '/tmp/shot/ttf')

FILES = {
    ('Archivo Black', False, False): 'ArchivoBlack.ttf',
    ('Nunito Sans', False, False): 'NunitoSans-normal-latin.ttf',
    ('Nunito Sans', True, False): 'NunitoSans-normal-latin.ttf',
    ('Nunito Sans', False, True): 'NunitoSans-italic-latin.ttf',
    ('Nunito Sans', True, True): 'NunitoSans-italic-latin.ttf',
    ('Noto Sans Devanagari', False, False): 'NotoSansDevanagari-normal-devanagari.ttf',
    ('Noto Sans Devanagari', True, False): 'NotoSansDevanagari-normal-devanagari.ttf',
    ('__ext', False, False): 'NunitoSans-normal-latin-ext.ttf',
    ('__ext', True, False): 'NunitoSans-normal-latin-ext.ttf',
    ('__dev', False, False): 'NotoSansDevanagari-normal-devanagari.ttf',
}
_cache = {}


def font(name, size_pt, bold=False, italic=False):
    key = (name, bold, italic, round(size_pt, 1))
    if key in _cache:
        return _cache[key]
    fn = FILES.get((name, bold, italic)) or FILES.get((name, False, False)) \
        or 'NunitoSans-normal-latin.ttf'
    px = max(5, int(round(size_pt * SCALE / 72.0)))
    try:
        f = ImageFont.truetype(os.path.join(FONTDIR, fn), px)
        try:
            f.set_variation_by_axes([800 if bold else 400])
        except Exception:
            pass
    except Exception:
        f = ImageFont.load_default()
    _cache[key] = f
    return f


_cmap_cache = {}


def FALLBACK(size, bold=False):
    return font('__ext', size, bold)


def FALLBACK_DEV(size):
    return font('__dev', size)


def has_glyph(f, ch):
    key = id(f)
    cm = _cmap_cache.get(key)
    if cm is None:
        try:
            from fontTools.ttLib import TTFont
            cm = set(TTFont(f.path).getBestCmap().keys())
        except Exception:
            cm = None
        _cmap_cache[key] = cm
    return True if cm is None else (ord(ch) in cm)


def runs_with_fallback(txt, f, size):
    """Split text into (chunk, font) pairs, swapping in a fallback face for
    characters the primary font does not carry — what PowerPoint does."""
    chain = [FALLBACK(size, True), FALLBACK_DEV(size)]
    out, cur, curf = [], '', None
    for ch in txt:
        use = f
        if ch not in ' \t' and not has_glyph(f, ch):
            for alt in chain:
                if has_glyph(alt, ch):
                    use = alt
                    break
        if curf is None or use is curf:
            cur += ch; curf = use
        else:
            out.append((cur, curf)); cur = ch; curf = use
    if cur:
        out.append((cur, curf))
    return out


def measure(txt, f, size, charsp=0):
    return sum(ff.getlength(c) for c, ff in runs_with_fallback(txt, f, size)) + charsp * len(txt)


def inch(v):
    return (v or 0) / EMU


def hexcol(c):
    try:
        if c is not None and c.type is not None and c.rgb is not None:
            return '#' + str(c.rgb)
    except Exception:
        pass
    return None


def blend(hexstr, alpha):
    r = int(hexstr[1:3], 16); g = int(hexstr[3:5], 16); b = int(hexstr[5:7], 16)
    return (r, g, b, int(round(255 * alpha)))


def shape_fill(sh):
    """(rgba tuple or None)"""
    try:
        f = sh.fill
        if f.type is None or f.type == 5:      # inherit / none
            return None
        col = hexcol(f.fore_color)
        if not col:
            return None
        alpha = 1.0
        # transparency lives in the raw XML
        el = f.fore_color._xFill if hasattr(f.fore_color, '_xFill') else None
        try:
            srgb = sh.fill._xPr.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}srgbClr')
            if srgb is not None:
                a = srgb.find('{http://schemas.openxmlformats.org/drawingml/2006/main}alpha')
                if a is not None:
                    alpha = int(a.get('val')) / 100000.0
        except Exception:
            pass
        return blend(col, alpha)
    except Exception:
        return None


def shape_line(sh):
    try:
        w = sh.line.width
        if w is not None and w == 0:
            return None, 0
        col = hexcol(sh.line.color)
        if col is None:
            return None, 0
        px = max(1, int(round(inch(w or 9525) * SCALE))) if w else 1
        return col, px
    except Exception:
        return None, 0


def wrap(text, f, maxw, charsp=0, size=12):
    """Wrap to pixel width using real metrics."""
    out = []
    for hard in text.split('\n'):
        if not hard:
            out.append('')
            continue
        words, line = hard.split(' '), ''
        for w in words:
            probe = (line + ' ' + w).strip()
            if measure(probe, f, size, charsp) > maxw and line:
                out.append(line)
                line = w
            else:
                line = probe
        out.append(line)
    return out


def draw_text_frame(img, d, sh, x, y, w, h):
    tf = sh.text_frame
    try:
        anchor = tf.vertical_anchor
    except Exception:
        anchor = None
    lines = []      # (text, font, colour, align, size, charsp)
    for p in tf.paragraphs:
        runs = list(p.runs)
        txt = ''.join(r.text for r in runs)
        size, bold, italic, col, fname = 12.0, False, False, '#16202D', 'Nunito Sans'
        if runs:
            r0 = runs[0]
            if r0.font.size:
                size = r0.font.size.pt
            bold = bool(r0.font.bold)
            italic = bool(r0.font.italic)
            c = hexcol(r0.font.color)
            if c:
                col = c
            if r0.font.name:
                fname = r0.font.name
        a = str(p.alignment or '').lower()
        align = 'c' if 'center' in a else ('r' if 'right' in a else 'l')
        # character spacing
        charsp = 0
        try:
            spc = p._pPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}defRPr')
            if spc is not None and spc.get('spc'):
                charsp = int(spc.get('spc')) / 100.0 * SCALE / 72.0
        except Exception:
            pass
        for rr in runs:
            try:
                if rr._r.find('{http://schemas.openxmlformats.org/drawingml/2006/main}rPr') is not None:
                    v = rr._r.rPr.get('spc')
                    if v:
                        charsp = int(v) / 100.0 * SCALE / 72.0
            except Exception:
                pass
        bullet = False
        try:
            bullet = p._pPr is not None and p._pPr.find(
                '{http://schemas.openxmlformats.org/drawingml/2006/main}buChar') is not None
        except Exception:
            pass
        f = font(fname, size, bold, italic)
        if not txt.strip():
            lines.append(('', f, col, align, size, charsp, False))
            continue
        for i, ln in enumerate(wrap(txt, f, w - 6 - (14 if bullet else 0), charsp, size)):
            lines.append((ln, f, col, align, size, charsp, bullet and i == 0))

    lh = [s * 1.24 * SCALE / 72.0 for (_, _, _, _, s, _, _) in lines]
    total = sum(lh)
    if anchor is not None and 'MIDDLE' in str(anchor):
        cy = y + (h - total) / 2
    elif anchor is not None and 'BOTTOM' in str(anchor):
        cy = y + h - total
    else:
        cy = y + 2
    for (txt, f, col, align, size, charsp, bullet), step in zip(lines, lh):
        if txt:
            tw = measure(txt, f, size, charsp)
            if align == 'c':
                tx = x + (w - tw) / 2
            elif align == 'r':
                tx = x + w - tw - 3
            else:
                tx = x + 3 + (14 if bullet else 0)
            if bullet:
                d.ellipse([tx - 12, cy + step * 0.42, tx - 8, cy + step * 0.42 + 4], fill=col)
            cx = tx
            for chunk, ff in runs_with_fallback(txt, f, size):
                if charsp:
                    for ch in chunk:
                        d.text((cx, cy), ch, font=ff, fill=col)
                        cx += ff.getlength(ch) + charsp
                else:
                    d.text((cx, cy), chunk, font=ff, fill=col)
                    cx += ff.getlength(chunk)
        cy += step


def render(prs, idx, path):
    sl = prs.slides[idx - 1]
    W = int(inch(prs.slide_width) * SCALE)
    H = int(inch(prs.slide_height) * SCALE)
    bg = '#FCFAF6'
    try:
        c = hexcol(sl.background.fill.fore_color)
        if c:
            bg = c
    except Exception:
        pass
    img = Image.new('RGBA', (W, H), bg)
    d = ImageDraw.Draw(img, 'RGBA')

    def walk(shapes):
        for sh in shapes:
            if sh.shape_type == 6:
                walk(sh.shapes)
                continue
            x, y = inch(sh.left) * SCALE, inch(sh.top) * SCALE
            w, h = inch(sh.width) * SCALE, inch(sh.height) * SCALE
            if sh.shape_type == 13:
                try:
                    pic = Image.open(io.BytesIO(sh.image.blob)).convert('RGBA')
                    pic = pic.resize((max(1, int(w)), max(1, int(h))), Image.LANCZOS)
                    img.alpha_composite(pic, (int(x), int(y)))
                except Exception:
                    d.rectangle([x, y, x + w, y + h], fill='#DDDDDD')
                continue
            fill = shape_fill(sh)
            lncol, lnw = shape_line(sh)
            st = str(sh.shape_type)
            name = ''
            try:
                name = sh._element.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}prstGeom').get('prst')
            except Exception:
                pass
            if name == 'line' or (h < 2 and w > 2 and fill is None):
                if lncol:
                    d.line([x, y, x + w, y + h], fill=lncol, width=max(1, lnw))
            elif name == 'ellipse':
                if fill or lncol:
                    d.ellipse([x, y, x + w, y + h], fill=fill, outline=lncol, width=max(1, lnw))
            elif name == 'roundRect':
                adj = 16667
                try:
                    g = sh._element.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}prstGeom')
                    gd = g.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}gd')
                    if gd is not None and gd.get('fmla', '').startswith('val '):
                        adj = int(gd.get('fmla').split()[1])
                except Exception:
                    pass
                r = min(w, h) * (adj / 100000.0)
                if fill or lncol:
                    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill,
                                        outline=lncol, width=max(1, lnw))
            else:
                if fill or lncol:
                    d.rectangle([x, y, x + w, y + h], fill=fill, outline=lncol, width=max(1, lnw))
            if sh.has_text_frame and sh.text_frame.text.strip():
                draw_text_frame(img, d, sh, x, y, w, h)

    walk(sl.shapes)
    img.convert('RGB').save(path, quality=90)


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    prs = Presentation(src)
    want = [int(a) for a in sys.argv[3:]] or list(range(1, len(prs.slides) + 1))
    for i in want:
        render(prs, i, f'{out}/s{i:02d}.png')
    print(f'rendered {len(want)} slides to {out}')


if __name__ == '__main__':
    main()
