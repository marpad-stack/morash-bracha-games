// _common.cjs — עזרים משותפים לסקריפטי הבדיקה (Node)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..', '..', '..', '..'); // תיקיית המאגר
const OUT = path.join(ROOT, 'qa', 'out');
fs.mkdirSync(OUT, { recursive: true });
function loadPlaywright() {
  try { return require('playwright'); } catch (e) {}
  try { return require(path.join(ROOT, 'node_modules', 'playwright')); } catch (e) {}
  const g = process.env.PLAYWRIGHT_GLOBAL || '/home/claude/.npm-global/lib/node_modules/playwright';
  try { return require(g); } catch (e) {}
  console.error('Playwright לא נמצא. הריצו: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}
async function launch(pw) {
  const channel = process.env.BROWSER_CHANNEL; // למשל msedge או chrome
  return pw.chromium.launch(channel ? { channel } : {});
}
const BASE = process.env.BASE || 'http://127.0.0.1:8765';
const D = encodeURI('/מסירה-משחקי-הבאת-ברכה/משחקים/');
const PARTS = [
  ['a', 'מתחם הקטנטנים', D + 'a-coloring/index.html'],
  ['b', 'אור הגיע אלינו', D + 'b-story.html'],
  ['c', 'בית המצוות', D + 'beit-hamitzvot.html'],
  ['d', 'מסע המצוות', D + 'd-mitzvot.html'],
  ['e', 'מסע בזמן', D + 'e-time.html'],
  ['f', 'מטבח השבת', D + 'f-kitchen.html'],
  ['g', 'בלש המידות', D + 'g-detective.html'],
  ['h', 'הכרטיס לאמא', D + 'h-card-studio.html'],
  ['i', 'צעדים ראשונים', D + 'i-first-steps/index.html'],
  ['j', 'מרווח', D + 'j-meravach.html'],
];
// דף הנחיתה של האתר (ייצוא סטטי) אם הונח ב-landing/
const landingDir = path.join(ROOT, 'landing');
if (fs.existsSync(landingDir)) {
  for (const f of fs.readdirSync(landingDir)) if (f.endsWith('.html')) PARTS.push(['L', 'דף הבאת ברכה (ייצוא): ' + f, '/landing/' + encodeURI(f)]);
}
if (process.env.LANDING_URL) PARTS.push(['L', 'דף הבאת ברכה (חי)', process.env.LANDING_URL]);
const EXTERNAL_OK = /fonts\.googleapis|fonts\.gstatic|chatgpt\.site|wa\.me/;
function only(argv) { const m = argv.find(a => /^--part=/.test(a)); return m ? m.split('=')[1].split(',') : null; }
module.exports = { ROOT, OUT, BASE, PARTS, EXTERNAL_OK, loadPlaywright, launch, only, path, fs };
