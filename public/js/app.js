import { STATUS, TAB_CONFIG, TAB_ORDER } from "./config.js";
import {
  clearHistory,
  loadCards,
  loadEditMode,
  loadHistory,
  resetCards,
  saveCards,
  saveEditMode,
  saveHistory,
  todayString
} from "./storage.js";
import {
  applyEditMode,
  applyTheme,
  collectCardData,
  createCard,
  createAddCard,
  getDom,
  namesText,
  renderHistory
} from "./ui.js";

const state = {
  currentTab: "meal",
  editMode: loadEditMode()
};

const dom = getDom();

function getConfig(tab = state.currentTab) {
  return TAB_CONFIG[tab];
}

function currentCards() {
  return collectCardData(dom);
}

function persistCards() {
  saveCards(state.currentTab, currentCards());
  saveEditMode(state.currentTab, state.editMode[state.currentTab]);
}

function renderCards(cards) {
  dom.cardGrid.innerHTML = "";

  const context = {
    currentTab: state.currentTab,
    editMode: () => state.editMode[state.currentTab],
    onChange: persistCards,
    onDelete: () => {
      persistCards();
      showMessage("카드를 삭제했어요.");
    },
    onLevelChange: (card, level) => {
      persistCards();
      animateFoodClick(card);

      if (level === 3) {
        celebrateSmall();
      }
    }
  };

  cards.forEach((cardData) => {
    dom.cardGrid.appendChild(createCard(cardData, context));
  });

  dom.cardGrid.appendChild(createAddCard(() => addCard(context)));
  applyEditMode(dom, state.editMode[state.currentTab]);
  animateCards([...dom.cardGrid.querySelectorAll(".child-card, .add-card")]);
}

function addCard(context) {
  const card = createCard({
    id: `${state.currentTab}-${Date.now()}`,
    name: "새친구",
    level: 0,
    photo: ""
  }, context);

  const addCardButton = dom.cardGrid.querySelector(".add-card");
  dom.cardGrid.insertBefore(card, addCardButton);
  persistCards();
  animateCards([card]);
}

function switchTab(tab) {
  if (!TAB_ORDER.includes(tab) || tab === state.currentTab) return;

  persistCards();
  state.currentTab = tab;
  applyTheme(dom, tab);
  renderCards(loadCards(tab));
  renderHistory(dom, loadHistory(tab));
  showMessage(`${getConfig().label} 탭으로 이동했어요.`);
}

function collectStatus() {
  const data = {
    fullNames: [],
    almostNames: [],
    effortNames: [],
    noneNames: [],
    totalCount: 0
  };

  currentCards().forEach((card) => {
    data.totalCount += 1;

    if (card.level === 3) data.fullNames.push(card.name);
    else if (card.level === 2) data.almostNames.push(card.name);
    else if (card.level === 1) data.effortNames.push(card.name);
    else data.noneNames.push(card.name);
  });

  data.fullCount = data.fullNames.length;
  data.almostCount = data.almostNames.length;
  data.effortCount = data.effortNames.length;
  data.noneCount = data.noneNames.length;

  return data;
}

function showFinalCheck() {
  const data = collectStatus();
  const label = getConfig().resultLabel;

  dom.result.innerHTML = `
    <strong>다 먹은 유아:</strong> ${data.fullCount}명<br>
    이름: ${namesText(data.fullNames)}<br><br>

    <strong>거의 다 먹었어요:</strong> ${data.almostCount}명<br>
    이름: ${namesText(data.almostNames)}<br><br>

    <strong>조금 먹었어요:</strong> ${data.effortCount}명<br>
    이름: ${namesText(data.effortNames)}<br><br>

    <strong>아직 ${label}을 먹지 않은 유아:</strong> ${data.noneCount}명<br>
    이름: ${namesText(data.noneNames)}<br><br>

    <strong>총 인원:</strong> ${data.totalCount}명
  `;

  animateResult();

  if (data.totalCount > 0 && data.fullCount === data.totalCount) {
    celebrateBig();
  }
}

function saveDailyRecord() {
  const date = dom.recordDate.value;

  if (!date) {
    window.alert("날짜를 먼저 선택해주세요.");
    return;
  }

  const data = collectStatus();
  const history = loadHistory(state.currentTab);
  const record = {
    date,
    fullNames: data.fullNames,
    almostNames: data.almostNames,
    effortNames: data.effortNames,
    noneNames: data.noneNames,
    fullCount: data.fullCount,
    almostCount: data.almostCount,
    effortCount: data.effortCount,
    noneCount: data.noneCount,
    totalCount: data.totalCount
  };

  const index = history.findIndex((item) => item.date === date);
  if (index >= 0) {
    history[index] = record;
  } else {
    history.push(record);
  }

  saveHistory(state.currentTab, history);
  renderHistory(dom, history);
  showMessage(`${date} 날짜 기록을 저장했어요.`);
}

function exportExcel() {
  const history = loadHistory(state.currentTab);

  if (!history.length) {
    window.alert("엑셀로 저장할 기록이 없어요.");
    return;
  }

  const rows = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => ({
      날짜: record.date,
      다먹은유아: namesText(record.fullNames),
      거의다먹었어요: namesText(record.almostNames),
      조금먹었어요: namesText(record.effortNames),
      먹지않은유아: namesText(record.noneNames),
      다먹음수: record.fullCount,
      거의다수: record.almostCount,
      조금수: record.effortCount,
      안먹음수: record.noneCount,
      총계: record.totalCount
    }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, getConfig().sheetName);
  XLSX.writeFile(workbook, `${getConfig().exportPrefix}_${todayString()}.xlsx`);
}

function resetToday() {
  if (!window.confirm("오늘 체크 상태를 모두 초기화할까요?")) return;

  dom.cardGrid.querySelectorAll(".child-card").forEach((card) => {
    card.dataset.level = "0";
    card.classList.remove("level-1", "level-2", "level-3");
    card.classList.add("level-0");
  });

  renderCards(currentCards().map((card) => ({ ...card, level: 0 })));
  persistCards();
  showMessage("오늘 체크 상태를 모두 초기화했어요.");
}

function resetToDefaultCards() {
  if (!window.confirm("현재 탭의 카드 구성을 기본 카드로 되돌릴까요?")) return;

  resetCards(state.currentTab);
  renderCards(loadCards(state.currentTab));
  persistCards();
  showMessage("기본 카드로 되돌렸어요.");
}

function clearCurrentHistory() {
  if (!window.confirm("현재 탭의 날짜별 기록을 모두 삭제할까요?")) return;

  clearHistory(state.currentTab);
  renderHistory(dom, []);
  showMessage("날짜별 기록을 모두 삭제했어요.");
}

function showMessage(message) {
  dom.result.textContent = message;
  animateResult();
}

function animateCards(cards) {
  if (!window.gsap) return;

  gsap.fromTo(
    cards,
    { opacity: 0, y: 16, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.34, stagger: 0.04, ease: "back.out(1.35)" }
  );
}

function animateFoodClick(card) {
  if (!window.gsap) return;

  gsap.fromTo(
    card.querySelector(".food-btn"),
    { scale: 0.92, rotate: -2 },
    { scale: 1, rotate: 0, duration: 0.3, ease: "elastic.out(1, 0.45)" }
  );
}

function animateResult() {
  if (!window.gsap) return;

  gsap.fromTo(
    dom.result,
    { opacity: 0.58, y: 8 },
    { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" }
  );
}

function celebrateSmall() {
  if (!window.confetti) return;

  confetti({
    particleCount: 28,
    spread: 52,
    startVelocity: 25,
    origin: { x: 0.5, y: 0.62 }
  });
}

function celebrateBig() {
  if (!window.confetti) return;

  confetti({
    particleCount: 120,
    spread: 78,
    startVelocity: 38,
    origin: { x: 0.5, y: 0.45 }
  });
}

function bindEvents() {
  dom.mealTab.addEventListener("click", () => switchTab("meal"));
  dom.milkTab.addEventListener("click", () => switchTab("milk"));
  dom.snackTab.addEventListener("click", () => switchTab("snack"));

  dom.editBtn.addEventListener("click", () => {
    state.editMode[state.currentTab] = !state.editMode[state.currentTab];
    applyEditMode(dom, state.editMode[state.currentTab]);
    persistCards();

    showMessage(
      state.editMode[state.currentTab]
        ? "수정 모드가 켜졌어요. 이름, 사진, 카드 추가/삭제가 가능해요."
        : "수정 모드가 꺼졌어요."
    );
  });

  dom.saveBtn.addEventListener("click", () => {
    persistCards();
    showMessage("현재 카드 정보를 저장했어요.");
  });

  dom.defaultBtn.addEventListener("click", resetToDefaultCards);
  dom.checkBtn.addEventListener("click", showFinalCheck);
  dom.resetBtn.addEventListener("click", resetToday);
  dom.saveRecordBtn.addEventListener("click", saveDailyRecord);
  dom.excelBtn.addEventListener("click", exportExcel);
  dom.clearHistoryBtn.addEventListener("click", clearCurrentHistory);
}

function init() {
  dom.recordDate.value = todayString();
  applyTheme(dom, state.currentTab);
  bindEvents();
  renderCards(loadCards(state.currentTab));
  renderHistory(dom, loadHistory(state.currentTab));
  animateResult();
}

init();
