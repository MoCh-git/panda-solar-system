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

/* ---------- 爱宝（SVG 熊猫宇航员） ---------- */
function pandaSVG() {
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="熊猫宇航员爱宝">'
    + '<circle cx="60" cy="52" r="40" fill="rgba(180,220,255,0.25)" stroke="#dfe9ff" stroke-width="3"/>'
    + '<circle cx="34" cy="27" r="11" fill="#2b2b33"/>'
    + '<circle cx="86" cy="27" r="11" fill="#2b2b33"/>'
    + '<circle cx="60" cy="54" r="30" fill="#ffffff"/>'
    + '<ellipse cx="46" cy="50" rx="9" ry="11" fill="#2b2b33" transform="rotate(-12 46 50)"/>'
    + '<ellipse cx="74" cy="50" rx="9" ry="11" fill="#2b2b33" transform="rotate(12 74 50)"/>'
    + '<circle cx="48" cy="49" r="3.4" fill="#fff"/><circle cx="49.2" cy="49.8" r="1.7" fill="#111"/>'
    + '<circle cx="72" cy="49" r="3.4" fill="#fff"/><circle cx="70.8" cy="49.8" r="1.7" fill="#111"/>'
    + '<ellipse cx="60" cy="63" rx="4.5" ry="3.5" fill="#2b2b33"/>'
    + '<path d="M 60 66 Q 60 71 54 71 M 60 66 Q 60 71 66 71" stroke="#2b2b33" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + '<path d="M 20 58 A 40 40 0 0 0 100 58" fill="none" stroke="#c9d6f2" stroke-width="5"/>'
    + '<rect x="34" y="92" rx="18" width="52" height="40" fill="#f4f6ff" stroke="#dfe4f7" stroke-width="2"/>'
    + '<rect x="50" y="102" rx="4" width="20" height="12" fill="#5ec8ff" stroke="#3b8fd4" stroke-width="2"/>'
    + '<circle cx="54" cy="108" r="2" fill="#fff"/><circle cx="60" cy="108" r="2" fill="#ffd166"/><circle cx="66" cy="108" r="2" fill="#6ee7a0"/>'
    + '<rect x="12" y="96" rx="9" width="20" height="34" fill="#2b2b33" transform="rotate(18 22 100)"/>'
    + '<rect x="88" y="96" rx="9" width="20" height="34" fill="#2b2b33" transform="rotate(-32 98 98)"/>'
    + '<rect x="40" y="128" rx="8" width="16" height="13" fill="#2b2b33"/>'
    + '<rect x="64" y="128" rx="8" width="16" height="13" fill="#2b2b33"/>'
    + '</svg>';
}

/* 爱宝 + 对话框 */
function aibao(text) {
  return '<div class="aibao-row">'
    + '<div class="panda-box">' + pandaSVG() + '</div>'
    + '<div class="bubble"><span class="bubble-name">爱宝：</span>' + text + '</div>'
    + '</div>';
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
    + '<div class="howto-step"><span class="step-emoji">⭐</span><b>第三步 · 赢取星星</b><span>读完著名景点背后的历史故事，答对小测验就能收集星星</span></div>'
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
      + '<span class="card-emoji">' + ci.emoji + '</span>'
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
      + '<span class="card-emoji">' + s.emoji + '</span>'
      + '<span class="card-name">' + s.name + '</span>'
      + '<span class="card-sub">' + s.tagline + '</span>'
      + (done ? '<span class="card-chip">已获得 ⭐</span>' : '<span class="card-chip">答对测验赢 ⭐</span>')
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

/* ---------- 视图：景点 + 历史故事 + 小测验 ---------- */
function viewSpot(ids) {
  var c = getContinent(ids[0]);
  var s = spotOf(state);
  var backFn = c.special
    ? "go('continent','" + c.id + "')"
    : "go('city','" + ids[0] + "','" + ids[1] + "','" + ids[2] + "')";
  var backName = c.special ? c.name : getCity(ids[0], ids[1], ids[2]).name;

  var deep = '<button class="deep-toggle" onclick="toggleDeep(this)"><span>🔍 深入了解</span><span class="arrow">▼</span></button>'
    + '<div class="deep-body">'
    + s.deep.paras.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '<ul class="fact-list">' + s.deep.facts.map(function (f) { return '<li>' + f + '</li>'; }).join("") + '</ul>'
    + '</div>';

  var quiz = '<div class="panel quiz-box"><h2><span class="h2-emoji">🌟</span>爱宝小测验</h2>'
    + '<div class="quiz-q">' + s.quiz.q + '</div>'
    + '<div class="quiz-opts" id="quizOpts">'
    + s.quiz.options.map(function (o, i) {
      return '<button class="quiz-opt" onclick="answerQuiz(' + i + ',this)">' + String.fromCharCode(65 + i) + ". " + o + '</button>';
    }).join("")
    + '</div><div class="quiz-result" id="quizResult"></div></div>';

  return '<div class="screen">'
    + '<div class="spot-hero"><div class="spot-emoji-big">' + s.emoji + '</div>'
    + '<div class="spot-name">' + s.name + '</div>'
    + '<div class="spot-loc">📍 ' + s.loc + ' · ' + s.tagline + '</div></div>'
    + aibao("这就是" + s.name + "！先看看它是什么，再听我讲它背后的历史故事吧！")
    + '<div class="panel"><h2><span class="h2-emoji">👀</span>它是什么样的地方？</h2>'
    + s.desc.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + '<div class="panel story-box"><h2 class="story-title"><span class="h2-emoji">📜</span>历史故事：' + s.story.title + '</h2>'
    + s.story.paras.map(function (p) { return '<p>' + p + '</p>'; }).join("")
    + '</div>'
    + '<div class="panel">' + deep + '</div>'
    + quiz
    + '<div class="btn-row"><button class="btn btn-back" onclick="' + backFn + '">← 回到' + backName + '</button></div>'
    + '</div>';
}

/* ---------- 答题 ---------- */
function answerQuiz(i, btn) {
  var s = spotOf(state);
  var q = s.quiz;
  if (i === q.answer) {
    var opts = document.querySelectorAll("#quizOpts .quiz-opt");
    opts.forEach(function (o) { o.disabled = true; });
    btn.classList.add("correct");
    var res = document.getElementById("quizResult");
    var first = !hasStar(s.id);
    var star = "";
    if (first) {
      addStar(s.id);
      star = '<div class="quiz-got-star">🎉 答对啦！获得一颗星星 ⭐（' + getStars().length + "/" + allSpots().length + '）</div><br>';
    } else {
      star = '<div class="quiz-got-star">🎉 答对啦！（这颗星星你之前已经拿到过啦）</div><br>';
    }
    res.className = "quiz-result show good";
    res.innerHTML = star + "💡 " + q.explain;
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    var res2 = document.getElementById("quizResult");
    res2.className = "quiz-result show bad";
    res2.innerHTML = "🤔 再想想哦！提示：回到上面的故事里找一找答案～";
  }
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
