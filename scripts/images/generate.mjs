// Generates the site's human photography with Atlas Cloud (https://github.com/AtlasCloudAI/atlas-cloud-skills).
// Usage:  ATLASCLOUD_API_KEY=... node scripts/images/generate.mjs [--only slug,slug] [--model id] [--force]
// Output: src/assets/photos/<slug>.png — picked up automatically by src/components/ui/Photo/Photo.astro.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const KEY = process.env.ATLASCLOUD_API_KEY;
if (!KEY) { console.error('ATLASCLOUD_API_KEY is not set. Get one at https://www.atlascloud.ai/console/api-keys'); process.exit(1); }
const BASE = 'https://api.atlascloud.ai/api/v1';
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const only = opt('--only')?.split(',');
const MODEL = opt('--model') ?? 'bytedance/seedream-v5.0-lite';
const force = args.includes('--force');

const STYLE = 'Photorealistic editorial stock photograph, natural window light, shallow depth of field, warm and relatable, candid not posed, contemporary UK setting, muted neutral clothing with a small accent of blue, no text, no logos, no watermarks, no visible screen content.';

// Slugs map 1:1 to the shot list in context/contect_architecure/06-photography-shot-list.md
const shots = [
  { slug: 'home-hero', size: '1024x1280', prompt: `A woman in her early 40s at a kitchen table at home, holding a smartphone and smiling slightly as she reads it, mug of tea nearby, morning light. ${STYLE}` },
  { slug: 'providers-hero', size: '1024x1280', prompt: `A man in his mid 50s sitting relaxed on a sofa or in a garden, looking at a tablet with a calm, reassured expression. ${STYLE}` },
  { slug: 'corporates-hero', size: '1024x1280', prompt: `A warehouse worker in a hi-vis vest on a break, leaning against shelving and checking a smartphone, genuine small smile, daylight from high windows. ${STYLE}` },
  { slug: 'partners-hero', size: '1024x1280', prompt: `A benefits consultant presenting to a small HR team of three in an informal, bright meeting room, laptop open, engaged conversation. ${STYLE}` },
  { slug: 'about-team', size: '1536x672', prompt: `A small diverse start-up team of four people working together around a table in a bright London office, laptops and notebooks, relaxed and focused, wide shot. ${STYLE}` },
  { slug: 'about-why', size: '1280x1024', prompt: `A retired father in his late 60s and his adult daughter reviewing paperwork together at a kitchen table, warm and supportive, natural light. ${STYLE}` },
  { slug: 'corporates-impact', size: '1280x1024', prompt: `A diverse group of colleagues in work uniforms and office wear laughing together in a staff break room, candid. ${STYLE}` },
];

const headers = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(shot) {
  const [w, h] = shot.size.split('x').map(Number);
  const body = { model: MODEL, prompt: shot.prompt, image_size: shot.size, width: w, height: h };
  const res = await fetch(`${BASE}/model/generateImage`, { method: 'POST', headers, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok || json.code !== 200) throw new Error(`generateImage failed: ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  const id = json.data.id;
  for (let i = 0; i < 60; i++) {
    await sleep(3000);
    const p = await (await fetch(`${BASE}/model/prediction/${id}`, { headers })).json();
    const st = p.data?.status;
    if (st === 'completed' || st === 'succeeded') {
      const out = p.data.outputs ?? (Array.isArray(p.data.output) ? p.data.output : p.data.output ? [p.data.output] : []);
      if (!out[0]) throw new Error('prediction completed without an output URL');
      return out[0];
    }
    if (st === 'failed') throw new Error(`prediction failed: ${p.data.error ?? JSON.stringify(p.data).slice(0, 300)}`);
    process.stdout.write('.');
  }
  throw new Error('timed out waiting for prediction');
}

mkdirSync('src/assets/photos', { recursive: true });
for (const shot of shots) {
  if (only && !only.includes(shot.slug)) continue;
  const out = `src/assets/photos/${shot.slug}.png`;
  if (existsSync(out) && !force) { console.log(`skip ${shot.slug} (exists)`); continue; }
  process.stdout.write(`generating ${shot.slug} `);
  try {
    const url = await generate(shot);
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(out, buf);
    console.log(` saved ${out} (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    console.log(` FAILED: ${e.message}`);
  }
}
console.log('done — run `npm run build` to pick the photos up.');
