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
| *(nichts)* | Passiv normal laufen |
| ↓ / S | Aktiv stehen bleiben |
| Shift | Aktiv rennen |
| ← → / A D | Richtung drehen |
| Space / ↑ | Springen (Renn-Sprung höher & weiter) |
| J / X | Boxen — mit Schwert: Schwertschlag |
| K / Z | Treten |
| Enter | Start / Weiter |
| R | Level neu starten |

### iPad (Touch)
He-Man läuft von allein. Buttons: STOP, REN, Drehen, Jump, Faust, Tritt, Start, R

## Prototyp (Level 1 / 12)

- Passives Laufen / aktives Stehen / aktives Rennen / Springen
- Treten, Boxen, Schwert (nach Fund)
- Plattformen, Lava-Klippen
- Gegner mit 1 / 3 / 5 Treffern
- 15 Herzen + Herz-Pickups
- Ziel-Tor

Geplant: 12 Level — am Ende wird Skeletor zum guten Hero.
