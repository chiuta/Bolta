// Teste Bolta 2.2.0: corecția nordului (cursor + aliniere la Soare/Lună) și modul cameră (RA) cu cameră falsă Chromium.
// Rulare: node tests/calibrare-camera.test.mjs   (PW_ROOT / CHROMIUM_PATH opționale; rețea blocată)
import {createRequire} from 'module';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = pathToFileURL(path.resolve(HERE, '..', 'index.html')).href;
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 300))); } };
const near = (a, b, tol = 0.6) => Math.abs(a - b) <= tol;
async function open(withCam) {
  const args = ['--no-sandbox']; if (withCam) args.push('--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream');
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args});
  const ctx = await browser.newContext({viewport: {width: 420, height: 900}, locale: 'ro-RO', permissions: withCam ? ['camera', 'accelerometer', 'gyroscope', 'magnetometer'] : ['accelerometer', 'gyroscope', 'magnetometer']});
  const net = [], errs = [];
  await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) errs.push(m.text()); });
  await page.goto(APP); await page.waitForFunction(() => window.__bolta && window.__bolta.FR.ok);
  return {browser, page, net, errs};
}
const ori = (page, alpha, beta, gamma = 0) => page.evaluate(a => { const e = new DeviceOrientationEvent('deviceorientationabsolute', {alpha: a[0], beta: a[1], gamma: a[2], absolute: true}); for (let i = 0; i < 40; i++) window.dispatchEvent(e); }, [alpha, beta, gamma]);

console.log('Bolta — corecția nordului');
{
  const {browser, page, net, errs} = await open(false);
  // Un loc și o oră fixe: București, 21 iunie 2026, 12:00 locală (Soarele sus pe cer)
  await page.evaluate(() => { const b = window.__bolta; b.applyPlace({name: 'București', lat: 44.4268, lon: 26.1025, elev: 80, tz: 'Europe/Bucharest'}); b.setTime(Date.UTC(2026, 5, 21, 9, 0, 0)); });
  await page.waitForTimeout(300);
  ok(await page.$eval('#senPanel', e => e.hidden), 'panoul de calibrare e ascuns până la pornirea modului senzori');
  await page.click('#btnSensor');
  ok(!(await page.$eval('#senPanel', e => e.hidden)), 'panoul apare în modul senzori', await page.evaluate(() => ({on: window.__bolta.SEN.on, t: document.getElementById('toast').textContent})));
  await ori(page, 270, 100, 0); await page.waitForTimeout(300);   // est (A=90), h=10°
  let A0 = await page.evaluate(() => window.__bolta.V.A); ok(near(A0, 90), 'fără corecție: A = 90° (est)', A0);
  await page.fill('#senOff', '30'); await page.dispatchEvent('#senOff', 'input'); await page.waitForTimeout(250);
  let A1 = await page.evaluate(() => window.__bolta.V.A); ok(near(A1, 120), 'cursor +30° → A = 120°', A1);
  ok((await page.textContent('#senOffVal')) === '30°', 'valoarea corecției afișată');
  await page.click('#senReset'); await page.waitForTimeout(250);
  ok(near(await page.evaluate(() => window.__bolta.V.A), 90) && (await page.evaluate(() => window.__bolta.SEN.off)) === 0, 'Resetează → 0°');
  // aliniere la Soare
  const sun = await page.evaluate(() => { const b = window.__bolta; b.updateFrame(); return {az: b.FR.bodies.sun.az, alt: b.FR.bodies.sun.alt}; });
  ok(sun.alt > 20, 'Soarele e deasupra orizontului la ora aleasă (alt ' + sun.alt.toFixed(1) + '°)', sun);
  await ori(page, 270, 100, 0);   // telefonul „arată” spre est, dar Soarele e în altă parte → corecție
  await page.click('#senAlignSun'); await page.waitForTimeout(300);
  const al = await page.evaluate(() => ({A: window.__bolta.V.A, off: window.__bolta.SEN.off}));
  ok(near(al.A, sun.az, 0.8), 'după „Aliniază la Soare”: cerul arată azimutul Soarelui (' + sun.az.toFixed(1) + '°)', [al, sun.az]);
  ok(Math.abs(al.off) <= 180 && near(al.off, ((sun.az - 90 + 540) % 360) - 180, 1), 'corecția = azimut Soare − azimut senzor', al);
  // aliniere la Lună: depinde dacă e deasupra orizontului
  const moon = await page.evaluate(() => { const b = window.__bolta; b.updateFrame(); return {alt: b.FR.bodies.moon.alt, az: b.FR.bodies.moon.az}; });
  await page.click('#senReset'); await ori(page, 270, 100, 0); await page.click('#senAlignMoon'); await page.waitForTimeout(300);
  const al2 = await page.evaluate(() => ({A: window.__bolta.V.A, off: window.__bolta.SEN.off, toast: document.getElementById('toast').textContent}));
  if (moon.alt > 0) ok(near(al2.A, moon.az, 0.8), 'Luna e deasupra orizontului → aliniere la azimutul ei', [al2, moon]);
  else ok(al2.off === 0 && /nu este deasupra orizontului|not above the horizon/.test(al2.toast), 'Luna sub orizont → refuz explicit, corecția rămâne 0', [al2, moon]);
  // mutăm ora pe noapte: Soarele sub orizont → refuz
  await page.evaluate(() => window.__bolta.setTime(Date.UTC(2026, 5, 21, 23, 0, 0))); await page.waitForTimeout(300);
  await page.click('#senReset'); await page.click('#senAlignSun'); await page.waitForTimeout(200);
  const al3 = await page.evaluate(() => ({off: window.__bolta.SEN.off, toast: document.getElementById('toast').textContent}));
  ok(al3.off === 0 && /nu este deasupra orizontului/.test(al3.toast), 'noaptea: „Aliniază la Soare” refuză cu mesaj și nu schimbă corecția', al3);
  // oprire: panoul dispare
  await page.click('#btnSensor'); ok(await page.$eval('#senPanel', e => e.hidden), 'oprirea modului senzori ascunde panoul');
  await page.selectOption('#langSel', 'en').catch(() => {});
  ok(net.length === 0, 'nicio cerere în rețea', net); ok(errs.length === 0, 'fără erori JS/CSP', errs);
  await browser.close();
}

console.log('Bolta — modul cameră (RA)');
{
  const {browser, page, net, errs} = await open(true);
  await page.evaluate(() => { const b = window.__bolta; b.applyPlace({name: 'București', lat: 44.4268, lon: 26.1025, elev: 80, tz: 'Europe/Bucharest'}); b.setTime(Date.UTC(2026, 9, 27, 21, 0, 0)); });
  await page.click('#btnSensor'); await ori(page, 0, 100, 0); await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => window.__bolta.arOn)) && (await page.$eval('#arVideo', v => v.hidden)), 'camera nu pornește singură');
  // fundal opac fără RA
  const opaque = await page.evaluate(() => { const c = document.getElementById('sky'), x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let z = 0; for (let i = 3; i < d.length; i += 4) if (d[i] !== 255) z++; return z / (d.length / 4); });
  ok(opaque < 0.01, 'fără RA: fundalul canvasului e opac (>99 % din pixeli)', opaque);
  await page.click('#btnAR'); await page.waitForFunction(() => window.__bolta.arOn, null, {timeout: 8000}).catch(() => {});
  await page.waitForTimeout(800);
  const ar = await page.evaluate(() => { const v = document.getElementById('arVideo'); const c = document.getElementById('sky'), x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; let z = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 0) z++;
    return {frac: z / (d.length / 4), on: window.__bolta.arOn, hidden: v.hidden, live: !!v.srcObject && v.srcObject.getTracks().every(t => t.readyState === 'live'), vw: v.videoWidth, alpha: z / (d.length / 4), pressed: document.getElementById('btnAR').getAttribute('aria-pressed'), cls: document.getElementById('canvaswrap').className}; });
  ok(ar.on && !ar.hidden && ar.live && ar.pressed === 'true' && /ar/.test(ar.cls), 'după clic: camera (falsă) pornită, video vizibil, butonul apăsat', ar);
  ok(ar.vw > 0, 'fluxul video are dimensiune (' + ar.vw + ' px)', ar);
  ok(ar.alpha > 0.5, 'în RA fundalul canvasului e transparent (>50 % din pixeli, față de 0 % fără RA; restul: stele, linii, etichete, imaginea camerei se vede)', ar.alpha);
  await page.fill('#arFovIn', '70'); await page.dispatchEvent('#arFovIn', 'input'); await page.waitForTimeout(200);
  const fv = await page.evaluate(() => ({fov: window.__bolta.Vc.fov, arFov: window.__bolta.arFov}));
  ok(fv.fov === 70 && fv.arFov === 70 && (await page.textContent('#arFovVal')) === '70°', 'câmpul vizual al camerei (reglat manual) se aplică la randare', fv);
  // oprirea camerei oprește pistele
  await page.evaluate(() => { window.__tr = document.getElementById('arVideo').srcObject.getTracks(); });
  await page.click('#btnAR'); await page.waitForTimeout(300);
  const off = await page.evaluate(() => ({on: window.__bolta.arOn, hidden: document.getElementById('arVideo').hidden, src: !!document.getElementById('arVideo').srcObject, ended: window.__tr.every(t => t.readyState === 'ended'), alpha: document.getElementById('sky').getContext('2d').getImageData(2, 2, 1, 1).data[3]}));
  ok(!off.on && off.hidden && !off.src && off.ended, 'oprire RA: pistele camerei încheiate, video ascuns', off);
  ok(off.alpha === 255, 'după oprire fundalul revine opac', off.alpha);
  // oprirea modului senzori oprește și camera
  await page.click('#btnAR'); await page.waitForFunction(() => window.__bolta.arOn, null, {timeout: 8000}).catch(() => {});
  await page.evaluate(() => { window.__tr = document.getElementById('arVideo').srcObject.getTracks(); });
  await page.click('#btnSensor'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.__bolta.arOn && window.__tr.every(t => t.readyState === 'ended')), 'oprirea modului senzori oprește și camera');
  // limbi
  await page.evaluate(() => window.__bolta.setLang('en')); await page.click('#btnSensor'); await page.waitForTimeout(200);
  ok(/Camera \(AR\)/.test(await page.textContent('#btnAR')) && /Align to the Sun/.test(await page.textContent('#senAlignSun')), 'EN: texte în engleză');
  await page.evaluate(() => window.__bolta.setLang('fr')); await page.waitForTimeout(150);
  ok(/Aligner sur le Soleil/.test(await page.textContent('#senAlignSun')), 'FR: traducere automată prezentă pentru etichete scurte');
  ok(net.length === 0, 'nicio cerere în rețea', net); ok(errs.length === 0, 'fără erori JS/CSP', errs);
  await browser.close();
}
console.log('Bolta — refuz cameră');
{
  const {browser, page, errs} = await open(false);
  await page.click('#btnSensor'); await ori(page, 0, 100, 0);
  await page.click('#btnAR'); await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({on: window.__bolta.arOn, toast: document.getElementById('toast').textContent}));
  ok(!r.on && /refuzat|indisponibil|nu oferă|denied|unavailable/.test(r.toast), 'fără cameră/permisiune: mesaj explicit, RA rămâne oprit', r);
  ok(errs.length === 0, 'fără erori JS/CSP', errs);
  await browser.close();
}
console.log(pass + ' ok, ' + fail + ' eșuate');
process.exit(fail ? 1 : 0);
