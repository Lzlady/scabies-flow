const appEl = document.getElementById("app");
const homeBtn = document.getElementById("homeBtn");

const state = {
  page: "home",
  // 分層狀態
  isHighRisk: null,           // true/false
  prophylaxisDone: false,     // 預防性用藥是否完成（只做流程狀態）
  // 症狀判斷：無 / 有或不確定
  symptomChoice: null,        // "none" | "suspect"
  // 查檢表勾選（此版本只保留「是」，所以用 boolean）
  checklist: {},              // { key: true }
  // 群突發判斷（8週內≧2例）
  isOutbreak: null,           // true/false
};

if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    state.page = "home";
    render();
  });
}

function setPage(p){
  state.page = p;
  render();
}

/** --- 固定文案（依核可版本，不做內容改寫） --- **/
const HIGH_RISK_ITEMS = ["遊民","長期在外遊蕩","機構住民","入獄史","同住者有疥瘡"];

const CHECKLIST_BLOCKS = [
  {
    title: "接觸 / 標準防護措施",
    items: [
      "單獨病室感控隔離（準備屏風、污衣車〔感控污衣袋＋糯米袋〕）",
      "感控垃圾桶、床旁桌（耳溫槍、血壓計、感控垃圾袋、隔離衣、手套、水）",
      "個人防護裝備",
      "照護前洗手",
      "照護後脫除 PPE 並洗手",
      "照護順序（非感染個案→疑似→感染個案）",
    ]
  },
  {
    title: "藥物治療",
    items: [
      "依醫囑協助病人洗澡後塗抺疥瘡用藥",
      "疥瘡藥物須全身自脖子以下塗遍並持續監測皮膚狀況",
      "指（趾）甲剪短，剪刀單獨使用後以 60°C 以上熱水浸泡 30 分鐘",
    ]
  },
  {
    title: "檢查 / 轉床運送",
    items: [
      "移動及運送病人時需有防護措施與 PPE",
      "運送後使用當日稀釋之 1000ppm 漂白水擦拭、清消",
    ]
  },
  {
    title: "密切接觸者",
    items: [
      "預防性投藥 3 日（jaline lotion QD*3天）",
      "皮膚異常症狀監測",
      "追蹤 8 週",
    ]
  },
  {
    title: "衣物",
    items: [
      "每日更換衣物、床單、枕套、被褥",
      "建議穿著病人服、紙內褲",
      "個人衣物先以 60°C 以上熱水浸泡 30 分鐘後清洗",
    ]
  },
  {
    title: "枕頭",
    items: [
      "無法送洗，移除枕頭套後，枕心以塑膠袋密封靜置 2 週",
    ]
  },
  {
    title: "環境 / 床墊終期清消",
    items: [
      "病房單位環境先噴灑含除蟲菊之殺蟲劑，靜置 1 小時",
      "再以當日稀釋之 1000ppm 漂白水擦拭、清消",
      "非防水床墊先噴灑殺蟲劑後靜置 1 週，再進行清消",
    ]
  },
  {
    title: "訪客",
    items: [
      "禁止訪客；如需訪客時，予以衛教並協助正確穿著／脫除 PPE",
    ]
  },
  {
    title: "衛教",
    items: [
      "主動提供病人、家屬及主要照顧者疥瘡衛教單張與照護措施指導",
    ]
  }
];

/** 群突發處理流程（依既有內容呈現） **/
const OUTBREAK_STEPS = [
  "群突發單位完成「接觸者/密切接觸者名冊」造冊",
  "進行病房管制：暫停收案、暫停訪客、暫停職能治療等團體活動或評估於病房進行方式。",
  "全面檢視接觸者/密切接觸者皮膚是否有疥瘡疑似症狀：(1) 無：預防性投藥及追蹤 (2) 有：進一步評估或會診，如無法排除感染疑慮，則視為疥個案進行隔離治療處置。",
  "持續監測，如有新增疑似或確定疥瘡個案，滾動式調整隔離空間及感染管制措施。",
  "感管小組通報院區長官(感管專責醫師、主任、副院長、院長)、總院感染管制委員會副召集人、24 小時內通報衛生局，必要時召開緊急應變會議討論後續因應措施",
];

function render(){
  switch(state.page){
    case "home": return renderHome();
    case "risk": return renderRisk();
    case "prophylaxis": return renderProphylaxis();
    case "symptomGate": return renderSymptomGate();
    case "monitor": return renderMonitor();
    case "caseFlow": return renderCaseFlow();
    case "checklist": return renderChecklist();
    case "outbreakGate": return renderOutbreakGate();
    case "outbreak": return renderOutbreak();
    case "done": return renderDone();
    default: state.page="home"; return renderHome();
  }
}

function renderHome(){
  appEl.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:46px; margin-top:6px;">⌂</div>
      <div class="h1">疥瘡照護流程系統</div>
      <div class="notice">
        <div><b>本系統為流程輔助工具，不具醫療決策功能</b></div>
      </div>
      <button class="btn primary" id="startBtn" type="button">開始評估流程</button>
    </div>
  `;
  document.getElementById("startBtn").onclick = () => setPage("risk");
}

function renderRisk(){
  appEl.innerHTML = `
    <div class="h1">入院風險評估</div>
    <div class="notice warn">所有住院病人均需加強皮膚異常症狀監測</div>

    <div class="sub" style="font-size:18px; font-weight:900; color:var(--text);">
      請判斷：病人是否屬於以下高風險個案？
    </div>

    <div class="box">
      <ul class="list">
        ${HIGH_RISK_ITEMS.map(x=>`<li>${x}</li>`).join("")}
      </ul>
    </div>

    <div class="grid2">
      <button class="btn danger" id="yesHigh" type="button">是，屬於高風險個案</button>
      <button class="btn success" id="noHigh" type="button">否，非高風險個案</button>
    </div>
  `;

  document.getElementById("yesHigh").onclick = () => {
    state.isHighRisk = true;
    setPage("prophylaxis");
  };
  document.getElementById("noHigh").onclick = () => {
    state.isHighRisk = false;
    setPage("symptomGate");
  };
}

function renderProphylaxis(){
  appEl.innerHTML = `
    <div class="h1">高風險個案 - 預防性用藥</div>
    <div class="notice danger">高風險個案不進行症狀判斷，直接執行預防性用藥</div>

    <div class="box">
      <div style="font-weight:900; font-size:18px; margin-bottom:8px;">預防性用藥處置</div>
      <ul class="list">
        <li>使用藥物：<b>jaline lotion QD × 3天</b></li>
        <li>全身塗抹（自脖子以下）</li>
        <li>持續皮膚異常症狀監測</li>
      </ul>
    </div>

    <div class="notice warn">
      注意：如完成預防性用藥後出現疥瘡疑似症狀，請進入「疑似/確定個案處理流程」
    </div>

    <div class="grid2">
      <button class="btn success" id="donePro" type="button">已完成，進入症狀判斷</button>
      <button class="btn orange" id="goCase" type="button">出現疑似症狀，進入個案處理流程</button>
    </div>
  `;
  document.getElementById("donePro").onclick = () => {
    state.prophylaxisDone = true;
    setPage("symptomGate");
  };
  document.getElementById("goCase").onclick = () => setPage("caseFlow");
}

/** 第二層｜症狀判斷 **/
function renderSymptomGate(){
  const allowed = (state.isHighRisk === false) || state.prophylaxisDone === true;
  if(!allowed){
    setPage("risk");
    return;
  }

  appEl.innerHTML = `
    <div class="h1">症狀判斷</div>

    <div class="sub" style="font-size:18px; font-weight:900; color:var(--text);">
      是否有疥瘡疑似症狀？
    </div>

    <div class="grid2">
      <button class="btn success" id="symNone" type="button">無 → 持續監測</button>
      <button class="btn danger" id="symSus" type="button">有或不確定 → 進入個案處理流程</button>
    </div>
  `;

  document.getElementById("symNone").onclick = () => {
    state.symptomChoice = "none";
    setPage("monitor");
  };
  document.getElementById("symSus").onclick = () => {
    state.symptomChoice = "suspect";
    setPage("caseFlow");
  };
}

function renderMonitor(){
  appEl.innerHTML = `
    <div class="h1">持續監測</div>
    <div class="notice success">
      目前流程分支：<b>持續皮膚異常症狀監測</b>
    </div>

    <div class="box">
      <ul class="list">
        <li>持續監測皮膚異常症狀</li>
        <li>如出現疥瘡疑似症狀 → 依院內疑似/確定疥瘡個案處理流程</li>
      </ul>
    </div>

    <div class="grid2">
      <button class="btn orange" id="toCase" type="button">出現疑似症狀 → 進入個案處理流程</button>
      <button class="btn primary" id="finish" type="button">暫無異常 → 流程完成</button>
    </div>
  `;
  document.getElementById("toCase").onclick = () => setPage("caseFlow");
  document.getElementById("finish").onclick = () => setPage("done");
}

function renderCaseFlow(){
  appEl.innerHTML = `
    <div class="h1">疑似/確定疥瘡個案處理流程</div>
    <div class="notice warn">請依序執行以下步驟：</div>

    <div class="step">
      <div class="n">1</div>
      <div>
        <div class="t">異常事件通報</div>
        <div class="d">異常事件通報／症狀監測通報專區／症狀監測事件</div>
      </div>
    </div>

    <div class="step">
      <div class="n">2</div>
      <div>
        <div class="t">執行感染管制措施查檢表</div>
        <div class="d"><button class="btn primary" id="openChecklist" type="button" style="max-width:220px;">查看查檢表</button></div>
      </div>
    </div>

    <div class="step">
      <div class="n">3</div>
      <div>
        <div class="t">會診皮膚科醫師</div>
        <div class="d">建議會診皮膚科醫師診視以排除或確認診斷</div>
      </div>
    </div>

    <div class="step">
      <div class="n">4</div>
      <div>
        <div class="t">依醫囑予疥瘡治療藥物及監測皮膚狀況</div>
      </div>
    </div>

    <div class="step">
      <div class="n">5</div>
      <div>
        <div class="t">密切接觸者預防性投藥及追蹤 8 週</div>
      </div>
    </div>

    <div class="step">
      <div class="n">6</div>
      <div>
        <div class="t">持續監測新增個案</div>
        <div class="d">如有疑似或確定疥瘡群突發（8週內≧2例）→ 依群突發處理流程辦理</div>
      </div>
    </div>

    <div class="step">
      <div class="n">7</div>
      <div>
        <div class="t">完成治療 → 解除隔離 → 環境終期清消</div>
      </div>
    </div>

    <div class="grid2">
      <button class="btn orange" id="goOutbreakGate" type="button">判斷是否群突發（8週內≧2例）</button>
      <button class="btn success" id="caseDone" type="button">已完成，流程完成</button>
    </div>
  `;

  document.getElementById("openChecklist").onclick = () => setPage("checklist");
  document.getElementById("goOutbreakGate").onclick = () => setPage("outbreakGate");
  document.getElementById("caseDone").onclick = () => setPage("done");
}

function renderOutbreakGate(){
  appEl.innerHTML = `
    <div class="h1">群突發判斷</div>
    <div class="notice danger"><b>疑似或確定疥瘡群突發（8 週內≧2 例）</b></div>

    <div class="grid2">
      <button class="btn danger" id="yesOut" type="button">是 → 進入群突發處理流程</button>
      <button class="btn success" id="noOut" type="button">否 → 返回個案處理流程</button>
    </div>
  `;
  document.getElementById("yesOut").onclick = () => { state.isOutbreak = true; setPage("outbreak"); };
  document.getElementById("noOut").onclick = () => { state.isOutbreak = false; setPage("caseFlow"); };
}

function renderOutbreak(){
  appEl.innerHTML = `
    <div class="h1">疑似/確定疥瘡群突發處理流程</div>
    <div class="notice warn">請依序執行以下步驟：</div>

    ${OUTBREAK_STEPS.map((t,i)=>`
      <div class="step">
        <div class="n">${i+1}</div>
        <div>
          <div class="t">${t}</div>
        </div>
      </div>
    `).join("")}

    <div class="notice">
      疥瘡潛伏期可達 8 週，持續監測至最後 1 位新增個案期滿結案：<br/>
      ・單一事件：追蹤 8 週<br/>
      ・群聚事件：追蹤 16 週
    </div>

    <div class="grid2">
      <button class="btn primary" id="backCase" type="button">返回個案處理流程</button>
      <button class="btn success" id="finishOut" type="button">流程完成</button>
    </div>
  `;
  document.getElementById("backCase").onclick = () => setPage("caseFlow");
  document.getElementById("finishOut").onclick = () => setPage("done");
}

function renderChecklist(){
  const flatKeys = CHECKLIST_BLOCKS.flatMap(b => b.items.map((_, idx) => `${b.title}__${idx}`));
  const total = flatKeys.length;
  const answered = flatKeys.filter(k => state.checklist[k] === true).length;
  const pct = total ? Math.round((answered/total)*100) : 0;

  appEl.innerHTML = `
    <div id="checklistAlert" class="alert hidden">
      尚未完成查檢表：請確認每一項皆已選擇「是」，才可進入下一步。
    </div>

    <div class="h1">感染管制措施查檢表</div>

    <div class="notice success">完成度：<b>${answered}/${total}</b>（${pct}%）</div>

    ${CHECKLIST_BLOCKS.map(block => {
      const items = block.items.map((text, i) => {
        const key = `${block.title}__${i}`;
        const isYes = state.checklist[key] === true;

        return `
          <div class="row">
            <div class="label"> ${text}</div>
            <div class="yn">
              <button class="pill ${isYes ? "active" : ""}" data-k="${key}" data-v="yes">是</button>
            </div>
          </div>
        `;
      }).join("");

      const blockAnswered = block.items.filter((_,i)=>state.checklist[`${block.title}__${i}`] === true).length;
      return `
        <div class="checkgroup">
          <div class="head">
            <div>${block.title}</div>
            <div style="color:var(--muted); font-weight:800;">${blockAnswered}/${block.items.length}</div>
          </div>
          <div class="body">${items}</div>
        </div>
      `;
    }).join("")}

    <div class="footerActions">
      <button class="btn ghost" id="backCase2" type="button">返回個案處理流程</button>
      <button class="btn primary" id="finishChecklist" type="button">完成，返回</button>
    </div>
  `;

  // 點選「是」：切換 true/false（你若不想取消，就改成 state.checklist[k] = true;）
  appEl.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const k = e.currentTarget.dataset.k;
      state.checklist[k] = !state.checklist[k]; // 可切換
      // 重新點選後把警示先收起來（避免一直紅）
      const alertEl = document.getElementById("checklistAlert");
      if (alertEl) alertEl.classList.add("hidden");
      render();
    });
  });

  document.getElementById("backCase2").onclick = () => setPage("caseFlow");

  document.getElementById("finishChecklist").onclick = () => {
    const allChecked = flatKeys.every(k => state.checklist[k] === true);

    if (!allChecked) {
      const alertEl = document.getElementById("checklistAlert");
      if (alertEl) {
        alertEl.textContent = `尚未完成查檢表：已完成 ${answered}/${total}，請確認每一項皆已選擇「是」，才可進入下一步。`;
        alertEl.classList.remove("hidden");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 通過 → 收起警示 → 返回
    const alertEl = document.getElementById("checklistAlert");
    if (alertEl) alertEl.classList.add("hidden");

    setPage("caseFlow");
  };
}

function renderDone(){
  appEl.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:52px; margin-top:6px;">✅</div>
      <div class="h1">流程完成</div>

      <div class="notice success" style="text-align:left;">
        <b>後續注意事項：</b>
        <ul class="list">
          <li>持續監測皮膚異常症狀</li>
          <li>如為確定個案，完成治療期程後需經皮膚科醫師評估解除隔離</li>
          <li>解除隔離後需進行環境終期清消</li>
          <li>密切接觸者需追蹤 8 週</li>
        </ul>
      </div>

      <button class="btn primary" id="restart" type="button" style="max-width:260px;">開始新的評估</button>
    </div>
  `;

  document.getElementById("restart").onclick = () => {
    state.isHighRisk = null;
    state.prophylaxisDone = false;
    state.symptomChoice = null;
    state.isOutbreak = null;
    state.checklist = {};
    setPage("risk");
  };
}

// ✅ 初始化：避免空白頁
render();
