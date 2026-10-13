// Shared chrome for rendered product screens (390x844 phone viewport, 2x).
export const shell = (title, body, { dark = false } = {}) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" rel="stylesheet">
<style>
:root{--wave:#0966FF;--w100:#DFE4FF;--w300:#ACB9FF;--w800:#0046B7;--cyan:#00F9F1;--ink:#212121;--black:#262627;--muted:#666;--g100:#E0E0E0;--bg:#F4F7FF;--white:#fff;--pos:#02814B;--pos100:#D1E8DF;--alert:#D3420F;--alert100:#FFE7D6}
*{box-sizing:border-box;margin:0}
html,body{width:390px;height:844px;overflow:hidden}
body{font-family:"DM Sans",system-ui,sans-serif;color:var(--ink);background:${dark ? 'var(--black)' : 'var(--bg)'};-webkit-font-smoothing:antialiased}
.ms{font-family:"Material Symbols Rounded";font-size:22px;line-height:1;display:inline-block;font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24}
.fill{font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 24}
.status{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 22px;font-size:14px;font-weight:600;color:${dark ? '#fff' : 'var(--ink)'}}
.status .ms{font-size:16px}
.top{display:flex;align-items:center;justify-content:space-between;padding:8px 20px 0}
.top h1{font-size:22px;font-weight:600;letter-spacing:-.01em;color:${dark ? '#fff' : 'var(--ink)'}}
.icbtn{width:40px;height:40px;border-radius:50%;background:${dark ? 'rgba(255,255,255,.1)' : '#fff'};display:grid;place-items:center;color:${dark ? '#fff' : 'var(--ink)'};box-shadow:0 1px 2px rgba(3,10,47,.06)}
.wrap{padding:16px 20px 0;display:grid;gap:14px}
.card{background:var(--white);border-radius:20px;padding:18px;box-shadow:0 6px 24px rgba(3,10,47,.06)}
.card.brand{background:var(--wave);color:#fff}
.card.dark{background:var(--black);color:#fff}
.label{font-size:13px;color:var(--muted);font-weight:500}
.brand .label,.dark .label{color:rgba(255,255,255,.75)}
.big{font-size:34px;font-weight:600;letter-spacing:-.02em;line-height:1.1;margin-top:4px}
.row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;background:var(--pos100);color:var(--pos)}
.pill .ms{font-size:14px}
.pill.blue{background:var(--w100);color:var(--w800)}
.pill.white{background:rgba(255,255,255,.18);color:#fff}
.bar{height:10px;border-radius:5px;background:var(--w100);overflow:hidden;margin-top:12px}
.bar span{display:block;height:100%;background:var(--wave);border-radius:5px}
.brand .bar{background:rgba(255,255,255,.25)}.brand .bar span{background:#fff}
.tile{display:flex;gap:14px;align-items:center}
.tile .ic{width:44px;height:44px;border-radius:14px;background:var(--w100);color:var(--wave);display:grid;place-items:center;flex-shrink:0}
.tile b{display:block;font-size:15px;font-weight:600}
.tile small{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;border-radius:999px;background:var(--wave);color:#fff;font-weight:600;font-size:16px}
.btn.ghost{background:#fff;color:var(--w800);border:2px solid var(--w100)}
.brand .btn{background:#fff;color:var(--w800)}
.tabs{position:absolute;left:0;right:0;bottom:0;height:84px;background:#fff;border-top:1px solid var(--g100);display:flex;justify-content:space-around;align-items:flex-start;padding-top:12px}
.tabs div{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;font-weight:600;color:var(--muted)}
.tabs .on{color:var(--wave)}
.h2{font-size:17px;font-weight:600;margin-bottom:10px}
.list{display:grid;gap:12px}
.chart{display:flex;align-items:flex-end;gap:6px;height:110px;margin-top:14px}
.chart i{flex:1;background:var(--w100);border-radius:6px 6px 2px 2px}
.chart i.on{background:var(--wave)}
.chart i.acc{background:var(--cyan)}
.legend{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:6px}
.donut{width:120px;height:120px;border-radius:50%;background:conic-gradient(var(--wave) 0 55%,var(--w300) 55% 80%,var(--cyan) 80% 92%,var(--w100) 92% 100%);display:grid;place-items:center;flex-shrink:0}
.donut span{width:80px;height:80px;border-radius:50%;background:#fff;display:grid;place-items:center;font-weight:600;font-size:15px;text-align:center;line-height:1.1}
.dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:8px}
.step{display:flex;gap:12px;align-items:flex-start}
.step .n{width:28px;height:28px;border-radius:50%;background:var(--wave);color:#fff;font-weight:600;font-size:13px;display:grid;place-items:center;flex-shrink:0}
.step.done .n{background:var(--pos)}
.step.todo .n{background:var(--w100);color:var(--w800)}
.slider{height:6px;border-radius:3px;background:var(--w100);position:relative;margin:26px 0 10px}
.slider span{position:absolute;left:0;top:0;height:100%;background:var(--wave);border-radius:3px}
.slider i{position:absolute;top:50%;width:28px;height:28px;border-radius:50%;background:#fff;border:3px solid var(--wave);transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(3,10,47,.2)}
.avatar{width:40px;height:40px;border-radius:50%;background:var(--w100);color:var(--w800);display:grid;place-items:center;font-weight:600;font-size:14px}
.tag{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--w800)}
</style></head><body>
<div class="status"><span>9:41</span><span><span class="ms fill">signal_cellular_alt</span> <span class="ms fill">wifi</span> <span class="ms fill">battery_full</span></span></div>
${body}
</body></html>`;

export const tabs = (on) => `<nav class="tabs">${[['home','Home'],['savings','Pension'],['school','Learn'],['autorenew','Reviews'],['person','You']].map(([i,l]) => `<div class="${l===on?'on':''}"><span class="ms ${l===on?'fill':''}">${i}</span>${l}</div>`).join('')}</nav>`;
