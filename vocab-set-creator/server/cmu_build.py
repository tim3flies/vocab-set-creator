#!/usr/bin/env python3
"""American IPA lists from the CMU Pronouncing Dictionary (BSD licence, Carnegie Mellon University).
Usage: python3 cmu_build.py cmudict.dict OUT_DIR
Writes OUT_DIR/a.json ... z.json and _.json ({word: ipa}), Cambridge-US style: stress marks, syllable dots, iː uː ɑː ɝː ɚ oʊ."""
import json, os, re, sys

V = {'AA': 'ɑː', 'AE': 'æ', 'AH': 'ʌ', 'AO': 'ɑː', 'AW': 'aʊ', 'AY': 'aɪ', 'EH': 'e', 'ER': 'ɝː', 'EY': 'eɪ',
     'IH': 'ɪ', 'IY': 'iː', 'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'uː'}
C = {'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'F': 'f', 'G': 'ɡ', 'HH': 'h', 'JH': 'dʒ', 'K': 'k', 'L': 'l', 'M': 'm',
     'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'r', 'S': 's', 'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v', 'W': 'w', 'Y': 'j',
     'Z': 'z', 'ZH': 'ʒ'}
ONSETS = {tuple(x.split()) for x in '''P L|B L|K L|G L|F L|S L|P R|B R|T R|D R|K R|G R|F R|TH R|SH R|S P|S T|S K|S M|S N|S W|
S P L|S P R|S T R|S K R|S K W|T W|D W|K W|G W|TH W|P Y|B Y|K Y|M Y|F Y|V Y|HH Y|S K Y|S P Y'''.replace('\n', '').split('|')}
SHORT = {'ɪ', 'e', 'æ', 'ʌ', 'ʊ'}


def vowel(p):
    b, s = p[:-1], p[-1]
    if b == 'AH' and s == '0':
        return 'ə', 0
    if b == 'ER' and s == '0':
        return 'ɚ', 0
    if b == 'IY' and s == '0':
        return 'i', 0
    if b == 'UW' and s == '0':
        return 'u', 0
    return V[b], int(s)


def ipa(phones):
    seg = []  # ('v', ipa, stress) or ('c', arpabet)
    for i, p in enumerate(phones):
        if p[-1].isdigit():
            v, st = vowel(p)
            if p[:-1] == 'AO' and i + 1 < len(phones) and phones[i + 1] == 'R':
                v = 'ɔː'  # store stɔːr, four fɔːr (Cambridge US)
            seg.append(('v', v, st))
        else:
            seg.append(('c', p))
    vi = [i for i, s in enumerate(seg) if s[0] == 'v']
    if not vi:
        return ''.join(C[s[1]] for s in seg)
    # where each syllable starts
    starts = [0]
    for a, b in zip(vi, vi[1:]):
        cons = [seg[k][1] for k in range(a + 1, b)]
        k = len(cons)
        for n in range(len(cons), -1, -1):  # longest legal onset for the next syllable
            on = tuple(cons[len(cons) - n:])
            if n == 0 or (n == 1 and on[0] != 'NG') or on in ONSETS:
                k = len(cons) - n
                break
        # short stressed vowel + unstressed next syllable: the consonant closes the stressed one (ˈæp.əl, ˈfɪʃ.ɪŋ)
        if k == 0 and cons and seg[a][2] > 0 and seg[a][1] in SHORT and seg[b][2] == 0:
            k = 1
        starts.append(a + 1 + k)
    multi = len(vi) > 1
    out = []
    for n, st in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(seg)
        v = seg[vi[n]]
        mark = ('ˈ' if v[2] == 1 else 'ˌ' if v[2] == 2 else '') if multi else ''
        txt = ''.join(s[1] if s[0] == 'v' else C[s[1]] for s in seg[st:end])
        out.append(('' if n == 0 or mark else '.') + mark + txt)
    r = ''.join(out)
    # Cambridge US style: secondary stress is only shown before the main stress (ˌjuː.nəˈvɝː.sə.ti), not after it (ˈɡriːn.haʊs)
    if 'ˈ' in r:
        h, t = r.split('ˈ', 1)
        r = h + 'ˈ' + t.replace('ˌ', '.')
    return r


def main(src, dst):
    os.makedirs(dst, exist_ok=True)
    books = {}
    for line in open(src, encoding='utf-8'):
        line = line.split('#')[0].strip()
        if not line:
            continue
        w, *ph = line.split()
        if '(' in w:  # keep the first (most common) pronunciation
            continue
        k = w[0] if 'a' <= w[0] <= 'z' else '_'
        books.setdefault(k, {})[w] = ipa(ph)
    for k, d in books.items():
        with open(os.path.join(dst, k + '.json'), 'w', encoding='utf-8') as f:
            json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
    print('words', sum(len(d) for d in books.values()), 'files', len(books))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
