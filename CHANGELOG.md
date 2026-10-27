# Jurnal de modificări — Bolta

## 2.1.0 — 2026-10-27

Anterior: v1.1.2. Recenzie 2026-10-27.

- Nou: **mod senzori** (buton 📱 în colțul dreapta-sus al cerului). Cerul urmărește orientarea telefonului/tabletei: direcția spatelui dispozitivului din `deviceorientation` (`deviceorientationabsolute` unde există; pe iOS `webkitCompassHeading` și cerere de permisiune la apăsare), netezire, trecere automată din „cerul întreg” în fereastră (câmp ≤ 70°) și restaurarea vederii la oprire; oprire automată după 2,5 s dacă nu vin evenimente de orientare. Fără cameră, fără rețea. Funcții exportate pentru test: `orientToDir`, `dirToView`, `SEN`.
- Nou: **buton rapid pentru modul noapte roșu** (🔴, lângă ⌂); tema roșie exista deja (selectorul de temă), butonul o comută și restaurează tema anterioară.
- Nou: **legătură spre Eclipsa-2027** în fila eclipsei (reciprocă cu Eclipsa-2027); aplicațiile nu sunt fuzionate: Bolta = circumstanțe locale și simulare, Eclipsa-2027 = harta benzii.
- Texte noi în cele 8 limbi (fr/it/es/pt/de/hu asistate de AI, neverificate de vorbitori nativi). Permisiune declarată nouă: `deviceorientation`.
- README (EN/RO): „Stare”, „Offline”, descrierea modului senzori și a limitelor; test nou `tests/senzori.test.mjs` (15 verificări, trec; CSP, rețea blocată, 0 erori).
- Tehnic: hash-ul CSP al scriptului principal recalculat (8 hash-uri); `sw.js`, `app.json`, `fff-info`, metadate aliniate la 2.1.0.

### Nu s-a implementat
- **Realitate augmentată cu imaginea camerei** (cerul desenat peste fluxul video): ar cere permisiunea pentru cameră, `getUserMedia`, un fundal transparent în motorul de randare și corecție pentru câmpul vizual real al camerei; nu poate fi făcută compact și sigur aici. Modul senzori acoperă componenta de orientare cu giroscopul.
- Corecția declinației magnetice pentru busolă; calibrarea manuală a nordului pentru dispozitivele fără busolă absolută (mesajul anunță doar că nordul e aproximativ).
- Testare pe dispozitive fizice (iOS/Android): logica a fost verificată doar cu evenimente simulate în Chromium.
- Celelalte șase README-uri lingvistice; `sizeBytes`/`sha256` din `app.json`.
