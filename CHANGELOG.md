# Jurnal de modificări — Bolta

## 2.3.0 — 2026-10-31

Anterior: 2.2.0. Îmbină linia din hub (2.0.0, 2026-10-26) cu linia acestui depozit, ca aplicația să poată trece pe origine proprie fără pierderi.

- Din hub: **fila „Previziune” (cer în timp)** — conjuncții și ocultații locale, traiectorie, noaptea derulată; 47 de chei de traducere; modulele kit `store` și `dialog`; testul `tests/forecast.test.mjs`; excepția justificată `i18n-parity` pentru tabelul CON_ROWS din `fff.config.json`.
- Păstrat din depozit: modul senzori, modul cameră (RA), corecția nordului (2.1–2.2).
- Traduceri completate pentru cheile `sen.*` și `ar.*` în fr/it/es/pt/hu/de (traduse asistat de AI, neverificate de vorbitori nativi); testul de afișare trece acum 30/30.
- `tests/senzori.test.mjs`: simulează acordul de permisiune (`DeviceOrientationEvent.requestPermission`, expus de Chromium recent și refuzat în headless); 15/15.

## 2.2.0 — 2026-10-27

Anterior: v2.1.0. Recenzie 2 (2026-10-27).

- Nou: **corecția nordului** în modul senzori: cursor −180°…+180° (pentru busola decalată sau declinația magnetică, care nu se corectează automat) și butoanele **„Aliniază la Soare”** / **„Aliniază la Lună”** (îndreaptă spatele telefonului spre astru, dacă e deasupra orizontului, și apasă; sub orizont aplicația refuză explicit). „Resetează” revine la 0. Nu te uita direct la Soare (avertisment în pagină).
- Nou: **modul cameră (RA)** — butonul „📷 Cameră (RA)” (apare în modul senzori): `getUserMedia` doar la clic, imaginea camerei din spate sub un canvas cu fundal transparent (stelele, planetele, Soarele, Luna și liniile desenate deasupra), câmp vizual al camerei reglat manual (20°–100°, implicit 50°). Imaginea rămâne pe telefon: nu se înregistrează și nu se trimite nicăieri; oprirea RA sau a modului senzori încheie pistele camerei. Potrivirea cu cerul este aproximativă (proiecție stereografică, câmp vizual manual).
- Texte noi: RO și EN complete; pentru etichetele scurte (panou, butoane) și traduceri asistate de AI în fr/it/es/pt/hu/de, neverificate nativ; textele lungi (ajutor, mesaje) cad pe engleză.
- Test nou `tests/calibrare-camera.test.mjs` (29 de verificări; Chromium cu cameră falsă, rețea blocată): corecție, aliniere la Soare (azimut calculat de aplicație), refuz sub orizont, fundal transparent în RA, pornire/oprire cameră (piste încheiate), refuz fără permisiune, limbi, 0 erori JS/CSP.
- Curățenie: eliminat `bo_t1.js`, un fișier de lucru rămas din 2.1.0 (nu făcea parte din aplicație).
- Hash-ul CSP al scriptului principal recalculat; `app.json`/`fff-info` (permisiuni: `getUserMedia`), `sw.js`, metadate aliniate la 2.2.0.

### Nu s-a implementat
- Corecția automată a declinației magnetice (ar cere un model, de ex. WMM, cu coeficienți care nu au fost verificați aici): rămâne corecția manuală / prin aliniere la Soare sau Lună.
- Potrivire exactă cu camera: câmpul vizual real depinde de telefon (reglaj manual), nu se corectează distorsiunea lentilei; nu s-a testat pe telefoane fizice (doar cameră falsă și evenimente simulate).
- README FR/IT/ES/PT/DE/HU: doar versiunea aliniată.

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
