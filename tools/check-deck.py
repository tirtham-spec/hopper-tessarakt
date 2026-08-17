#!/usr/bin/env python3
"""
Layout QA for the generated deck, standing in for a visual render.

LibreOffice is unavailable in this environment, so instead of eyeballing a
render we measure: shapes outside the slide, text that cannot fit its box at
the stated point size, and text boxes that overlap each other.

  python3 tools/check-deck.py deck.pptx [--render outdir]
"""
import sys, os, math
from pptx import Presentation
from pptx.util import Emu

EMU_IN = 914400

# Rough advance width per character as a fraction of font size, measured for
# the two families used in the deck. Deliberately pessimistic.
ADV = {'Archivo Black': 0.66, 'Nunito Sans': 0.505, 'Nirmala UI': 0.55}
DEFAULT_ADV = 0.53
LINE_FACTOR = 1.22   # line height as a multiple of font size


def inches(v):
    return (v or 0) / EMU_IN


def para_text(p):
    return ''.join(r.text for r in p.runs)


def para_size(p, shape_default):
    for r in p.runs:
        if r.font.size is not None:
            return r.font.size.pt
    if p.font.size is not None:
        return p.font.size.pt
    return shape_default


def para_font(p):
    for r in p.runs:
        if r.font.name:
            return r.font.name
    return p.font.name


def est_lines(text, size_pt, font, width_in):
    """Estimate wrapped line count for a paragraph."""
    if not text:
        return 1
    adv = ADV.get(font, DEFAULT_ADV) * size_pt / 72.0   # inches per char
    if adv <= 0 or width_in <= 0:
        return 1
    per_line = max(1, int(width_in / adv))
    lines = 0
    for hard in text.split('\n'):
        words, cur = hard.split(' '), 0
        n = 1
        for w in words:
            add = len(w) + (1 if cur else 0)
            if cur + add > per_line and cur:
                n += 1
                cur = len(w)
            else:
                cur += add
        lines += n
    return max(1, lines)


def walk(shapes, out, prefix=''):
    for sh in shapes:
        if sh.shape_type == 6:  # group
            walk(sh.shapes, out, prefix)
            continue
        out.append(sh)


def main():
    path = sys.argv[1]
    render_dir = None
    if '--render' in sys.argv:
        render_dir = sys.argv[sys.argv.index('--render') + 1]
        os.makedirs(render_dir, exist_ok=True)

    prs = Presentation(path)
    SW, SH = inches(prs.slide_width), inches(prs.slide_height)
    problems = []

    for si, slide in enumerate(prs.slides, 1):
        shapes = []
        walk(slide.shapes, shapes)
        texts = []

        for sh in shapes:
            x, y = inches(sh.left), inches(sh.top)
            w, h = inches(sh.width), inches(sh.height)

            # 1 — outside the slide
            if x < -0.02 or y < -0.02 or x + w > SW + 0.02 or y + h > SH + 0.02:
                problems.append((si, 'OFFSLIDE',
                                 f'{sh.shape_type} at ({x:.2f},{y:.2f}) {w:.2f}x{h:.2f}'))

            if not sh.has_text_frame:
                continue
            tf = sh.text_frame
            full = tf.text.strip()
            if not full:
                continue

            # 2 — text that cannot fit
            total = 0.0
            fsizes = []
            for p in tf.paragraphs:
                t = para_text(p)
                if not t.strip():
                    total += 6 * LINE_FACTOR / 72.0
                    continue
                size = para_size(p, 12)
                font = para_font(p) or 'Nunito Sans'
                fsizes.append(size)
                # bullets and internal padding eat into the usable width
                usable = max(0.2, w - 0.06)
                n = est_lines(t, size, font, usable)
                total += n * size * LINE_FACTOR / 72.0
            if total > h + 0.045:
                problems.append((si, 'OVERFLOW',
                                 f'needs {total:.2f}" in {h:.2f}" @{max(fsizes or [0]):.0f}pt :: '
                                 f'{full[:70]!r}'))

            texts.append((x, y, w, h, full))

        # 3 — overlapping text boxes (ignore tiny slivers)
        for i in range(len(texts)):
            for j in range(i + 1, len(texts)):
                ax, ay, aw, ah, at = texts[i]
                bx, by, bw, bh, bt = texts[j]
                ox = min(ax + aw, bx + bw) - max(ax, bx)
                oy = min(ay + ah, by + bh) - max(ay, by)
                if ox > 0.08 and oy > 0.08:
                    area = ox * oy
                    if area > 0.06:
                        problems.append((si, 'OVERLAP',
                                         f'{area:.2f}sq" :: {at[:34]!r} / {bt[:34]!r}'))

    by_kind = {}
    for si, kind, msg in problems:
        by_kind.setdefault(kind, []).append((si, msg))

    print(f'{len(prs.slides)} slides · {SW:.2f}x{SH:.2f}in')
    for kind in ('OFFSLIDE', 'OVERFLOW', 'OVERLAP'):
        rows = by_kind.get(kind, [])
        print(f'\n== {kind}: {len(rows)}')
        for si, msg in rows[:40]:
            print(f'  slide {si:>2}  {msg}')
    if not problems:
        print('\nNo layout problems detected.')


if __name__ == '__main__':
    main()
