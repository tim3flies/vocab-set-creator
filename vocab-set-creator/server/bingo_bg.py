#!/usr/bin/env python3
"""Bingo card backgrounds for L4: copy the default bingo backgrounds (3x3 to 6x6) out of the Learn8 SpinWheel app file.
Only reads that file. Usage: python3 bingo_bg.py /path/to/spinwheel/index.html /srv/english/public/vocab/bingo"""
import base64, os, re, sys
src, out = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8', errors='ignore').read()
i = t.index('DEFBG={')
os.makedirs(out, exist_ok=True)
n = 0
for m in re.finditer(r"([3-6]):\{src:'data:image/jpeg;base64,([A-Za-z0-9+/=]+)'", t[i:i + 3_000_000]):
    open(os.path.join(out, f'bg{m.group(1)}.jpg'), 'wb').write(base64.b64decode(m.group(2))); n += 1
print(f'bingo backgrounds: {n}')
sys.exit(0 if n == 4 else 1)
