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

1. Eternia Outskirts  
2. Vine Jungle  
3. Whispering Woods — **Endkampf: Beast Man**  
4. Crystal Caves  
5. Ice Peaks  
6. Desert of Lost Kings — **Endkampf: Trap Jaw**  
7. Snake Mountain Foothills  
8. Obsidian Bridge  
9. Grayskull Approach — **Endkampf: Tri-Klops**  
10. Inner Sanctum  
11. Throne Corridor  
12. Snake Mountain Throne — **Endkampf: Skeletor → wird Hero**  

Tor öffnet erst nach Boss-Sieg. Mechanik: passives Laufen, Vorwärts = rennen, Kopf-Stomp, Faust/Schwert/Tritt.
