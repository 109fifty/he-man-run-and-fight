# He-Man Run & Fight

Jump-and-Run-Prototyp im Stil von Super Mario (NES), mit **He-Man** als Hero.  
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

### Tastatur
| Taste | Aktion |
|--------|--------|
| *(nichts)* | Normal laufen (passiv) |
| → / D (vorwärts) | Rennen |
| ← / A | Umdrehen |
| ↓ / S | Stehen bleiben |
| Space / ↑ | Springen (rennend höher & weiter); auf Köpfe = Treffer |
| J / X | Boxen — mit Schwert: Schwertschlag |
| K / Z | Treten |
| Enter | Start / Weiter |
| R | Level neu starten |

### iPad (Touch)
He-Man läuft von allein. Buttons: STOP, REN, Drehen, Jump, Faust, Tritt, Start, R

## Kampagne (12 Level)

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
