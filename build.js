const fs = require('fs');

const API = 'https://www.dongduk.ac.kr/_adm_/module/getRestaurantMenuListByWeek.ajax?direction=0';
const CORNERS = ['간편식','천원의 아침','덮밥/찌개',null,null,'간식코너','교직원식'];
const RIGHT = [6];

const esc = s => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

(async () => {
  const res = await fetch(API, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.dongduk.ac.kr/www/contents/kor-dining.do',
      'User-Agent': 'Mozilla/5.0'
    }
  });
  const data = await res.json();
  const info = data.dateInfo || {};

  const now = new Date(Date.now() + 9 * 3600 * 1000);   // 한국 시간
  const w = now.getUTCDay();
  const idx = (w >= 1 && w <= 5) ? w - 1 : 0;
  const keys = ['mon','tues','wedn','thur','fri'];
  const dateText = (info[keys[idx]] || '') + ' (' + ['월','화','수','목','금'][idx] + ')';

  let L = '', R = '';
  CORNERS.forEach((name, row) => {
    if (!name) return;
    const hit = (data.menuList || []).find(m => m.type === row * 5 + idx + 1);
    const c = (hit && hit.content ? hit.content : '').trim();
    if (!c || c === '-') return;
    const block = '<div class="corner"><div class="label">' + esc(name) + '</div>'
      + c.split(/\r?\n/).filter(Boolean).map(esc).join('<br>') + '</div>';
    if (RIGHT.includes(row)) R += block; else L += block;
  });
  if (!L && !R) L = '오늘은 등록된 식단이 없습니다.';

  const html = `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>학식</title>
<style>
  html,body{margin:0;padding:0;background:transparent}
  body{font-family:-apple-system,"Noto Sans KR",sans-serif;color:#111}
  #wrap{padding:18px;background:#fff;border-radius:22px;
        font-size:16px;line-height:1.6}
  #date{font-size:19px;font-weight:700;margin-bottom:16px}
  #cols{display:flex;gap:40px;align-items:flex-start;justify-content:center}
  .col{flex:0 1 auto;min-width:0}
  .corner{margin-bottom:14px}
  .label{opacity:.55;font-size:11px;letter-spacing:.5px;margin-bottom:3px}
</style></head>
<body><div id="wrap">
  <div id="date">${dateText}</div>
  <div id="cols"><div class="col">${L}</div><div class="col">${R}</div></div>
</div></body></html>`;

  fs.writeFileSync('index.html', html);
})();
