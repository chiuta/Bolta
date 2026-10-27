const r={};
const api=()=>page.evaluate(()=>{const b=window.__bolta;return {A:b.V.A,a:b.V.a,full:b.S.opts.full,on:b.SEN.on}});
// conversii
r.dir=await page.evaluate(()=>{const b=window.__bolta;const f=(al,be,ga)=>{const v=b.dirToView(b.orientToDir(al,be,ga));return [Math.round(v.A*10)/10,Math.round(v.a*10)/10]};return {north:f(0,90,0),west:f(90,90,0),east:f(270,90,0),south:f(180,90,0),zenith:f(0,180,0),down:f(0,0,0),up45:f(0,135,0)}});
// mod senzori
await page.click('#btnSensor');
await page.waitForTimeout(300);
await page.evaluate(()=>{const e=new DeviceOrientationEvent('deviceorientationabsolute',{alpha:90,beta:100,gamma:0,absolute:true});for(let i=0;i<30;i++)window.dispatchEvent(e)});
await page.waitForTimeout(500);
r.afterEvent=await api();
r.pressed=await page.getAttribute('#btnSensor','aria-pressed');
await page.click('#btnSensor');
await page.waitForTimeout(300);
r.off=await api();
// roșu rapid
await page.click('#btnRedQ'); r.red=await page.evaluate(()=>[document.documentElement.getAttribute('data-theme'),document.getElementById('btnRedQ').getAttribute('aria-pressed')]);
await page.click('#btnRedQ'); r.red2=await page.evaluate(()=>[document.documentElement.getAttribute('data-theme'),document.getElementById('btnRedQ').getAttribute('aria-pressed'),document.getElementById('themeSel').value]);
// fără senzori (desktop): eveniment cu null → oprire automată
await page.click('#btnSensor'); await page.waitForTimeout(3000);
r.none=await page.evaluate(()=>({on:window.__bolta.SEN.on,toast:document.getElementById('toast').textContent.slice(0,60)}));
return r;
