# He-Man Run & Fight

Jump-and-Run-Prototyp im Stil von Super Mario (NES), mit **He-Man** als Hero.  
**Stufe 1:** 12 Run-&-Fight-Level · **Stufe 2:** 12 Flug-Level im Raumluftfahrzeug (nach Freischaltung).  
Installierbar auf dem **iPad** als Home-Bildschirm-App (PWA).

## Schnellstart (Mac/PC)

```bash
python3 -m http.server 8080
```

Browser: [http://localhost:8080](http://localhost:8080)

## iPad-Installation

- Gesamtplan: **[IPAD-INSTALL.md](./IPAD-INSTALL.md)**
- **Variante B (GitHub Pages, dauerhaft):** **[docs/VARIANT-B.md](./docs/VARIANT-B.md)**

```bash
# Lokal-Paket (Variante A)
./scripts/pack-ipad.sh

# Dauerhaftes HTTPS-Hosting (Variante B)
./scripts/setup-github-pages.sh
```

Nach Variante B (wenn deployed):

```text
https://109fifty.github.io/he-man-run-and-fight/
```

Safari → Teilen → Zum Home-Bildschirm.

## Steuerung

### Tastatur — Stufe 1
| Taste | Aktion |
|--------|--------|
| *(nichts)* | Normal laufen (passiv) |
| → / D | Rennen |
| ← / A | Umdrehen |
| ↓ / S | Stehen |
| Space / ↑ | Springen |
| J / X | Boxen / Schwert |
| K / Z | Treten |

### Tastatur — Stufe 2 (Flug)
| Taste | Aktion |
|--------|--------|
| ↑ / W | Steigen |
| ↓ / S | Sinken |
| → / D | Boost |
| C | Bremsen |
| J / Space | Schießen |

### iPad (Touch)
Stufe 1: STOP, VOR, Jump, Faust, Tritt · Stufe 2: HOCH, RUNTER, VOR=Boost, SCHUSS

## Stufe 1 (12 Level)

1. **Wiese** — Sunny Meadow (leicht)  
2. **Forest** — Green Forest  
3. **Forest** — Deep Forest · Boss Beast Man  
4. **Wasser** — River Crossing  
5. **Wüste** — Sand Dunes  
6. **Wüste** — Lost Kings · Boss Trap Jaw  
7. **Burg** — Castle Ramparts  
8. **Spaceship** — Starship Hangar  
9. **Spaceship** — Orbital Keep · Boss Tri-Klops  
10. **Spaceship** — Void Corridors  
11. **Wasser** — Storm Coast  
12. **Lava** — Snake Mountain · Boss Skeletor → Hero  

Schwierigkeit steigt mit jedem Level. Lava nur in Level 12. Figuren vergrößert.

## Stufe 2 (12 Flug-Level)

Nach Abschluss von Stufe 1 freigeschaltet. He-Man fliegt im Raumluftfahrzeug; bei Boss-Leveln Ausstieg + Bodenkampf.

1. Wolkenweide · 2. Sturmfront · 3. Kristall-Canyon (Sky-Beast)  
4. Sand-Thermik · 5. Frost-Jetstream · 6. Neon-Orbit (Trap Jaw)  
7. Säure-Nebel · 8. Magma-Himmel · 9. Schatten-Riss (Tri-Klops)  
10. Meteoritenschwarm · 11. Horde-Korridor · 12. Snake-Mountain-Orbit (Skeletor)
