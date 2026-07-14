/* =========================================================
   老乡鸡 · 家常菜谱  —  前端交互逻辑
   纯原生 JS，无框架；数据来自 data/recipes.js (window.RECIPES)
   ========================================================= */
(function () {
  'use strict';

  var DATA = window.RECIPES || { categories: [], recipes: [] };
  var ALL = DATA.recipes || [];
  var CATS = DATA.categories || [];

  // 分类对应的柔和色（用于卡片底、胶囊、芯片小圆点）
  var TINT = {
    '炒菜': '#ECDCC4', '炖菜': '#E0D3B8', '蒸菜': '#CFDEC6', '凉拌': '#C4DDD4',
    '卤菜': '#DECBB8', '主食': '#EADABA', '早餐': '#E9D2C0', '炸品': '#EAD5B0',
    '烤类': '#E0C8AE', '烫菜': '#D2DEC4', '煮锅': '#DDD2B8', '砂锅菜': '#E2CDBE',
    '汤': '#E8D6BE', '饮品': '#C6DAE0', '配料': '#DCD6C2'
  };
  // 招牌菜（有生成配图的优先展示）
  var FEATURED = '金牌老母鸡汤';

  var state = { cat: '全部', q: '' };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var grid = $('#grid');
  var chips = $('#chips');
  var countEl = $('#count');
  var emptyEl = $('#empty');
  var qInput = $('#q');
  var clearBtn = $('#clear');

  function tint(cat) { return TINT[cat] || '#ECE3D4'; }

  /* ---------- 无字版 HEYTEA 涂鸦风占位图（按分类画不同器皿 + 黑色小人） ---------- */
  function worker(x, y, s) {
    // 原始黑色细线小人：歪脑袋、筒身、僵硬四肢、无表情
    s = s || 1;
    var sw = 3 * s;
    return '<g fill="none" stroke="#1F1A16" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M' + (x - 5 * s) + ' ' + (y - 9 * s) + ' q' + (5 * s) + ' -7 ' + (10 * s) + ' 0" />' +
      '<path d="M' + (x - 4 * s) + ' ' + (y - 2 * s) + ' q' + (4 * s) + ' 7 ' + (8 * s) + ' 0" />' +
      '<path d="M' + x + ' ' + (y - 2 * s) + ' l0 ' + (8 * s) + '" />' +
      '<path d="M' + x + ' ' + (y + 6 * s) + ' l-4 ' + (5 * s) + '" />' +
      '<path d="M' + x + ' ' + (y + 6 * s) + ' l4 ' + (5 * s) + '" />' +
      '<path d="M' + x + ' ' + (y + 1 * s) + ' l-7 ' + (3 * s) + '" />' +
      '<path d="M' + x + ' ' + (y + 1 * s) + ' l7 ' + (3 * s) + '" />' +
      '</g>';
  }
  function steam(cx, top, n) {
    var p = '';
    for (var i = 0; i < n; i++) {
      var x = cx + (i - (n - 1) / 2) * 16;
      p += '<path d="M' + x + ' ' + top + ' q-7 -12 0 -22 q7 -10 0 -20" fill="none" stroke="#1F1A16" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>';
    }
    return p;
  }
  function vessel(type) {
    var ink = '#1F1A16';
    switch (type) {
      case 'steamer': // 蒸笼
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="58" y="78" width="124" height="40" rx="10"/>' +
          '<line x1="58" y1="98" x2="182" y2="98"/>' +
          '<path d="M64 78 q58 -22 116 0"/>' +
          '<line x1="80" y1="64" x2="158" y2="64"/>' +
          '<path d="M70 64 q50 -14 100 0" />' +
          '</g>' + steam(120, 44, 3);
      case 'plate': // 凉拌盘
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<ellipse cx="120" cy="104" rx="78" ry="22"/>' +
          '<ellipse cx="120" cy="98" rx="60" ry="15"/>' +
          '<circle cx="100" cy="96" r="7"/><circle cx="128" cy="100" r="6"/><circle cx="146" cy="94" r="6"/>' +
          '</g>' + worker(186, 92, 1.05);
      case 'pot': // 卤锅
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="64" y="80" width="112" height="42" rx="12"/>' +
          '<path d="M64 92 q-14 0 -14 12"/><path d="M176 92 q14 0 14 12"/>' +
          '<path d="M70 80 q50 -16 100 0"/>' +
          '</g>' + steam(120, 58, 2) + worker(186, 86, 1.0);
      case 'rice': // 主食饭碗
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M70 104 q50 -64 100 0 q-50 16 -100 0"/>' +
          '<ellipse cx="120" cy="104" rx="50" ry="13"/>' +
          '<path d="M100 92 q20 -14 40 0" opacity=".6"/>' +
          '</g>' + worker(186, 96, 1.0);
      case 'bun': // 早餐包子
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M84 104 q6 -54 36 -54 q30 0 36 54 q-36 14 -72 0"/>' +
          '<path d="M120 50 q-8 8 0 14 q8 -6 0 -14"/>' +
          '</g>' + worker(186, 96, 1.0);
      case 'basket': // 炸/烤 筐
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M74 86 l8 36 h76 l8 -36"/>' +
          '<path d="M70 86 h100"/>' +
          '<line x1="88" y1="96" x2="86" y2="122"/><line x1="104" y1="96" x2="103" y2="122"/>' +
          '<line x1="120" y1="96" x2="120" y2="122"/><line x1="136" y1="96" x2="137" y2="122"/>' +
          '<line x1="152" y1="96" x2="154" y2="122"/>' +
          '</g>' + worker(186, 92, 1.0);
      case 'glass': // 饮品杯
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M86 70 h68 l-8 56 h-52 z"/>' +
          '<path d="M92 96 h56"/>' +
          '<circle cx="150" cy="86" r="12"/>' +
          '<path d="M134 74 l16 -22"/>' +
          '</g>' + worker(186, 92, 1.0);
      case 'jar': // 配料罐
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<rect x="82" y="84" width="76" height="58" rx="12"/>' +
          '<rect x="96" y="72" width="48" height="14" rx="6"/>' +
          '<path d="M104 100 q16 -10 32 0" opacity=".6"/>' +
          '</g>' + worker(186, 92, 1.0);
      default: // bowl 碗（炒菜/炖/汤/煮锅/砂锅/烫菜）
        return '<g fill="none" stroke="' + ink + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M66 96 q54 -56 108 0 q-54 18 -108 0"/>' +
          '<ellipse cx="120" cy="96" rx="54" ry="14"/>' +
          '</g>' + steam(120, 70, 3) + worker(186, 92, 1.05);
    }
  }
  var VESSEL_OF = {
    '炒菜': 'bowl', '炖菜': 'bowl', '汤': 'bowl', '煮锅': 'bowl', '砂锅菜': 'bowl', '烫菜': 'bowl',
    '蒸菜': 'steamer', '凉拌': 'plate', '卤菜': 'pot', '主食': 'rice', '早餐': 'bun',
    '炸品': 'basket', '烤类': 'basket', '饮品': 'glass', '配料': 'jar'
  };
  function placeholderSVG(cat) {
    var bg = tint(cat);
    return '<svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="240" height="160" fill="' + bg + '"/>' +
      vessel(VESSEL_OF[cat] || 'bowl') +
      '</svg>';
  }

  /* ---------- 渲染分类芯片 ---------- */
  function renderChips() {
    var html = '';
    var list = [{ key: '全部', name: '全部' }].concat(CATS);
    list.forEach(function (c) {
      var pressed = state.cat === c.key ? 'true' : 'false';
      var dot = c.key === '全部' ? '' : '<span class="dot" style="--cat:' + tint(c.key) + '"></span>';
      html += '<button class="chip" type="button" data-cat="' + c.key + '" aria-pressed="' + pressed + '">' +
        dot + c.name + '</button>';
    });
    chips.innerHTML = html;
    Array.prototype.forEach.call(chips.querySelectorAll('.chip'), function (btn) {
      btn.addEventListener('click', function () {
        state.cat = btn.getAttribute('data-cat');
        renderChips();
        renderGrid();
      });
    });
  }

  /* ---------- 过滤 + 搜索 ---------- */
  function matches(r) {
    if (state.cat !== '全部' && r.category !== state.cat) return false;
    var q = state.q.trim().toLowerCase();
    if (!q) return true;
    if (r.name.toLowerCase().indexOf(q) !== -1) return true;
    if (r.ingredients && r.ingredients.some(function (i) { return i.toLowerCase().indexOf(q) !== -1; })) return true;
    return false;
  }

  function getList() {
    var list = ALL.filter(matches);
    // 招牌菜置顶
    list.sort(function (a, b) {
      var af = a.name === FEATURED ? 0 : 1;
      var bf = b.name === FEATURED ? 0 : 1;
      if (af !== bf) return af - bf;
      if (a.category !== b.category) return a.category.localeCompare(b.category, 'zh');
      return a.name.localeCompare(b.name, 'zh');
    });
    return list;
  }

  /* ---------- 卡片 ---------- */
  function cardHTML(r) {
    var isFeatured = r.name === FEATURED;
    var media = r.image
      ? '<img src="' + r.image + '" alt="' + r.name + ' 的无字版涂鸦配图" loading="lazy" decoding="async">'
      : placeholderSVG(r.category);
    var badge = isFeatured ? '<span class="badge">招牌</span>' : '';
    var ingCount = r.ingredientCount || (r.ingredients ? r.ingredients.length : 0);
    var stepCount = r.stepCount || (r.steps ? r.steps.length : 0);
    return '<button class="card" type="button" data-id="' + encodeURIComponent(r.name) + '" ' +
      'aria-label="' + r.name + '，' + r.category + '，' + ingCount + ' 种配料，' + stepCount + ' 步">' +
      '<div class="thumb" style="--cat-bg:' + tint(r.category) + '">' + badge + media + '</div>' +
      '<div class="card-body">' +
      '<div class="card-name">' + r.name + '</div>' +
      '<div class="card-meta">' +
      '<span class="pill"><span class="dot" style="--cat:' + tint(r.category) + '"></span>' + r.category + '</span>' +
      '<span><span class="num">' + ingCount + '</span> 配料</span>' +
      '<span><span class="num">' + stepCount + '</span> 步</span>' +
      '</div></div></button>';
  }

  function renderGrid() {
    var list = getList();
    countEl.innerHTML = '共 <b>' + list.length + '</b> 道菜' +
      (state.cat !== '全部' ? ' · ' + state.cat : '') +
      (state.q ? ' · 搜索“' + state.q + '”' : '');
    if (!list.length) {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    grid.innerHTML = list.map(cardHTML).join('');
    Array.prototype.forEach.call(grid.querySelectorAll('.card'), function (btn) {
      btn.addEventListener('click', function () {
        var id = decodeURIComponent(btn.getAttribute('data-id'));
        var r = ALL.find(function (x) { return x.name === id; });
        if (r) openSheet(r);
      });
    });
  }

  /* ---------- 详情 bottom-sheet ---------- */
  var sheet = $('#sheet');
  var scrim = $('#scrim');
  var sheetBody = $('#sheet-body');
  var lastFocus = null;

  function openSheet(r) {
    lastFocus = document.activeElement;
    var media = r.image
      ? '<img src="' + r.image + '" alt="' + r.name + ' 的无字版涂鸦配图">'
      : placeholderSVG(r.category);
    var ings = (r.ingredients || []).map(function (i) { return '<li>' + i + '</li>'; }).join('');
    var steps = (r.steps || []).map(function (s) { return '<li>' + s + '</li>'; }).join('');
    sheetBody.innerHTML =
      '<div class="sheet-hero" style="--cat-bg:' + tint(r.category) + '">' + media + '</div>' +
      '<div class="sheet-title-wrap">' +
      '<span class="sheet-cat">' + r.category + '</span>' +
      '<h2 class="sheet-title" id="sheet-title">' + r.name + '</h2>' +
      '</div>' +
      '<div class="sheet-stats">' +
      '<div><b>' + (r.ingredientCount || (r.ingredients ? r.ingredients.length : 0)) + '</b>种配料</div>' +
      '<div><b>' + (r.stepCount || (r.steps ? r.steps.length : 0)) + '</b>个步骤</div>' +
      '</div>' +
      '<div class="sheet-section"><h3>配料</h3><ul class="ing-list">' + ings + '</ul></div>' +
      '<div class="sheet-section"><h3>做法</h3><ol class="step-list">' + steps + '</ol></div>';

    scrim.hidden = false;
    sheet.hidden = false;
    document.body.classList.add('no-scroll');
    // 触发过渡
    requestAnimationFrame(function () {
      scrim.classList.add('show');
      sheet.classList.add('show');
    });
    $('#sheet-close').focus();
  }

  function closeSheet() {
    scrim.classList.remove('show');
    sheet.classList.remove('show');
    document.body.classList.remove('no-scroll');
    var done = function () {
      sheet.hidden = true;
      scrim.hidden = true;
      sheet.removeEventListener('transitionend', done);
      if (lastFocus) lastFocus.focus();
    };
    sheet.addEventListener('transitionend', done);
    // 兜底
    setTimeout(function () { if (!sheet.classList.contains('show')) done(); }, 400);
  }

  $('#sheet-close').addEventListener('click', closeSheet);
  scrim.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  /* ---------- 搜索 ---------- */
  var t;
  qInput.addEventListener('input', function () {
    state.q = qInput.value;
    clearBtn.hidden = !qInput.value;
    clearTimeout(t);
    t = setTimeout(renderGrid, 120);
  });
  clearBtn.addEventListener('click', function () {
    qInput.value = ''; state.q = ''; clearBtn.hidden = true; qInput.focus(); renderGrid();
  });

  /* ---------- init ---------- */
  renderChips();
  renderGrid();
})();
