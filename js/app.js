/* ============================================================
   爱宝的太阳系之旅 —— 交互逻辑
   页面：首页(太阳系) → 天体卡 → 地球 → 洲 → 国家 → 城市 → 景点故事
   ============================================================ */

/* ---------- 全局状态 ---------- */
let state = { screen: "home", ids: [] };

/* ---------- 工具 ---------- */
function getBody(id) {
  return SPACE.bodies.find(function (b) { return b.id === id; });
}
function getContinent(id) {
  return EARTH.continents.find(function (c) { return c.id === id; });
}
function getCountry(cid, id) {
  var c = getContinent(cid);
  return c ? c.countries.find(function (x) { return x.id === id; }) : null;
}
function getCity(cid, ccid, id) {
  var co = getCountry(cid, ccid);
  return co ? co.cities.find(function (x) { return x.id === id; }) : null;
}
function getSpot(cid, ccid, ctid, id) {
  var ci = getCity(cid, ccid, ctid);
  return ci ? ci.spots.find(function (x) { return x.id === id; }) : null;
}

/* 收集所有景点（含南极洲的特殊景点） */
function allSpots() {
  var list = [];
  EARTH.continents.forEach(function (c) {
    if (c.special && c.spots) {
      c.spots.forEach(function (s) { list.push(s); });
    } else {
      c.countries.forEach(function (co) {
        co.cities.forEach(function (ci) {
          ci.spots.forEach(function (s) { list.push(s); });
        });
      });
    }
  });
  return list;
}

/* ---------- 星星进度 ---------- */
function getStars() {
  try { return JSON.parse(localStorage.getItem("abao_stars") || "[]"); }
  catch (e) { return []; }
}
function hasStar(id) { return getStars().indexOf(id) >= 0; }
function addStar(id) {
  var s = getStars();
  if (s.indexOf(id) < 0) {
    s.push(id);
    localStorage.setItem("abao_stars", JSON.stringify(s));
  }
  updateStarMeter();
}
function updateStarMeter() {
  document.getElementById("starNum").textContent = getStars().length;
  document.getElementById("starTotal").textContent = allSpots().length;
}

/* ---------- 爱宝（SVG 熊猫宇航员，形象致敬熊猫萌兰） ---------- */
function pandaSVG() {
  return '<svg viewBox="0 0 150 172" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="熊猫宇航员爱宝">'
    + '<defs>'
    + '<linearGradient id="aibaoFace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1e8d8"/></linearGradient>'
    + '<linearGradient id="aibaoPatch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d3d47"/><stop offset="1" stop-color="#1e1e26"/></linearGradient>'
    + '<linearGradient id="aibaoSuit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfeff"/><stop offset="1" stop-color="#dce5f3"/></linearGradient>'
    + '<linearGradient id="aibaoGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(205,235,255,0.38)"/><stop offset="0.55" stop-color="rgba(140,190,255,0.10)"/><stop offset="1" stop-color="rgba(205,235,255,0.22)"/></linearGradient>'
    + '<radialGradient id="aibaoCheek" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="rgba(255,138,158,0.8)"/><stop offset="1" stop-color="rgba(255,138,158,0)"/></radialGradient>'
    + '<linearGradient id="aibaoLeaf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#4ea23c"/><stop offset="1" stop-color="#9ade6e"/></linearGradient>'
    + '<radialGradient id="aibaoFlame" cx="0.5" cy="0.35" r="0.65"><stop offset="0" stop-color="#ffe28a"/><stop offset="1" stop-color="#ff8c2e"/></radialGradient>'
    + '</defs>'
    // 喷气背包与火焰
    + '<rect x="38" y="112" width="13" height="26" rx="6" fill="#93a2c4" stroke="#6f7ea6" stroke-width="1.5"/>'
    + '<rect x="99" y="112" width="13" height="26" rx="6" fill="#93a2c4" stroke="#6f7ea6" stroke-width="1.5"/>'
    + '<path d="M 44.5,137 L 38,153 L 51,137 Z" fill="url(#aibaoFlame)"><animate attributeName="opacity" values="1;0.35;1" dur="0.7s" repeatCount="indefinite"/></path>'
    + '<path d="M 105.5,137 L 99,153 L 112,137 Z" fill="url(#aibaoFlame)"><animate attributeName="opacity" values="0.4;1;0.4" dur="0.7s" repeatCount="indefinite"/></path>'
    // 左臂（自然下垂）
    + '<path d="M 47 112 Q 38 124 35 143" stroke="#c9d6f2" stroke-width="19" fill="none" stroke-linecap="round"/>'
    + '<path d="M 47 112 Q 38 124 35 143" stroke="url(#aibaoSuit)" stroke-width="16" fill="none" stroke-linecap="round"/>'
    + '<circle cx="34" cy="146" r="9" fill="#2b2b33"/>'
    // 身体（宇航服）
    + '<rect x="45" y="96" width="60" height="58" rx="23" fill="url(#aibaoSuit)" stroke="#c9d6f2" stroke-width="2.5"/>'
    + '<path d="M 52 126 H 98" stroke="#c3d0ee" stroke-width="1.6" fill="none"/>'
    + '<path d="M 75 98 V 112" stroke="#c3d0ee" stroke-width="1.6"/>'
    // 胸前控制面板
    + '<rect x="62" y="115" width="26" height="16" rx="3.5" fill="#243352" stroke="#5ec8ff" stroke-width="1.8"/>'
    + '<rect x="65" y="118" width="12" height="8" rx="2" fill="#0d3f66"/>'
    + '<path d="M 67.5 124 L 70 120.5 L 72 123 L 74.5 119.5" stroke="#6ee7a0" stroke-width="1.4" fill="none" stroke-linecap="round"/>'
    + '<circle cx="82.5" cy="121" r="1.8" fill="#ffd166"/>'
    + '<circle cx="82.5" cy="126" r="1.8" fill="#ff6e8a"/>'
    + '<circle cx="68" cy="138" r="2.2" fill="#ffd166"/><circle cx="75" cy="138" r="2.2" fill="#ff6e8a"/><circle cx="82" cy="138" r="2.2" fill="#6ee7a0"/>'
    // 肩章
    + '<circle cx="49" cy="111" r="4" fill="#5ec8ff" stroke="#2f7fb8" stroke-width="1.5"/>'
    + '<circle cx="101" cy="111" r="4" fill="#5ec8ff" stroke="#2f7fb8" stroke-width="1.5"/>'
    // 靴子
    + '<rect x="53" y="150" width="18" height="15" rx="6" fill="#2b2b33"/>'
    + '<rect x="79" y="150" width="18" height="15" rx="6" fill="#2b2b33"/>'
    + '<path d="M 55 161 H 69 M 81 161 H 95" stroke="#4a4a55" stroke-width="2"/>'
    // 右臂（举起打招呼）
    + '<path d="M 103 112 Q 110 102 125 95" stroke="#c9d6f2" stroke-width="19" fill="none" stroke-linecap="round"/>'
    + '<path d="M 103 112 Q 110 102 125 95" stroke="url(#aibaoSuit)" stroke-width="16" fill="none" stroke-linecap="round"/>'
    // 竹子
    + '<path d="M 121 97 L 133 56" stroke="#4ea23c" stroke-width="4.5" stroke-linecap="round" fill="none"/>'
    + '<path d="M 125.5 82 L 129 80.5 M 129.5 68 L 133 66.5" stroke="#3d8a2f" stroke-width="2"/>'
    + '<g transform="translate(133 56)">'
    + '<path d="M 0 2 Q 14 -6 24 -2 Q 12 6 0 4 Z" fill="url(#aibaoLeaf)"/>'
    + '<path d="M 0 2 Q -12 -8 -20 -3 Q -10 5 0 4 Z" fill="url(#aibaoLeaf)"/>'
    + '<path d="M 0 -2 Q 4 -16 14 -18 Q 8 -4 2 0 Z" fill="url(#aibaoLeaf)"/>'
    + '</g>'
    + '<circle cx="127" cy="94" r="9" fill="#2b2b33"/>'
    // 头部
    + '<circle cx="43" cy="31" r="13.5" fill="url(#aibaoPatch)" stroke="#15151c" stroke-width="1.5"/>'
    + '<circle cx="43" cy="31" r="6" fill="#3d3d49"/>'
    + '<circle cx="107" cy="31" r="13.5" fill="url(#aibaoPatch)" stroke="#15151c" stroke-width="1.5"/>'
    + '<circle cx="107" cy="31" r="6" fill="#3d3d49"/>'
    + '<circle cx="75" cy="62" r="36" fill="url(#aibaoFace)"/>'
    + '<path d="M 44 84 Q 46 92 54 95 M 106 84 Q 104 92 96 95" stroke="#e8dcc8" stroke-width="2" fill="none" stroke-linecap="round"/>'
    // 眼罩（萌兰式外八字）
    + '<ellipse cx="60" cy="64" rx="12.5" ry="15.5" fill="url(#aibaoPatch)" transform="rotate(-14 60 64)"/>'
    + '<ellipse cx="90" cy="64" rx="12.5" ry="15.5" fill="url(#aibaoPatch)" transform="rotate(14 90 64)"/>'
    // 眼睛（双高光，亮晶晶）
    + '<circle cx="60.5" cy="62" r="6" fill="#fff"/>'
    + '<circle cx="61.5" cy="63" r="3.4" fill="#101014"/>'
    + '<circle cx="59.6" cy="61" r="1.8" fill="#fff"/>'
    + '<circle cx="62.8" cy="64.8" r="1" fill="#fff"/>'
    + '<circle cx="89.5" cy="62" r="6" fill="#fff"/>'
    + '<circle cx="88.5" cy="63" r="3.4" fill="#101014"/>'
    + '<circle cx="86.6" cy="61" r="1.8" fill="#fff"/>'
    + '<circle cx="89.8" cy="64.8" r="1" fill="#fff"/>'
    // 腮红
    + '<ellipse cx="47" cy="79" rx="8" ry="5" fill="url(#aibaoCheek)"/>'
    + '<ellipse cx="103" cy="79" rx="8" ry="5" fill="url(#aibaoCheek)"/>'
    // 鼻子 + 吐舌笑（萌兰招牌表情）
    + '<ellipse cx="75" cy="71.5" rx="5.2" ry="4" fill="#26262e"/>'
    + '<ellipse cx="73.4" cy="70.2" rx="1.6" ry="1.1" fill="rgba(255,255,255,0.35)"/>'
    + '<path d="M 66 78 Q 75 88 84 78 Q 75 83 66 78 Z" fill="#432830"/>'
    + '<ellipse cx="75" cy="83.6" rx="4.6" ry="3.6" fill="#ff93a8"/>'
    + '<path d="M 71.6 83.2 Q 75 86.6 78.4 83.2" stroke="#e56a86" stroke-width="1.2" fill="none"/>'
    // 头盔玻璃罩 + 反光 + 底环 + 天线
    + '<circle cx="75" cy="62" r="44" fill="url(#aibaoGlass)" stroke="#dfe9ff" stroke-width="3.5"/>'
    + '<path d="M 44 40 A 36 36 0 0 1 60 24" stroke="rgba(255,255,255,0.65)" stroke-width="5" fill="none" stroke-linecap="round"/>'
    + '<path d="M 41 60 A 34 34 0 0 1 42 50" stroke="rgba(255,255,255,0.4)" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    + '<path d="M 34 78 A 44 44 0 0 0 116 78" fill="none" stroke="#c9d6f2" stroke-width="6"/>'
    + '<line x1="75" y1="18" x2="75" y2="9" stroke="#c9d6f2" stroke-width="3"/>'
    + '<circle cx="75" cy="7" r="4" fill="#ff6e6e"><animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite"/></circle>'
    + '</svg>';
}

/* 爱宝 + 对话框 */
function aibao(text) {
  return '<div class="aibao-row">'
    + '<div class="panda-box">' + pandaSVG() + '</div>'
    + '<div class="bubble"><span class="bubble-name">爱宝：</span>' + text + '</div>'
    + '</div>';
}

/* 照片卡片（有图显示照片，无图/加载失败回退emoji图标） */
function photoBox(item) {
  if (!item.img) return '<span class="card-emoji">' + item.emoji + '</span>';
  return '<span class="photo-box"><span class="card-emoji">' + item.emoji + '</span>'
    + '<img src="' + item.img + '" alt="' + item.name + '" loading="lazy" onerror="this.remove()"></span>';
}

/* ---------- 卡通星球 ---------- */
function sphereHTML(body, size) {
  var inner = body.hasSpot ? '<div class="great-spot"></div>' : "";
  return '<div class="sphere ' + body.classes + '" style="width:' + size + 'px;height:' + size + 'px;">' + inner + '</div>';
}

/* ---------- 面包屑 ---------- */
function renderBreadcrumb() {
  var bc = document.getElementById("breadcrumb");
  var parts = [];
  var s = state.screen, ids = state.ids;

  if (s === "home") { bc.innerHTML = ""; return; }
  parts.push({ label: "🏠 首页", fn: "go('home')" });

  if (s === "body") {
    parts.push({ label: getBody(ids[0]).name, now: true });
  } else if (s === "earth") {
    parts.push({ label: "地球", now: true });
  } else if (s === "continent") {
    parts.push({ label: "地球", fn: "go('earth')" });
    parts.push({ label: getContinent(ids[0]).name, now: true });
  } else if (s === "country") {
    parts.push({ label: "地球", fn: "go('earth')" });
    parts.push({ label: getContinent(ids[0]).name, fn: "go('continent','" + ids[0] + "')" });
    parts.push({ label: getCountry(ids[0], ids[1]).name, now: true });
  } else if (s === "city") {
    parts.push({ label: "地球", fn: "go('earth')" });
    parts.push({ label: getContinent(ids[0]).name, fn: "go('continent','" + ids[0] + "')" });
    parts.push({ label: getCountry(ids[0], ids[1]).name, fn: "go('country','" + ids[0] + "','" + ids[1] + "')" });
    parts.push({ label: getCity(ids[0], ids[1], ids[2]).name, now: true });
  } else if (s === "spot") {
    var cont = getContinent(ids[0]);
    parts.push({ label: "地球", fn: "go('earth')" });
    parts.push({ label: cont.name, fn: "go('continent','" + ids[0] + "')" });
    if (!cont.special) {
      parts.push({ label: getCountry(ids[0], ids[1]).name, fn: "go('country','" + ids[0] + "','" + ids[1] + "')" });
      parts.push({ label: getCity(ids[0], ids[1], ids[2]).name, fn: "go('city','" + ids[0] + "','" + ids[1] + "','" + ids[2] + "')" });
    }
    parts.push({ label: spotOf(state).name, now: true });
  }

  bc.innerHTML = parts.map(function (p, i) {
    var html = i > 0 ? '<span class="crumb-sep">›</span>' : "";
    if (p.now) html += '<span class="crumb-now">' + p.label + '</span>';
    else html += '<button class="crumb-link" onclick="' + p.fn + '">' + p.label + '</button>';
    return html;
  }).join("");
}

function spotOf(st) {
  var cont = getContinent(st.ids[0]);
  if (cont.special) return cont.spots.find(function (x) { return x.id === st.ids[st.ids.length - 1]; });
  return getSpot(st.ids[0], st.ids[1], st.ids[2], st.ids[3]);
}

/* ---------- 导航 ---------- */
function go(screen) {
  var ids = Array.prototype.slice.call(arguments, 1);
  state = { screen: screen, ids: ids };
  render();
}
function render() {
  renderBreadcrumb();
  var app = document.getElementById("app");
  var s = state.screen, ids = state.ids;
  if (s === "home") app.innerHTML = viewHome();
  else if (s === "body") app.innerHTML = viewBody(ids[0]);
  else if (s === "earth") app.innerHTML = viewEarth();
  else if (s === "continent") app.innerHTML = viewContinent(ids[0]);
  else if (s === "country") app.innerHTML = viewCountry(ids[0], ids[1]);
  else if (s === "city") app.innerHTML = viewCity(ids[0], ids[1], ids[2]);
  else if (s === "spot") app.innerHTML = viewSpot(ids);
  window.scrollTo(0, 0);
}

/* ---------- 视图：首页（太阳系全家福） ---------- */
function viewHome() {
  var ordered = SPACE.bodies.filter(function (b) { return !b.isMoon; }).sort(function (a, b) { return a.order - b.order; });
  var moon = getBody("moon");

  var strip = '<div class="solar-strip-wrap"><div class="solar-strip">'
    + ordered.map(function (b) {
      var badge = b.isEarth ? '<span class="home-badge">我们的家</span>' : "";
      return '<button class="planet-item" onclick="go(\'body\',\'' + b.id + '\')" title="' + b.tagline + '">'
        + '<span style="position:relative;display:inline-block;">' + sphereHTML(b, b.size) + badge + '</span>'
        + '<span class="planet-name">' + b.name + '</span>'
        + '<span class="planet-tag">' + b.tagline + '</span>'
        + '</button>';
    }).join("")
    + '</div></div>';

  var moonChip = '<div class="moon-chip-row">'
    + '<button class="card" style="max-width:260px;" onclick="go(\'body\',\'moon\')">'
    + '<span class="card-emoji">🌙</span>'
    + '<span class="card-name">月球</span>'
    + '<span class="card-sub">地球的好朋友，人类唯一踏足过的星球</span>'
    + '<span class="card-go">去看看 ›</span>'
    + '</button></div>';

  var howto = '<div class="panel"><h2><span class="h2-emoji">🧭</span>怎么玩？</h2><div class="howto-grid">'
    + '<div class="howto-step"><span class="step-emoji">🪐</span><b>第一步 · 认识星球</b><span>点击上面的星球，听爱宝介绍太阳系的每一位家庭成员</span></div>'
    + '<div class="howto-step"><span class="step-emoji">🌍</span><b>第二步 · 回到地球</b><span>从地球进入七大洲，一路点到国家和城市，环游世界</span></div>'
    + '<div class="howto-step"><span class="step-emoji">⭐</span><b>第三步 · 收集星星</b><span>每点开一个景点、读懂它背后的历史故事，就能收集一颗星星</span></div>'
    + '</div></div>';

  return '<div class="screen">'
    + '<h1 class="screen-title">🚀 爱宝的太阳系之旅</h1>'
    + '<p class="screen-sub">从太阳系出发，一路探索到地球的城市、名胜和历史故事</p>'
    + aibao("嗨！我是宇航员爱宝！欢迎登上探险飞船！先点一颗星球认识大家，再点击<b>地球</b>，我们回家环游世界吧！")
    + strip + moonChip + howto
    + '</div>';
}

/* ---------- 视图：天体详情 ---------- */
function viewBody(id) {
  var b = getBody(id);
  var facts = b.quick.map(function (f) {
    return '<div class="fact-card"><div class="fact-k">' + f.k + '</div><div class="fact-v">' + f.v + '</div></div>';
  }).join("");

  var deep = '<button class="deep-toggle" onclick="toggleDeep(this)"><span>🔍 深入了解</span><span class="arrow">▼</span></button>'
    + '<div class="deep-body">'
    + b.deep.paras.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '<ul class="fact-list">' + b.deep.facts.map(function (f) { return '<li>' + f + '</li>'; }).join("") + '</ul>'
    + '</div>';

  var earthBtn = b.isEarth
    ? '<button class="btn btn-go-earth" onclick="go(\'earth\')">🌍 进入地球探索 · 七大洲环游世界</button>'
    : "";
  var moonLinks = b.isEarth
    ? '<button class="btn btn-back" onclick="go(\'body\',\'moon\')">🌙 顺便去看看月球</button>'
    : "";
  var backLabel = b.isMoon ? "← 回到太阳系" : "← 返回太阳系";

  return '<div class="screen">'
    + '<div class="body-hero">' + sphereHTML(b, b.size * 2.2) + '<div class="body-name">' + b.name + '</div><div class="body-type">' + b.type + '</div></div>'
    + aibao(b.tagline + "！想多了解就点下面的「深入了解」哦！")
    + '<div class="panel"><h2><span class="h2-emoji">📇</span>名片速览</h2><div class="facts-grid">' + facts + '</div></div>'
    + '<div class="panel"><h2><span class="h2-emoji">📖</span>' + b.name + '是个什么样的地方？</h2>'
    + b.intro.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + '<div class="panel">' + deep + '</div>'
    + '<div class="btn-row">' + earthBtn + moonLinks + '<button class="btn btn-back" onclick="go(\'home\')">' + backLabel + '</button></div>'
    + '</div>';
}

function toggleDeep(btn) {
  btn.classList.toggle("open");
  var body = btn.nextElementSibling;
  body.classList.toggle("show");
  var label = btn.querySelector("span");
  label.textContent = body.classList.contains("show") ? "🙈 收起" : "🔍 深入了解";
}

/* ---------- 视图：地球（七大洲地图） ---------- */
function viewEarth() {
  var shapes = EARTH.map.shapes;
  var paths = "";
  EARTH.continents.forEach(function (c) {
    var sh = shapes[c.id];
    paths += '<path id="map-' + c.id + '" class="map-cont" fill="' + c.color + '" d="' + sh.path + '" onclick="go(\'continent\',\'' + c.id + '\')"><title>' + c.name + '</title></path>'
      + '<text class="map-label" x="' + sh.lx + '" y="' + sh.ly + '" text-anchor="middle">' + c.name + '</text>';
  });

  var map = '<div class="panel map-card"><h2><span class="h2-emoji">🗺️</span>地球 · 七大洲地图（点击出发！）</h2>'
    + '<svg class="world-map" viewBox="' + EARTH.map.vb + '" xmlns="http://www.w3.org/2000/svg">'
    + '<line x1="0" y1="262" x2="1000" y2="262" stroke="rgba(255,255,255,0.25)" stroke-width="2" stroke-dasharray="12 10"/>'
    + '<text x="30" y="256" fill="rgba(255,255,255,0.55)" font-size="15">赤道</text>'
    + paths
    + '</svg></div>';

  var cards = EARTH.continents.map(function (c) {
    var sub = c.special ? "没有国家，只有科学家的特殊大洲" : c.countries.length + " 个精选国家等你探索";
    return '<button class="card" onclick="go(\'continent\',\'' + c.id + '\')">'
      + '<span class="card-emoji">' + c.emoji + '</span>'
      + '<span class="card-name">' + c.name + '</span>'
      + '<span class="card-sub">' + c.tagline + '</span>'
      + '<span class="card-chip">' + sub + '</span>'
      + '<span class="card-go">出发 ›</span>'
      + '</button>';
  }).join("");

  return '<div class="screen">'
    + '<h1 class="screen-title">🌍 欢迎来到地球</h1>'
    + '<p class="screen-sub">七大洲 · 四大洋 · 一个家</p>'
    + aibao("我们到家啦！这是地球的地图，你认识几个大洲？点一个大洲（或下面的卡片），出发！")
    + map
    + '<div class="panel"><h2><span class="h2-emoji">🌏</span>选择大洲</h2><div class="cards">' + cards + '</div></div>'
    + '<div class="btn-row"><button class="btn btn-back" onclick="go(\'body\',\'earth\')">🌍 回看地球知识卡</button>'
    + '<button class="btn btn-back" onclick="go(\'body\',\'moon\')">🌙 去看月球</button>'
    + '<button class="btn btn-back" onclick="go(\'home\')">← 返回太阳系</button></div>'
    + '</div>';
}

/* ---------- 视图：大洲 ---------- */
function viewContinent(id) {
  var c = getContinent(id);
  var cards = "";

  if (c.special) {
    cards = '<div class="panel"><h2><span class="h2-emoji">' + c.emoji + '</span>' + c.name + '的秘密</h2><div class="cards">'
      + c.spots.map(spotCardHTML).join("")
      + '</div></div>';
  } else {
    cards = '<div class="panel"><h2><span class="h2-emoji">' + c.emoji + '</span>选择国家</h2><div class="cards">'
      + c.countries.map(function (co) {
        return '<button class="card" onclick="go(\'country\',\'' + c.id + '\',\'' + co.id + '\')">'
          + '<span class="card-emoji">' + co.flag + '</span>'
          + '<span class="card-name">' + co.name + '</span>'
          + '<span class="card-sub">' + co.desc[0].slice(0, 38) + '…</span>'
          + '<span class="card-chip">首都：' + co.capital + '</span>'
          + '<span class="card-go">出发 ›</span>'
          + '</button>';
      }).join("")
      + '</div></div>';
  }

  return '<div class="screen">'
    + '<h1 class="screen-title">' + c.emoji + " " + c.name + '</h1>'
    + '<p class="screen-sub">' + c.tagline + '</p>'
    + aibao(c.tip)
    + '<div class="panel"><h2><span class="h2-emoji">📖</span>关于' + c.name + '</h2>'
    + c.desc.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + cards
    + '<div class="btn-row"><button class="btn btn-back" onclick="go(\'earth\')">🗺️ 回地球地图</button></div>'
    + '</div>';
}

function spotCardHTML(s) {
  var done = hasStar(s.id) ? " done-star" : "";
  return '<button class="card' + done + '" onclick="go(\'spot\',\'' + state.ids[0] + '\',\'' + (state.screen === "continent" ? "" : "") + '\',\'' + '\',\'' + s.id + '\')">'
    + '<span class="card-emoji">' + s.emoji + '</span>'
    + '<span class="card-name">' + s.name + '</span>'
    + '<span class="card-sub">' + s.tagline + '</span>'
    + '<span class="card-go">听故事 ›</span>'
    + '</button>';
}

/* ---------- 视图：国家 ---------- */
function viewCountry(cid, coid) {
  var c = getContinent(cid);
  var co = getCountry(cid, coid);
  var facts = co.quick.map(function (f) {
    return '<div class="fact-card"><div class="fact-k">' + f.k + '</div><div class="fact-v">' + f.v + '</div></div>';
  }).join("");

  var cityCards = co.cities.map(function (ci) {
    var doneCount = ci.spots.filter(function (s) { return hasStar(s.id); }).length;
    return '<button class="card" onclick="go(\'city\',\'' + cid + '\',\'' + coid + '\',\'' + ci.id + '\')">'
      + photoBox(ci)
      + '<span class="card-name">' + ci.name + '</span>'
      + '<span class="card-sub">' + ci.desc[0].slice(0, 38) + '…</span>'
      + '<span class="card-chip">' + ci.spots.length + ' 个景点' + (doneCount ? ' · 已得 ' + doneCount + ' ⭐' : '') + '</span>'
      + '<span class="card-go">前往 ›</span>'
      + '</button>';
  }).join("");

  return '<div class="screen">'
    + '<h1 class="screen-title">' + co.flag + " " + co.name + '</h1>'
    + '<p class="screen-sub">' + co.chip + ' · 首都：' + co.capital + '</p>'
    + aibao("欢迎来到" + co.name + "！" + (co.quick[0].k === "首都" && co.quick[0].v.indexOf("三个") >= 0 ? "这个国家有三个首都，很特别吧！" : "来认识一下这个国家吧！"))
    + '<div class="panel"><h2><span class="h2-emoji">📖</span>国家名片</h2>'
    + co.desc.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '<div class="facts-grid" style="margin-top:14px;">' + facts + '</div></div>'
    + '<div class="panel"><h2><span class="h2-emoji">🏙️</span>选择城市</h2><div class="cards">' + cityCards + '</div></div>'
    + '<div class="btn-row"><button class="btn btn-back" onclick="go(\'continent\',\'' + cid + '\')">← 回到' + c.name + '</button></div>'
    + '</div>';
}

/* ---------- 视图：城市 ---------- */
function viewCity(cid, coid, ctid) {
  var c = getContinent(cid);
  var co = getCountry(cid, coid);
  var ci = getCity(cid, coid, ctid);

  var spotCards = ci.spots.map(function (s) {
    var done = hasStar(s.id) ? " done-star" : "";
    return '<button class="card' + done + '" onclick="go(\'spot\',\'' + cid + '\',\'' + coid + '\',\'' + ctid + '\',\'' + s.id + '\')">'
      + photoBox(s)
      + '<span class="card-name">' + s.name + '</span>'
      + '<span class="card-sub">' + s.tagline + '</span>'
      + (done ? '<span class="card-chip">已探索 ⭐</span>' : '<span class="card-chip">点开收集 ⭐</span>')
      + '<span class="card-go">听故事 ›</span>'
      + '</button>';
  }).join("");

  return '<div class="screen">'
    + '<h1 class="screen-title">' + ci.emoji + " " + ci.name + '</h1>'
    + '<p class="screen-sub">' + co.name + ' · ' + c.name + '</p>'
    + aibao("我们到了" + ci.name + "！下面是这里最有名的景点，每个景点都藏着一个历史故事哦！")
    + '<div class="panel"><h2><span class="h2-emoji">📖</span>关于' + ci.name + '</h2>'
    + ci.desc.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + '<div class="panel"><h2><span class="h2-emoji">📍</span>著名景点</h2><div class="cards">' + spotCards + '</div></div>'
    + '<div class="btn-row"><button class="btn btn-back" onclick="go(\'country\',\'' + cid + '\',\'' + coid + '\')">← 回到' + co.name + '</button></div>'
    + '</div>';
}

/* ---------- 视图：景点 + 历史故事（到访即得星） ---------- */
function viewSpot(ids) {
  var c = getContinent(ids[0]);
  var s = spotOf(state);
  var firstVisit = !hasStar(s.id);
  if (firstVisit) addStar(s.id);
  var backFn = c.special
    ? "go('continent','" + c.id + "')"
    : "go('city','" + ids[0] + "','" + ids[1] + "','" + ids[2] + "')";
  var backName = c.special ? c.name : getCity(ids[0], ids[1], ids[2]).name;

  var deep = '<button class="deep-toggle" onclick="toggleDeep(this)"><span>🔍 深入了解</span><span class="arrow">▼</span></button>'
    + '<div class="deep-body">'
    + s.deep.paras.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '<ul class="fact-list">' + s.deep.facts.map(function (f) { return '<li>' + f + '</li>'; }).join("") + '</ul>'
    + '</div>';

  var heroVisual = s.img
    ? '<img class="spot-photo" src="' + s.img + '" alt="' + s.name + '" onerror="this.remove();var e=document.getElementById(\'spotEmoji\');if(e)e.style.display=\'flex\';">'
      + '<div class="spot-emoji-big" id="spotEmoji" style="display:none;">' + s.emoji + '</div>'
    : '<div class="spot-emoji-big">' + s.emoji + '</div>';

  var visitTip = firstVisit
    ? '<div class="quiz-got-star">🎉 新探索！收集到一颗星星 ⭐（' + getStars().length + '/' + allSpots().length + '）</div>'
    : "";

  return '<div class="screen">'
    + '<div class="spot-hero">' + heroVisual + '<div class="spot-name">' + s.name + '</div>'
    + '<div class="spot-loc">📍 ' + s.loc + ' · ' + s.tagline + '</div></div>'
    + aibao("这就是" + s.name + "！先看看它是什么样的地方，再听我讲它背后的历史故事吧！")
    + '<div class="panel"><h2><span class="h2-emoji">👀</span>它是什么样的地方？</h2>'
    + s.desc.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + '<div class="panel story-box"><h2 class="story-title"><span class="h2-emoji">📜</span>历史故事：' + s.story.title + '</h2>'
    + s.story.paras.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + (visitTip ? '<div class="panel quiz-box" style="text-align:center;">' + visitTip + '</div>' : '')
    + '<div class="panel">' + deep + '</div>'
    + '<div class="btn-row"><button class="btn btn-back" onclick="' + backFn + '">← 回到' + backName + '</button></div>'
    + '</div>';
}

/* ---------- 星空背景 ---------- */
function makeStars() {
  var layers = document.querySelectorAll(".stars");
  var counts = [60, 40, 25];
  layers.forEach(function (layer, li) {
    for (var i = 0; i < counts[li]; i++) {
      var d = document.createElement("div");
      d.className = "star-dot";
      var size = 1 + Math.random() * 2.2;
      d.style.width = size + "px";
      d.style.height = size + "px";
      d.style.left = (Math.random() * 100) + "%";
      d.style.top = (Math.random() * 100) + "%";
      d.style.setProperty("--dur", (2 + Math.random() * 4) + "s");
      d.style.setProperty("--delay", (Math.random() * 4) + "s");
      layer.appendChild(d);
    }
  });
}

/* ---------- 启动 ---------- */
document.getElementById("logoBtn").addEventListener("click", function () { go("home"); });
makeStars();
updateStarMeter();
render();

/* 深层链接：网址后加 ?go=页面,参数... 可直达任意地点（便于分享与测试） */
(function () {
  var m = location.search.match(/[?&]go=([^&]+)/);
  if (m) {
    var parts = decodeURIComponent(m[1]).split(",");
    if (parts[0]) {
      try { go.apply(null, parts); } catch (e) { go("home"); }
    }
  }
})();
