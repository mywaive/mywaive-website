// Renders the myWaive product screens and the OG image to PNG with Playwright.
// Usage: node scripts/screens/render.mjs
import { chromium } from 'playwright';
import { shell, tabs } from './template.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
const logoSvg = readFileSync('public/logo/logo-full-white.svg', 'utf8').replace('<svg ', '<svg style="width:256px;height:60px" ');

const screens = {
  dashboard: shell('Home', `
    <div class="top"><h1>Good morning, Priya</h1><div class="icbtn"><span class="ms">notifications</span></div></div>
    <div class="wrap">
      <div class="card brand">
        <div class="row"><span class="label">Your pension today</span><span class="pill white"><span class="ms fill">check_circle</span>On track</span></div>
        <div class="big">£84,200</div>
        <div class="label" style="margin-top:6px">Projected at 67: <b style="color:#fff">£1,640 / month</b></div>
        <div class="bar"><span style="width:72%"></span></div>
        <div class="row" style="margin-top:8px;font-size:12px;opacity:.85"><span>Target income</span><span>72% funded</span></div>
      </div>
      <div class="card">
        <div class="h2">Recommended for you</div>
        <div class="list">
          <div class="tile"><div class="ic"><span class="ms">calculate</span></div><div><b>Add £50 a month</b><small>Worth £31k more at retirement</small></div><span class="ms" style="color:#898989">chevron_right</span></div>
          <div class="tile"><div class="ic"><span class="ms">merge</span></div><div><b>3 old pots found</b><small>Transfer advice available</small></div><span class="ms" style="color:#898989">chevron_right</span></div>
          <div class="tile"><div class="ic"><span class="ms">school</span></div><div><b>Tax relief explained</b><small>4 min lesson</small></div><span class="ms" style="color:#898989">chevron_right</span></div>
        </div>
      </div>
      <div class="card"><div class="row"><div><span class="label">Next review</span><b style="display:block;font-size:16px">March 2027</b></div><span class="pill blue"><span class="ms">event</span>Auto-scheduled</span></div></div>
    </div>${tabs('Home')}`),

  modeller: shell('Modeller', `
    <div class="top"><div class="icbtn"><span class="ms">arrow_back</span></div><h1>Contribution calculator</h1><div style="width:40px"></div></div>
    <div class="wrap">
      <div class="card">
        <span class="label">Extra monthly contribution</span>
        <div class="big" style="color:var(--wave)">+£50</div>
        <div class="slider"><span style="width:42%"></span><i style="left:42%"></i></div>
        <div class="legend"><span>£0</span><span>£120</span></div>
      </div>
      <div class="card">
        <div class="row"><span class="label">Impact at retirement</span><span class="pill"><span class="ms fill">trending_up</span>+£31,400</span></div>
        <div class="chart">${[22,26,30,35,41,48,56,65,75,86].map((h,i)=>`<i class="${i>5?'on':''}" style="height:${h}%"></i>`).join('')}</div>
        <div class="legend"><span>Age 34</span><span>Age 67</span></div>
        <div class="row" style="margin-top:14px"><div><span class="dot" style="background:var(--w100)"></span><span class="label">Current plan</span></div><div><span class="dot" style="background:var(--wave)"></span><span class="label">With +£50</span></div></div>
      </div>
      <div class="card"><div class="tile"><div class="ic" style="background:var(--pos100);color:var(--pos)"><span class="ms">savings</span></div><div><b>Costs you £40 a month</b><small>After 20% tax relief</small></div></div></div>
      <div class="btn">Apply this change <span class="ms">arrow_forward</span></div>
    </div>`),

  advice: shell('Advice', `
    <div class="top"><div class="icbtn"><span class="ms">arrow_back</span></div><h1>Your recommendation</h1><div style="width:40px"></div></div>
    <div class="wrap">
      <div class="card dark">
        <span class="tag" style="color:var(--cyan)">Regulated advice</span>
        <div class="big" style="font-size:26px;margin-top:8px">Move to a retirement-focused fund from age 60</div>
        <div class="row" style="margin-top:14px"><span class="pill white"><span class="ms fill">verified</span>Validated against FCA rules</span></div>
      </div>
      <div class="card">
        <div class="h2">Why we recommend this</div>
        <div class="list">
          <div class="step done"><div class="n"><span class="ms" style="font-size:16px">check</span></div><div><b>Your goals</b><small class="label" style="display:block">Retire at 67 with £1,600 a month</small></div></div>
          <div class="step done"><div class="n"><span class="ms" style="font-size:16px">check</span></div><div><b>Your circumstances</b><small class="label" style="display:block">Balanced attitude to risk, 33 years to go</small></div></div>
          <div class="step"><div class="n">3</div><div><b>Our analysis</b><small class="label" style="display:block">Reduces volatility in the final 7 years</small></div></div>
          <div class="step todo"><div class="n">4</div><div><b>Your decision</b><small class="label" style="display:block">Accept, ask a question or decline</small></div></div>
        </div>
      </div>
      <div class="btn">Read the full advice report <span class="ms">description</span></div>
      <div class="label" style="text-align:center;font-size:12px">Every recommendation is logged and auditable.</div>
    </div>`),

  consolidation: shell('Consolidation', `
    <div class="top"><div class="icbtn"><span class="ms">arrow_back</span></div><h1>Your pension pots</h1><div style="width:40px"></div></div>
    <div class="wrap">
      <div class="card brand"><span class="label">Found across 3 previous employers</span><div class="big">£23,860</div><div class="row" style="margin-top:10px"><span class="pill white"><span class="ms fill">merge</span>Transfer advice available</span></div></div>
      <div class="card">
        <div class="list">
          <div class="tile"><div class="avatar">RS</div><div style="flex:1"><b>Retail scheme · 2016–2019</b><small>Default fund · 0.75% charge</small></div><b>£9,120</b></div>
          <div class="tile"><div class="avatar">LG</div><div style="flex:1"><b>Logistics group · 2019–2022</b><small>Default fund · 0.68% charge</small></div><b>£11,440</b></div>
          <div class="tile"><div class="avatar">CA</div><div style="flex:1"><b>Care agency · 2022–2023</b><small>Lifestyle fund · 0.80% charge</small></div><b>£3,300</b></div>
        </div>
      </div>
      <div class="card"><div class="tile"><div class="ic" style="background:var(--pos100);color:var(--pos)"><span class="ms">savings</span></div><div><b>Consolidating could save £4,900</b><small>In charges by age 67 — see the full comparison</small></div></div></div>
      <div class="btn">See transfer advice <span class="ms">arrow_forward</span></div>
    </div>`),

  education: shell('Learn', `
    <div class="top"><h1>Learn</h1><div class="icbtn"><span class="ms">search</span></div></div>
    <div class="wrap">
      <div class="card dark">
        <span class="tag" style="color:var(--cyan)">Picked for you</span>
        <div class="big" style="font-size:24px;margin-top:8px">Tax relief explained</div>
        <div class="label" style="margin-top:6px">Why every £80 you save becomes £100</div>
        <div class="row" style="margin-top:14px"><span class="pill white"><span class="ms">schedule</span>4 min</span><span class="ms" style="color:#fff">play_circle</span></div>
      </div>
      <div class="h2" style="margin:2px 0 -4px">Your path</div>
      <div class="card">
        <div class="list">
          <div class="step done"><div class="n"><span class="ms" style="font-size:16px">check</span></div><div><b>How workplace pensions work</b><small class="label" style="display:block">Completed</small></div></div>
          <div class="step done"><div class="n"><span class="ms" style="font-size:16px">check</span></div><div><b>Choosing how much to save</b><small class="label" style="display:block">Completed</small></div></div>
          <div class="step"><div class="n">3</div><div><b>Tax relief explained</b><small class="label" style="display:block">Up next · 4 min</small></div></div>
          <div class="step todo"><div class="n">4</div><div><b>What is a default fund?</b><small class="label" style="display:block">5 min</small></div></div>
          <div class="step todo"><div class="n">5</div><div><b>Bringing old pots together</b><small class="label" style="display:block">6 min</small></div></div>
        </div>
      </div>
    </div>${tabs('Learn')}`),

  investments: shell('Investments', `
    <div class="top"><div class="icbtn"><span class="ms">arrow_back</span></div><h1>Fund allocation</h1><div style="width:40px"></div></div>
    <div class="wrap">
      <div class="card">
        <div class="row"><span class="label">Recommended portfolio</span><span class="pill"><span class="ms fill">verified</span>Suits your risk level</span></div>
        <div class="row" style="margin-top:14px;align-items:center">
          <div class="donut"><span>Balanced growth</span></div>
          <div class="list" style="flex:1;gap:8px;font-size:13px">
            <div><span class="dot" style="background:var(--wave)"></span>Global equities <b>55%</b></div>
            <div><span class="dot" style="background:var(--w300)"></span>Bonds <b>25%</b></div>
            <div><span class="dot" style="background:var(--cyan)"></span>Property <b>12%</b></div>
            <div><span class="dot" style="background:var(--w100)"></span>Cash <b>8%</b></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="h2">Compared with your current fund</div>
        <div class="list">
          <div class="row"><span class="label">Expected growth (p.a.)</span><b>5.1% <span style="color:var(--pos)">▲ 0.9%</span></b></div>
          <div class="row"><span class="label">Annual charge</span><b>0.42% <span style="color:var(--pos)">▼ 0.26%</span></b></div>
          <div class="row"><span class="label">Risk level</span><b>4 of 7 · unchanged</b></div>
        </div>
      </div>
      <div class="btn">Read the recommendation <span class="ms">arrow_forward</span></div>
      <div class="btn ghost">Ask a question</div>
    </div>`),

  reviews: shell('Reviews', `
    <div class="top"><h1>Reviews</h1><div class="icbtn"><span class="ms">history</span></div></div>
    <div class="wrap">
      <div class="card brand">
        <span class="label">Next review</span>
        <div class="big" style="font-size:28px">March 2027</div>
        <div class="row" style="margin-top:10px"><span class="pill white"><span class="ms fill">bolt</span>Triggered by your pay rise</span></div>
      </div>
      <div class="card">
        <div class="h2">What we'll check</div>
        <div class="list">
          <div class="tile"><div class="ic"><span class="ms">calculate</span></div><div><b>Contribution level</b><small>Is 5% still right at your new salary?</small></div></div>
          <div class="tile"><div class="ic"><span class="ms">trending_up</span></div><div><b>Fund allocation</b><small>Still suits your goals and risk</small></div></div>
          <div class="tile"><div class="ic"><span class="ms">flag</span></div><div><b>Retirement target</b><small>Projected income vs £1,600 goal</small></div></div>
        </div>
      </div>
      <div class="card">
        <div class="h2">Previous reviews</div>
        <div class="list">
          <div class="row"><div><b style="font-size:14px">September 2026</b><small class="label" style="display:block">Annual review · no change advised</small></div><span class="ms" style="color:var(--pos)">check_circle</span></div>
          <div class="row"><div><b style="font-size:14px">March 2026</b><small class="label" style="display:block">Job change · pots consolidated</small></div><span class="ms" style="color:var(--pos)">check_circle</span></div>
        </div>
      </div>
    </div>${tabs('Reviews')}`),
};


// ---- Desktop screens (feedback R1: use desktop prototype, not mobile) ----
const deskShell = (nav, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0&display=block" rel="stylesheet">
<style>
:root{--wave:#0966FF;--w100:#DFE4FF;--w300:#ACB9FF;--w800:#0046B7;--cyan:#00F9F1;--ink:#212121;--black:#262627;--muted:#666;--g100:#E0E0E0;--bg:#F4F7FF;--pos:#02814B;--pos100:#D1E8DF}
*{box-sizing:border-box;margin:0}html,body{width:1440px;height:900px;overflow:hidden}
body{font-family:"DM Sans",system-ui,sans-serif;color:var(--ink);background:var(--bg);display:grid;grid-template-columns:240px 1fr;-webkit-font-smoothing:antialiased}
.ms{font-family:"Material Symbols Rounded";font-size:22px;line-height:1;display:inline-block;font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24}.fill{font-variation-settings:"FILL" 1,"wght" 400,"GRAD" 0,"opsz" 24}
aside{background:#fff;border-right:1px solid var(--g100);padding:28px 20px;display:flex;flex-direction:column;gap:6px}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:20px;margin-bottom:26px;padding-left:6px}.logo i{width:32px;height:32px;border-radius:50%;background:var(--black);display:inline-block}
.nav{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;font-weight:500;color:var(--muted)}.nav.on{background:var(--w100);color:var(--w800);font-weight:600}
.user{margin-top:auto;display:flex;gap:12px;align-items:center;padding:12px 14px}.av{width:40px;height:40px;border-radius:50%;background:var(--w100);color:var(--w800);display:grid;place-items:center;font-weight:600}
main{padding:32px 40px;display:grid;grid-template-rows:auto 1fr;gap:24px}
.top{display:flex;justify-content:space-between;align-items:center}.top h1{font-size:28px;font-weight:600;letter-spacing:-.01em}
.btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;border-radius:999px;background:var(--wave);color:#fff;font-weight:600}.btn.ghost{background:#fff;color:var(--w800);border:2px solid var(--w100)}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;align-content:start}
.card{background:#fff;border-radius:20px;padding:24px;box-shadow:0 6px 24px rgba(3,10,47,.06)}.card.brand{background:var(--wave);color:#fff}
.label{font-size:14px;color:var(--muted);font-weight:500}.brand .label{color:rgba(255,255,255,.8)}
.big{font-size:44px;font-weight:600;letter-spacing:-.02em;line-height:1.05;margin-top:6px}
.row{display:flex;justify-content:space-between;align-items:center;gap:12px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;padding:6px 12px;border-radius:999px;background:var(--pos100);color:var(--pos)}.pill .ms{font-size:16px}.pill.white{background:rgba(255,255,255,.2);color:#fff}.pill.blue{background:var(--w100);color:var(--w800)}
.bar{height:10px;border-radius:5px;background:var(--w100);overflow:hidden;margin-top:14px}.bar span{display:block;height:100%;background:var(--wave)}.brand .bar{background:rgba(255,255,255,.25)}.brand .bar span{background:#fff}
.h2{font-size:18px;font-weight:600;margin-bottom:14px}
.tile{display:flex;gap:14px;align-items:center;padding:12px 0;border-bottom:1px solid var(--g100)}.tile:last-child{border:0}.tile .ic{width:44px;height:44px;border-radius:14px;background:var(--w100);color:var(--wave);display:grid;place-items:center;flex-shrink:0}
.tile b{display:block;font-size:15px}.tile small{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.chart{display:flex;align-items:flex-end;gap:10px;height:180px;margin-top:20px}.chart i{flex:1;background:var(--w100);border-radius:8px 8px 2px 2px}.chart i.on{background:var(--wave)}
.legend{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:8px}
.steps{display:flex;gap:10px;align-items:center;font-size:14px;font-weight:600;color:var(--muted)}.steps b{color:var(--w800)}.steps i{width:28px;height:28px;border-radius:50%;background:var(--w100);color:var(--w800);display:inline-grid;place-items:center;font-style:normal;font-size:13px}.steps i.on{background:var(--wave);color:#fff}.steps i.done{background:var(--pos);color:#fff}
.pot{display:grid;grid-template-columns:44px 1fr auto auto;gap:16px;align-items:center;padding:16px;border:1.5px solid var(--g100);border-radius:16px;margin-bottom:12px}.pot.sel{border-color:var(--wave);background:var(--bg)}
.chk{width:24px;height:24px;border-radius:6px;border:2px solid var(--g100);display:grid;place-items:center}.pot.sel .chk{background:var(--wave);border-color:var(--wave);color:#fff}.chk .ms{font-size:16px}
.tag{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--w800)}
</style></head><body>
<aside><div class="logo"><i></i>myWaive</div>
${nav}
</aside>
${body}</body></html>`;

const sidebar = (on) => [['home','Overview'],['savings','My pension'],['merge','Transfers'],['trending_up','Investments'],['school','Learn'],['autorenew','Reviews']].map(([i,l]) => `<div class="nav ${l===on?'on':''}"><span class="ms ${l===on?'fill':''}">${i}</span>${l}</div>`).join('') + `<div class="user"><div class="av">PR</div><div><b style="font-size:14px">Priya Raman</b><small class="label" style="display:block">Member · Scheme A</small></div></div>`;

const desktopScreens = {
  'desktop-dashboard': deskShell(sidebar('Overview'), `<main>
    <div class="top"><div><span class="tag">Overview</span><h1>Good morning, Priya</h1></div><div style="display:flex;gap:10px"><span class="btn ghost"><span class="ms">event</span>Next review · March</span><span class="btn"><span class="ms">chat</span>Ask a question</span></div></div>
    <div class="grid">
      <div class="card brand" style="grid-column:span 5"><div class="row"><span class="label">Your pension today</span><span class="pill white"><span class="ms fill">check_circle</span>On track</span></div><div class="big">£84,200</div><div class="label" style="margin-top:8px">Projected at 67: <b style="color:#fff">£1,640 / month</b></div><div class="bar"><span style="width:72%"></span></div><div class="row" style="margin-top:8px;font-size:13px;opacity:.85"><span>Target income</span><span>72% funded</span></div></div>
      <div class="card" style="grid-column:span 7"><div class="row"><span class="h2" style="margin:0">Projected pot over time</span><span class="pill"><span class="ms fill">trending_up</span>+£31,400 with +£50/mo</span></div><div class="chart">${[18,22,26,30,35,41,48,56,65,75,86,100].map((h,i)=>`<i class="${i>6?'on':''}" style="height:${h}%"></i>`).join('')}</div><div class="legend"><span>Age 34</span><span>Age 45</span><span>Age 56</span><span>Age 67</span></div></div>
      <div class="card" style="grid-column:span 7"><div class="h2">Recommended for you</div>
        <div class="tile"><div class="ic"><span class="ms">calculate</span></div><div style="flex:1"><b>Add £50 a month</b><small>Worth £31k more at retirement · costs you £40 after tax relief</small></div><span class="ms" style="color:#898989">chevron_right</span></div>
        <div class="tile"><div class="ic"><span class="ms">merge</span></div><div style="flex:1"><b>3 old pots found · £23,860</b><small>Transfer advice available — consolidating could save £4,900 in charges</small></div><span class="ms" style="color:#898989">chevron_right</span></div>
        <div class="tile"><div class="ic"><span class="ms">trending_up</span></div><div style="flex:1"><b>Fund allocation: Balanced growth</b><small>Suits your risk level · validated against FCA rules</small></div><span class="ms" style="color:#898989">chevron_right</span></div></div>
      <div class="card" style="grid-column:span 5"><div class="h2">Your path</div>
        <div class="tile"><div class="ic" style="background:var(--pos100);color:var(--pos)"><span class="ms">check</span></div><div><b>How workplace pensions work</b><small>Completed</small></div></div>
        <div class="tile"><div class="ic"><span class="ms">school</span></div><div><b>Tax relief explained</b><small>Up next · 4 min</small></div></div>
        <div class="tile"><div class="ic" style="background:#f1f1f1;color:#898989"><span class="ms">lock</span></div><div><b>Bringing old pots together</b><small>6 min</small></div></div></div>
    </div></main>`),

  'desktop-transfers': deskShell(sidebar('Transfers'), `<main>
    <div class="top"><div><span class="tag">Transfers</span><h1>Bring your pensions together</h1></div><div class="steps"><i class="done"><span class="ms">check</span></i>Find pots <span>—</span><i class="on">2</i><b>Review advice</b><span>—</span><i>3</i>Confirm</div></div>
    <div class="grid">
      <div class="card" style="grid-column:span 7"><div class="row"><span class="h2" style="margin:0">Pots we found</span><span class="pill blue"><span class="ms">search</span>3 previous employers</span></div><div style="height:14px"></div>
        <div class="pot sel"><div class="chk"><span class="ms">check</span></div><div><b>Retail scheme · 2016–2019</b><small class="label" style="display:block">Default fund · 0.75% annual charge</small></div><b>£9,120</b><span class="pill"><span class="ms fill">check_circle</span>Transfer</span></div>
        <div class="pot sel"><div class="chk"><span class="ms">check</span></div><div><b>Logistics group · 2019–2022</b><small class="label" style="display:block">Default fund · 0.68% annual charge</small></div><b>£11,440</b><span class="pill"><span class="ms fill">check_circle</span>Transfer</span></div>
        <div class="pot"><div class="chk"></div><div><b>Care agency · 2022–2023</b><small class="label" style="display:block">Lifestyle fund · guaranteed annuity rate</small></div><b>£3,300</b><span class="pill" style="background:#FFE7D6;color:#D3420F"><span class="ms fill">info</span>Keep</span></div></div>
      <div class="card brand" style="grid-column:span 5"><span class="tag" style="color:var(--cyan)">Regulated advice</span><div class="big" style="font-size:30px;margin-top:10px">Transfer two pots into your current scheme. Keep the third.</div><div class="label" style="margin-top:12px">The care agency pot has a guaranteed annuity rate that is worth more than the charge saving.</div><div class="row" style="margin-top:18px"><span class="pill white"><span class="ms fill">verified</span>Validated against FCA rules</span><span class="pill white"><span class="ms">receipt_long</span>Fully logged</span></div></div>
      <div class="card" style="grid-column:span 5"><div class="h2">What this means for you</div>
        <div class="row" style="padding:10px 0;border-bottom:1px solid var(--g100)"><span class="label">Charges saved by age 67</span><b style="color:var(--pos)">£4,900</b></div>
        <div class="row" style="padding:10px 0;border-bottom:1px solid var(--g100)"><span class="label">Pots after transfer</span><b>2 → 1 (plus protected pot)</b></div>
        <div class="row" style="padding:10px 0"><span class="label">Time to complete</span><b>Typically 2–4 weeks</b></div>
        <div style="display:flex;gap:10px;margin-top:16px"><span class="btn">Continue to confirm <span class="ms">arrow_forward</span></span><span class="btn ghost">Read the full report</span></div></div>
    </div></main>`),
};

const og = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600&display=block" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#262627;font-family:"DM Sans",sans-serif;color:#fff;position:relative;overflow:hidden}
.glow{position:absolute;right:-200px;top:-300px;width:800px;height:800px;border-radius:50%;background:radial-gradient(closest-side,rgba(9,102,255,.6),rgba(9,102,255,0) 70%)}
.in{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
h1{font-size:76px;font-weight:600;letter-spacing:-.02em;line-height:1.05;max-width:900px}h1 span{color:#ACB9FF}
p{font-size:28px;color:#E0E0E0;max-width:820px;margin-top:24px}.eb{color:#00F9F1;font-size:20px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;margin-bottom:22px}</style></head>
<body><div class="glow"></div><div class="in">${logoSvg}<div><div class="eb">AI-enabled, regulated advice</div><h1>Regulated financial advice, <span>for everyone.</span></h1><p>Personalised pension advice for members and employees — affordable, always-on and fully audited.</p></div></div></body></html>`;

mkdirSync('src/assets/screens', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(screens)) {
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `src/assets/screens/${name}.png` });
  console.log('rendered', name);
}
const dpage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
for (const [name, html] of Object.entries(desktopScreens)) {
  await dpage.setContent(html, { waitUntil: 'networkidle' });
  await dpage.evaluate(() => document.fonts.ready);
  await dpage.screenshot({ path: `src/assets/screens/${name}.png` });
  console.log('rendered', name);
}
const ogPage = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await ogPage.setContent(og, { waitUntil: 'networkidle' });
await ogPage.evaluate(() => document.fonts.ready);
await ogPage.screenshot({ path: 'public/og-default.png' });
console.log('rendered og-default');
await browser.close();
