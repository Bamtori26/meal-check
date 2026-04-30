import { STATUS, TAB_CONFIG, TAB_ORDER } from "./config.js";

export function getDom() {
  return {
    body: document.body,
    mainTitle: document.getElementById("mainTitle"),
    subtitle: document.getElementById("subtitle"),
    mealTab: document.getElementById("mealTab"),
    milkTab: document.getElementById("milkTab"),
    snackTab: document.getElementById("snackTab"),
    editBtn: document.getElementById("editBtn"),
    saveBtn: document.getElementById("saveBtn"),
    defaultBtn: document.getElementById("defaultBtn"),
    cardGrid: document.getElementById("cardGrid"),
    checkBtn: document.getElementById("checkBtn"),
    resetBtn: document.getElementById("resetBtn"),
    result: document.getElementById("result"),
    recordDate: document.getElementById("recordDate"),
    saveRecordBtn: document.getElementById("saveRecordBtn"),
    excelBtn: document.getElementById("excelBtn"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    historyTitle: document.getElementById("historyTitle"),
    historyWrap: document.getElementById("historyWrap")
  };
}

export function createEl(tag, options = {}) {
  const el = document.createElement(tag);

  if (options.className) el.className = options.className;
  if (options.text !== undefined) el.textContent = options.text;
  if (options.html !== undefined) el.innerHTML = options.html;

  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  return el;
}

export function placeholderPhoto(name) {
  const first = encodeURIComponent((name || "♡").slice(0, 1));
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#fff2ad"/>
          <stop offset="0.52" stop-color="#ffd5e7"/>
          <stop offset="1" stop-color="#cfeeff"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)"/>
      <circle cx="43" cy="52" r="7" fill="#4f465f"/>
      <circle cx="77" cy="52" r="7" fill="#4f465f"/>
      <path d="M43 74 Q60 89 77 74" fill="none" stroke="#4f465f" stroke-width="7" stroke-linecap="round"/>
      <text x="60" y="36" text-anchor="middle" font-size="25" font-weight="900" fill="#ef6aa6">${first}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function applyTheme(dom, tab) {
  const config = TAB_CONFIG[tab];

  TAB_ORDER.forEach((item) => {
    dom.body.classList.remove(TAB_CONFIG[item].bodyClass);
  });

  dom.body.classList.add(config.bodyClass);
  dom.mainTitle.textContent = config.title;
  dom.subtitle.textContent = config.subtitle;
  dom.resetBtn.textContent = config.resetText;
  dom.historyTitle.textContent = config.historyTitle;

  TAB_ORDER.forEach((item) => {
    const btn = dom[`${item}Tab`];
    const active = item === tab;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

export function updateCardVisual(card, tab, animateSlice = false, previousLevel = 0) {
  const level = Number(card.dataset.level || 0);
  const badge = card.querySelector(".status-badge");
  const foodButton = card.querySelector(".food-btn");
  const help = card.querySelector(".food-help");

  card.classList.remove("level-0", "level-1", "level-2", "level-3");
  card.classList.add(`level-${level}`);

  badge.className = `status-badge level-${level}`;
  badge.textContent = STATUS[level].badgeText;
  help.textContent = `${STATUS[level].helpText} 체크`;
  foodButton.setAttribute("aria-label", `${TAB_CONFIG[tab].assetAlt}, ${STATUS[level].label}`);

  card.querySelectorAll(".progress-dots span").forEach((dot, index) => {
    dot.classList.toggle("active", index < level);
  });

  if (animateSlice && level > previousLevel) {
    const slice = card.querySelector(`.slice-${level}`);
    slice.classList.remove("disappearing");
    void slice.offsetWidth;
    slice.classList.add("disappearing");
  }
}

export function cardToData(card) {
  return {
    id: card.dataset.id,
    name: card.querySelector(".name").value.trim() || "이름",
    level: Number(card.dataset.level || 0),
    photo: card.dataset.photo || ""
  };
}

export function collectCardData(dom) {
  return [...dom.cardGrid.querySelectorAll(".child-card")].map(cardToData);
}

export function createCard(data, context) {
  const { currentTab, editMode, onChange, onDelete, onLevelChange } = context;
  const config = TAB_CONFIG[currentTab];
  const card = createEl("article", {
    className: "child-card",
    attrs: {
      "data-id": data.id || `${currentTab}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      "data-level": Number(data.level || 0),
      "data-photo": data.photo || ""
    }
  });

  const deleteBtn = createEl("button", {
    className: "delete-card",
    text: "×",
    attrs: { type: "button", "aria-label": "카드 삭제" }
  });

  const badge = createEl("div", { className: "status-badge" });
  const photo = createEl("img", {
    className: "photo",
    attrs: {
      alt: "유아 사진",
      src: data.photo || placeholderPhoto(data.name)
    }
  });

  const nameInput = createEl("input", {
    className: "name",
    attrs: {
      type: "text",
      value: data.name || "이름",
      maxlength: "12",
      disabled: "disabled"
    }
  });

  const uploadArea = createEl("div", { className: "upload-area" });
  const uploadLabel = createEl("label", { className: "upload-label", text: "사진 변경" });
  const photoInput = createEl("input", {
    className: "photo-input",
    attrs: { type: "file", accept: "image/*" }
  });
  const uploadHelp = createEl("div", { className: "upload-help", text: "수정 모드에서 이름과 사진을 바꿀 수 있어요." });

  uploadLabel.appendChild(photoInput);
  uploadArea.append(uploadLabel, uploadHelp);

  const foodZone = createEl("div", { className: "food-zone" });
  const foodButton = createEl("button", {
    className: "food-btn",
    attrs: { type: "button" }
  });
  foodButton.appendChild(createEl("span", {
    className: "food-empty",
    html: "다<br>먹었어요"
  }));

  [1, 2, 3].forEach((sliceNumber) => {
    const slice = createEl("span", {
      className: `food-slice slice-${sliceNumber}`,
      attrs: { "aria-hidden": "true" }
    });
    slice.appendChild(createEl("img", {
      attrs: {
        src: config.asset,
        alt: ""
      }
    }));
    foodButton.appendChild(slice);
  });

  const help = createEl("div", { className: "food-help" });
  const dots = createEl("div", { className: "progress-dots", attrs: { "aria-hidden": "true" } });
  dots.append(createEl("span"), createEl("span"), createEl("span"));
  foodZone.append(foodButton, help, dots);

  card.append(deleteBtn, badge, photo, nameInput, uploadArea, foodZone);

  foodButton.addEventListener("click", () => {
    if (editMode()) return;

    const previousLevel = Number(card.dataset.level || 0);
    const nextLevel = (previousLevel + 1) % 4;
    card.dataset.level = String(nextLevel);
    updateCardVisual(card, currentTab, true, previousLevel);
    onLevelChange(card, nextLevel);
  });

  deleteBtn.addEventListener("click", () => {
    if (!window.confirm("이 카드를 삭제할까요?")) return;
    card.remove();
    onDelete();
  });

  nameInput.addEventListener("input", () => {
    if (!card.dataset.photo) {
      photo.src = placeholderPhoto(nameInput.value);
    }
    onChange();
  });

  photoInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      card.dataset.photo = reader.result;
      photo.src = reader.result;
      onChange();
    };
    reader.readAsDataURL(file);
  });

  updateCardVisual(card, currentTab);
  applyEditModeToCard(card, editMode());
  return card;
}

export function createAddCard(onAdd) {
  const add = createEl("button", {
    className: "add-card",
    attrs: { type: "button" }
  });

  add.innerHTML = `
    <div>
      <div class="plus">+</div>
      <div class="add-title">유아 카드 추가</div>
      <div class="add-guide">수정 모드에서 새 카드를 만들 수 있어요.</div>
    </div>
  `;
  add.addEventListener("click", onAdd);
  return add;
}

export function applyEditModeToCard(card, editing) {
  const nameInput = card.querySelector(".name");
  card.classList.toggle("editing", editing);

  if (editing) {
    nameInput.removeAttribute("disabled");
  } else {
    nameInput.setAttribute("disabled", "disabled");
  }
}

export function applyEditMode(dom, editing) {
  dom.editBtn.classList.toggle("active", editing);
  dom.editBtn.textContent = editing ? "수정 완료" : "카드 수정";

  dom.cardGrid.querySelectorAll(".child-card").forEach((card) => {
    applyEditModeToCard(card, editing);
  });

  const addCard = dom.cardGrid.querySelector(".add-card");
  if (addCard) addCard.classList.toggle("show", editing);
}

export function renderHistory(dom, history) {
  dom.historyWrap.innerHTML = "";

  if (!history.length) {
    dom.historyWrap.appendChild(createEl("div", {
      className: "empty-history",
      text: "아직 저장된 날짜별 기록이 없어요."
    }));
    return;
  }

  const table = createEl("table", { className: "history-table" });
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  [
    "날짜",
    "다 먹은 유아",
    "거의 다 먹었어요",
    "조금 먹었어요",
    "먹지 않은 유아",
    "다 먹음 수",
    "거의 다 수",
    "조금 수",
    "안 먹음 수",
    "총계"
  ].forEach((title) => {
    headRow.appendChild(createEl("th", { text: title }));
  });

  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  [...history]
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((record) => {
      const row = document.createElement("tr");
      [
        record.date,
        namesText(record.fullNames),
        namesText(record.almostNames),
        namesText(record.effortNames),
        namesText(record.noneNames),
        record.fullCount,
        record.almostCount,
        record.effortCount,
        record.noneCount,
        record.totalCount
      ].forEach((value) => {
        row.appendChild(createEl("td", { text: String(value) }));
      });
      tbody.appendChild(row);
    });

  table.appendChild(tbody);
  dom.historyWrap.appendChild(table);
}

export function namesText(names) {
  return names.length ? names.join(", ") : "없음";
}
