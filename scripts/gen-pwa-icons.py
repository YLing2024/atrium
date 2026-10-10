#!/usr/bin/env python3
"""Generate the PWA icon set from the same geometry as the inline favicon.

The favicon in index.html is a 64x64 SVG:
  <rect width='64' height='64' fill='#171512'/>
  <rect x='26' y='26' width='12' height='12' fill='#a05b0c'
        transform='rotate(45 32 32)'/>
That is a #171512 square field with a #a05b0c diamond centred at (32, 32).
This script reproduces that composition at every size the manifest needs, so
the icons stay identical to the favicon (right angles, no gradient, no text,
no shadow).

The maskable icon keeps the same composition: the dark field is full-bleed and
the diamond is centred with far more than the 10% safe margin maskable needs.

Idempotent: rerunning overwrites the same files with byte-identical output.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

BG = "#171512"
ACCENT = "#a05b0c"

# Viewport of the favicon. A 12x12 square rotated 45 degrees about its centre
# becomes a diamond whose vertices sit on the axes at half-diagonal 12/sqrt(2).
VIEW = 64.0
CENTER = 32.0
HALF_DIAGONAL = 12.0 / math.sqrt(2)

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "icons"

# (filename, pixel size)
ICONS = [
    ("icon-192.png", 192),
    ("icon-512.png", 512),
    ("icon-512-maskable.png", 512),
    ("apple-touch-icon-180.png", 180),
]

# Supersample then downscale for clean edges at small sizes.
SUPERSAMPLE = 4


def render(size: int) -> Image.Image:
    big = size * SUPERSAMPLE
    img = Image.new("RGB", (big, big), BG)
    draw = ImageDraw.Draw(img)
    scale = big / VIEW
    cx = cy = CENTER * scale
    d = HALF_DIAGONAL * scale
    draw.polygon(
        [(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)],
        fill=ACCENT,
    )
    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for name, size in ICONS:
        render(size).save(OUT_DIR / name, "PNG", optimize=True)
        print(f"wrote {name} ({size}x{size})")


if __name__ == "__main__":
    main()
