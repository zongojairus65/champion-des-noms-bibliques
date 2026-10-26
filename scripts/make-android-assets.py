#!/usr/bin/env python3
"""Génère les icônes Android (classique, ronde, adaptative) et l'écran de démarrage
à partir de resources/icon.png. À lancer après `npx cap add android`, depuis la racine du projet."""
import glob, math, os, statistics
from PIL import Image, ImageDraw, ImageFilter

RES = 'android/app/src/main/res'
art = Image.open('resources/icon.png').convert('RGB')
W = art.size[0]
DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

def ring_color(a, r0=0.47, r1=0.5):
    """Couleur bleue du fond de l'image, mesurée autour des tuiles."""
    px, vals = a.load(), []
    for i in range(72):
        t = 2 * math.pi * i / 72
        for r in (r0, (r0 + r1) / 2, r1):
            x = int(W / 2 + math.cos(t) * r * W); y = int(W / 2 + math.sin(t) * r * W)
            if 0 <= x < W and 0 <= y < W: vals.append(px[x, y])
    return tuple(int(statistics.median(v[k] for v in vals)) for k in range(3))

C_IN = ring_color(art)                         # bleu clair autour de la roue
C_OUT = art.getpixel((4, 4))                   # bleu foncé des coins

def gradient(w, h):
    """Fond dégradé radial (bleu clair au centre, bleu foncé sur les bords)."""
    small = 128
    g = Image.new('RGB', (small, small))
    px = g.load()
    for y in range(small):
        for x in range(small):
            d = min(1.0, math.hypot(x - small / 2, y - small / 2) / (small * 0.62))
            px[x, y] = tuple(int(C_IN[k] + (C_OUT[k] - C_IN[k]) * d) for k in range(3))
    return g.resize((w, h), Image.BICUBIC)

def feathered(a, feather=0.10):
    """L'image dans un disque aux bords adoucis (alpha)."""
    s = a.size[0]; f = int(s * feather)
    m = Image.new('L', (s, s), 0)
    ImageDraw.Draw(m).ellipse((f, f, s - f, s - f), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(f / 2))
    out = a.convert('RGBA'); out.putalpha(m)
    return out

def rounded(a, radius):
    m = Image.new('L', a.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, a.size[0] - 1, a.size[1] - 1), radius=radius, fill=255)
    out = a.convert('RGBA'); out.putalpha(m)
    return out

def circle(a):
    m = Image.new('L', a.size, 0)
    ImageDraw.Draw(m).ellipse((0, 0, a.size[0] - 1, a.size[1] - 1), fill=255)
    out = a.convert('RGBA'); out.putalpha(m)
    return out

for name, k in DENS.items():
    d = f'{RES}/mipmap-{name}'
    if not os.path.isdir(d): continue
    s = int(48 * k)                                   # icônes classiques
    big = art.resize((s, s), Image.LANCZOS)
    rounded(big, int(s * 0.2)).save(f'{d}/ic_launcher.png')
    circle(big).save(f'{d}/ic_launcher_round.png')
    s = int(108 * k)                                  # icône adaptative (108 dp)
    inner = int(s * 0.70)                             # zone sûre : le dessin reste au centre
    fg = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    fg.alpha_composite(feathered(art.resize((inner, inner), Image.LANCZOS)), ((s - inner) // 2, (s - inner) // 2))
    fg.save(f'{d}/ic_launcher_foreground.png')
    gradient(s, s).save(f'{d}/ic_launcher_background.png')

ADAPTIVE = ('<?xml version="1.0" encoding="utf-8"?>\n'
            '<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
            '    <background android:drawable="@mipmap/ic_launcher_background"/>\n'
            '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n'
            '</adaptive-icon>\n')
for n in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    p = f'{RES}/mipmap-anydpi-v26/{n}'
    if os.path.isdir(os.path.dirname(p)): open(p, 'w').write(ADAPTIVE)

# écran de démarrage : mêmes dimensions que les fichiers du modèle Capacitor
n_splash = 0
for f in glob.glob(f'{RES}/drawable*/splash.png'):
    w, h = Image.open(f).size
    bg = gradient(w, h)
    size = int(min(w, h) * 0.5)
    logo = feathered(art.resize((size, size), Image.LANCZOS), 0.08)
    bg = bg.convert('RGBA'); bg.alpha_composite(logo, ((w - size) // 2, (h - size) // 2))
    bg.convert('RGB').save(f); n_splash += 1
print('icônes générées, écrans de démarrage :', n_splash)
