#!/usr/bin/env python3
"""
Per-slide fidelity audit: every string on HTML slide N must be traceable to
slide N of the source .pptx. Reports anything that is not.

  node tools/dump-html-deck.js && python3 tools/verify-fidelity.py <source.pptx>
"""
import json, re, sys, difflib
from pptx import Presentation

SRC = sys.argv[1]

def norm(t):
    t = (t.replace('–', '-').replace('—', '-').replace('−', '-').replace('×', 'x')
          .replace('≈', '~').replace('’', "'").replace('‘', "'").replace('“', '"')
          .replace('”', '"').replace(' ', ' ').replace('→', '->'))
    t = re.sub(r'\s+', ' ', t).lower().strip()
    return re.sub(r"[^a-z0-9₹%$./'\"+ -]", '', t)

def src_slides(path):
    prs = Presentation(path); out = []
    for s in prs.slides:
        bag = []
        def walk(shs, bag=bag):
            for sh in shs:
                if sh.shape_type == 6:
                    walk(sh.shapes); continue
                if sh.has_text_frame:
                    for para in sh.text_frame.paragraphs:
                        t = ''.join(r.text for r in para.runs).strip()
                        if t: bag.append(t)
                    if sh.text_frame.text.strip(): bag.append(sh.text_frame.text)
                if getattr(sh, 'has_table', False) and sh.has_table:
                    for r in sh.table.rows:
                        for c in r.cells:
                            if c.text.strip(): bag.append(c.text)
                if getattr(sh, 'has_chart', False) and sh.has_chart:
                    ch = sh.chart
                    try: bag += [str(c) for c in ch.plots[0].categories]
                    except Exception: pass
                    for ser in ch.series:
                        if getattr(ser, 'name', None): bag.append(str(ser.name))
                        bag += [('%g' % v) for v in ser.values if v is not None]
        walk(s.shapes)
        if s.has_notes_slide and s.notes_slide.notes_text_frame.text.strip():
            bag.append(s.notes_slide.notes_text_frame.text)
        out.append([norm(x) for x in bag])
    return out

SRCS = src_slides(SRC)
HTML = json.load(open('/tmp/html-deck.json'))

print(f'source slides: {len(SRCS)}   ·   html slides: {len(HTML)}   ·   '
      f'{"MATCH" if len(SRCS) == len(HTML) else "MISMATCH"}\n')

NUM = re.compile(r'\d[\d,]*(?:\.\d+)?')
total = unmatched = 0
report = []
for h in HTML:
    n = h['i']
    blob = ' || '.join(SRCS[n - 1])
    pool = SRCS[n - 1]
    miss = []
    for item in h['texts']:
        k = norm(item['t'])
        if len(k) < 3: continue
        total += 1
        if k in blob: continue
        if max((difflib.SequenceMatcher(None, k, o).ratio() for o in pool), default=0) >= 0.80: continue
        # numbers must reconcile even when the wording is a label
        nums = NUM.findall(k)
        where = None
        for j, other in enumerate(SRCS, 1):
            ob = ' || '.join(other)
            if k in ob or max((difflib.SequenceMatcher(None, k, o).ratio() for o in other), default=0) >= 0.86:
                where = j; break
        miss.append((item['t'], item['cls'], nums, where))
        unmatched += 1
    if miss:
        report.append((n, miss))

for n, miss in report:
    print(f'── slide {n}: {len(miss)} string(s) not found on source slide {n}')
    for t, cls, nums, where in miss:
        flag = f'  ← verbatim from source slide {where}' if where else (
            '  ⚠ NOT IN SOURCE' + (' · carries digits' if nums else ''))
        print(f'    [{cls[:22]:22}] {t[:88]}{flag}')
print(f'\n{total - unmatched}/{total} strings traced to their own source slide '
      f'({unmatched} to review)')
