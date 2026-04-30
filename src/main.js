if (!window.__mealSnackCheckInitialized) {
  window.__mealSnackCheckInitialized = true;

const DOM = {
      cardList: document.getElementById("cardList"),
      resultText: document.getElementById("resultText"),
      recordDate: document.getElementById("recordDate"),
      historyTableWrap: document.getElementById("historyTableWrap"),

      mainTitle: document.getElementById("mainTitle"),
      historyTitle: document.getElementById("historyTitle"),

      mealTabBtn: document.getElementById("mealTabBtn"),
      milkTabBtn: document.getElementById("milkTabBtn"),
      snackTabBtn: document.getElementById("snackTabBtn"),

      editModeBtn: document.getElementById("editModeBtn"),
      saveBtn: document.getElementById("saveBtn"),
      clearSaveBtn: document.getElementById("clearSaveBtn"),

      finalCheckBtn: document.getElementById("finalCheckBtn"),
      resetBtn: document.getElementById("resetBtn"),

      saveRecordBtn: document.getElementById("saveRecordBtn"),
      exportExcelBtn: document.getElementById("exportExcelBtn"),
      clearRecordBtn: document.getElementById("clearRecordBtn")
    };

    const DEFAULT_PHOTO_SIZE = 200;

    const STORAGE = {
      meal: {
        cardKey: "meal_check_children_data_v1",
        historyKey: "meal_check_daily_history_v1",
        editModeKey: "meal_check_edit_mode_meal_v1",
        sequenceKey: "meal_check_card_sequence_meal_v1"
      },
      milk: {
        cardKey: "milk_check_children_data_v9",
        historyKey: "milk_check_daily_history_v9",
        editModeKey: "milk_check_edit_mode_milk_v2",
        sequenceKey: "milk_check_card_sequence_milk_v2"
      },
      snack: {
        cardKey: "snack_check_children_data_v2",
        historyKey: "snack_check_daily_history_v2",
        editModeKey: "snack_check_edit_mode_snack_v2",
        sequenceKey: "snack_check_card_sequence_snack_v2"
      }
    };

    const TAB_CONFIG = {
      meal: {
        title: "🍱 급식 먹기 체크판 🌈",
        historyTitle: "📒 날짜별 급식 기록",
        idleText: "급식판을 눌러 먹어보아요!",
        doneText: "✅ 다 먹었어요",
        resultLabel: "급식",
        exportPrefix: "급식먹기기록",
        addTileText: "급식 카드 추가",
        resetText: "오늘 급식 체크 초기화",
        sheetName: "급식기록"
      },
      milk: {
        title: "🥛 우유 먹기 체크판 🌈",
        historyTitle: "📒 날짜별 우유 기록",
        idleText: "우유컵을 눌러 마셔보아요!",
        doneText: "✅ 다 마셨어요",
        resultLabel: "우유",
        exportPrefix: "우유먹기기록",
        addTileText: "우유 카드 추가",
        resetText: "오늘 우유 체크 초기화",
        sheetName: "우유기록"
      },
      snack: {
        title: "🍪 간식 먹기 체크판 🌈",
        historyTitle: "📒 날짜별 간식 기록",
        idleText: "쿠키를 눌러 먹어보아요!",
        doneText: "✅ 다 먹었어요",
        resultLabel: "간식",
        exportPrefix: "간식먹기기록",
        addTileText: "간식 카드 추가",
        resetText: "오늘 간식 체크 초기화",
        sheetName: "간식기록"
      }
    };

    const ITEM_ASSETS = {
      meal: {
        src: "assets/images/cute-samgak-kimbap.png",
        alt: "귀여운 삼각김밥"
      },
      milk: {
        src: "assets/images/cute-milk-cup.png",
        alt: "귀여운 우유컵"
      },
      snack: {
        src: "assets/images/cute-cookie.png",
        alt: "귀여운 쿠키"
      }
    };

    const TAB_ORDER = ["meal", "milk", "snack"];

    const STATUS_CONFIG = {
      0: { className: "idle", text: "" },
      1: { className: "effort", text: "👏 노력했어요" },
      2: { className: "almost", text: "🌟 거의 다 먹었어요" },
      3: { className: "done", text: "✅ 다 먹었어요" }
    };

    const appState = {
      currentTab: "milk",
      editModeByTab: {
        meal: false,
        milk: false,
        snack: false
      },
      cardSequenceByTab: {
        meal: 1,
        milk: 1,
        snack: 1
      }
    };

    function getCurrentStorage() {
      return STORAGE[appState.currentTab];
    }

    function getCurrentTabConfig() {
      return TAB_CONFIG[appState.currentTab];
    }

    function getCurrentEditMode() {
      return appState.editModeByTab[appState.currentTab];
    }

    function setCurrentEditMode(value) {
      appState.editModeByTab[appState.currentTab] = value;
      localStorage.setItem(getCurrentStorage().editModeKey, JSON.stringify(value));
    }

    function getTodayString() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    function sanitizeNameInput(value) {
      return String(value ?? "")
        .replace(/[<>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 10);
    }

    function getNormalizedLevel(value) {
      const parsed = Number(value);
      return [0, 1, 2, 3].includes(parsed) ? parsed : 0;
    }

    function createElement(tagName, options = {}) {
      const element = document.createElement(tagName);

      if (options.className) element.className = options.className;
      if (options.text !== undefined) element.textContent = options.text;
      if (options.html !== undefined) element.innerHTML = options.html;
      if (options.type !== undefined) element.type = options.type;
      if (options.value !== undefined) element.value = options.value;
      if (options.maxlength !== undefined) element.maxLength = options.maxlength;
      if (options.disabled !== undefined) element.disabled = options.disabled;
      if (options.src !== undefined) element.src = options.src;
      if (options.alt !== undefined) element.alt = options.alt;
      if (options.accept !== undefined) element.accept = options.accept;
      if (options.title !== undefined) element.title = options.title;

      if (options.dataset) {
        Object.entries(options.dataset).forEach(([key, value]) => {
          element.dataset[key] = value;
        });
      }

      return element;
    }

    function getDefaultCards(tab) {
      return [
        createDefaultCard(tab, "아이1", `${tab}_kid1`),
        createDefaultCard(tab, "아이2", `${tab}_kid2`),
        createDefaultCard(tab, "아이3", `${tab}_kid3`)
      ];
    }

    function createDefaultCard(tab, name, seed) {
      return {
        id: `default_${seed}`,
        name,
        photo: `https://picsum.photos/seed/${seed}/${DEFAULT_PHOTO_SIZE}/${DEFAULT_PHOTO_SIZE}`,
        level: 0
      };
    }

    function loadEditModeForTab(tab) {
      const saved = localStorage.getItem(STORAGE[tab].editModeKey);
      if (saved === null) return false;

      try {
        return JSON.parse(saved);
      } catch {
        return false;
      }
    }

    function loadCardSequence(tab) {
      const saved = localStorage.getItem(STORAGE[tab].sequenceKey);
      const parsed = Number(saved);
      appState.cardSequenceByTab[tab] = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
    }

    function getNextCardId(tab = appState.currentTab) {
      const id = `${tab}_card_${appState.cardSequenceByTab[tab]}`;
      appState.cardSequenceByTab[tab] += 1;
      localStorage.setItem(STORAGE[tab].sequenceKey, String(appState.cardSequenceByTab[tab]));
      return id;
    }

    function normalizeCardData(tab, rawCard, index) {
      return {
        id: rawCard?.id || `${tab}_migrated_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: sanitizeNameInput(rawCard?.name) || `아이${index + 1}`,
        photo: rawCard?.photo || `https://picsum.photos/seed/${tab}_fallback${index}/${DEFAULT_PHOTO_SIZE}/${DEFAULT_PHOTO_SIZE}`,
        level: getNormalizedLevel(rawCard?.level ?? rawCard?.drinkLevel)
      };
    }

    function normalizeHistoryRecord(rawRecord) {
      const safeArray = (value) => Array.isArray(value)
        ? value.map((name) => sanitizeNameInput(name) || "이름없음")
        : [];

      const fullNames = safeArray(rawRecord?.fullNames);
      const almostNames = safeArray(rawRecord?.almostNames);
      const effortNames = safeArray(rawRecord?.effortNames);
      const noneNames = safeArray(rawRecord?.noneNames);

      return {
        date: String(rawRecord?.date || ""),
        fullNames,
        almostNames,
        effortNames,
        noneNames,
        fullCount: Number(rawRecord?.fullCount ?? fullNames.length) || 0,
        almostCount: Number(rawRecord?.almostCount ?? almostNames.length) || 0,
        effortCount: Number(rawRecord?.effortCount ?? effortNames.length) || 0,
        noneCount: Number(rawRecord?.noneCount ?? noneNames.length) || 0,
        totalCount: Number(
          rawRecord?.totalCount ??
          fullNames.length + almostNames.length + effortNames.length + noneNames.length
        ) || 0
      };
    }

    function loadCardDataFromLocalStorage() {
      const savedData = localStorage.getItem(getCurrentStorage().cardKey);
      if (!savedData) return null;

      try {
        const parsed = JSON.parse(savedData);
        if (!Array.isArray(parsed)) return null;
        return parsed.map((item, index) => normalizeCardData(appState.currentTab, item, index));
      } catch (error) {
        console.error("카드 데이터 읽기 오류", error);
        return null;
      }
    }

    function saveCardDataToLocalStorage() {
      const cards = [...DOM.cardList.querySelectorAll(".child-card")];
      const data = cards.map((card) => ({
        id: card.dataset.cardId || getNextCardId(),
        name: getCardName(card),
        photo: card.querySelector(".child-photo").src,
        level: getNormalizedLevel(card.dataset.level)
      }));

      try {
        localStorage.setItem(getCurrentStorage().cardKey, JSON.stringify(data));
        localStorage.setItem(getCurrentStorage().editModeKey, JSON.stringify(getCurrentEditMode()));
      } catch (error) {
        alert("사진이 너무 커서 저장되지 않았어요. 더 작은 사진으로 바꿔주세요.");
        console.error(error);
      }
    }

    function loadHistoryData() {
      const saved = localStorage.getItem(getCurrentStorage().historyKey);
      if (!saved) return [];

      try {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed)) return [];
        return parsed.map(normalizeHistoryRecord).filter((record) => record.date);
      } catch (error) {
        console.error("기록 데이터 읽기 오류", error);
        return [];
      }
    }

    function saveHistoryData(historyArray) {
      const normalized = historyArray
        .map(normalizeHistoryRecord)
        .filter((record) => record.date);

      localStorage.setItem(getCurrentStorage().historyKey, JSON.stringify(normalized));
    }

    function getCardName(card) {
      const input = card.querySelector(".name-input");
      return sanitizeNameInput(input?.value) || "이름없음";
    }

    function resizeImageForStorage(file, maxWidth = 220, maxHeight = 220, quality = 0.75) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          const img = new Image();

          img.onload = () => {
            let { width, height } = img;
            const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
            const newWidth = Math.round(width * ratio);
            const newHeight = Math.round(height * ratio);

            const canvas = document.createElement("canvas");
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            resolve(canvas.toDataURL("image/jpeg", quality));
          };

          img.onerror = () => reject(new Error("이미지 로드 실패"));
          reader.onerror = () => reject(new Error("파일 읽기 실패"));
          img.src = event.target.result;
        };

        reader.readAsDataURL(file);
      });
    }

    function getItemHTML(level = 0) {
      const asset = ITEM_ASSETS[appState.currentTab];
      const normalizedLevel = getNormalizedLevel(level);

      if (appState.currentTab === "milk") {
        const fillByLevel = [46, 31, 16, 0];
        const fillStyle = "--item-fill: " + fillByLevel[normalizedLevel] + "%; --fill-left: 30%; --fill-right: 28%; --fill-bottom: 19%;";
        return `
          <span class="item-empty">다<br>마셨어요</span>
          <span class="item-visual fill-stage milk-stage" aria-hidden="true">
            <span class="item-fill" style="${fillStyle}"></span>
            <img class="item-image" src="${asset.src}" alt="">
            <span class="milk-shine"></span>
          </span>
        `;
      }

      if (appState.currentTab === "meal") {
        return `
          <span class="item-empty">다<br>먹었어요</span>
          <span class="item-visual meal-stage" aria-hidden="true">
            <img class="item-image" src="${asset.src}" alt="">
            <span class="meal-eaten-edge"></span>
            <span class="cookie-crumb crumb-1"></span>
            <span class="cookie-crumb crumb-2"></span>
            <span class="cookie-crumb crumb-3"></span>
          </span>
        `;
      }

      return `
        <span class="item-empty">다<br>먹었어요</span>
        <span class="item-visual cookie-stage" aria-hidden="true">
          <img class="item-image" src="${asset.src}" alt="">
          <span class="cookie-eaten-edge"></span>
          <span class="cookie-crumb crumb-1"></span>
          <span class="cookie-crumb crumb-2"></span>
          <span class="cookie-crumb crumb-3"></span>
        </span>
      `;
    }

    function updateStatusBadge(card, level) {
      const badge = card.querySelector(".status-badge");
      const normalizedLevel = getNormalizedLevel(level);
      const config = STATUS_CONFIG[normalizedLevel];
      const idleText = getCurrentTabConfig().idleText;

      badge.className = "status-badge";
      badge.classList.add(config.className);
      badge.textContent = normalizedLevel === 0
        ? idleText
        : normalizedLevel === 3
          ? getCurrentTabConfig().doneText
          : config.text;
    }

    function updateCardByLevel(card) {
      const level = getNormalizedLevel(card.dataset.level);
      const itemBtn = card.querySelector(".item-btn");
      const asset = ITEM_ASSETS[appState.currentTab];
      itemBtn.classList.remove("level-0", "level-1", "level-2", "level-3");
      itemBtn.classList.add(`level-${level}`);
      itemBtn.innerHTML = getItemHTML(level);
      itemBtn.setAttribute("aria-label", `${asset.alt} ${STATUS_CONFIG[level].text || getCurrentTabConfig().idleText}`);

      card.classList.remove("done", "partial-one", "partial-two");
      if (level === 1) card.classList.add("partial-one");
      if (level === 2) card.classList.add("partial-two");
      if (level === 3) card.classList.add("done");

      updateStatusBadge(card, level);
    }

    function animateCards(cards) {
      if (!window.gsap) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 26, scale: 0.9, rotate: -1.5 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.48,
          stagger: 0.055,
          ease: "back.out(1.7)"
        }
      );
    }

    function animateResultBox() {
      if (!window.gsap) return;

      gsap.fromTo(
        DOM.resultText,
        { opacity: 0.55, y: 10, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: "power2.out" }
      );
    }

    function sparkleBurst(target) {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const colors = ["#ff4f94", "#ffbe0b", "#7f8cff", "#00b7a8", "#ffffff"];

      for (let index = 0; index < 14; index += 1) {
        const spark = document.createElement("span");
        spark.className = "spark";
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;
        spark.style.setProperty("--spark-color", colors[index % colors.length]);
        document.body.appendChild(spark);

        if (window.gsap) {
          gsap.to(spark, {
            x: Math.cos(index) * (38 + Math.random() * 42),
            y: Math.sin(index * 1.7) * (32 + Math.random() * 46),
            opacity: 0,
            scale: 0,
            duration: 0.62,
            ease: "power2.out",
            onComplete: () => spark.remove()
          });
        } else {
          spark.remove();
        }
      }
    }

    function animateItemChange(card, previousLevel, nextLevel) {
      const itemBtn = card.querySelector(".item-btn");

      card.classList.remove("combo");
      void card.offsetWidth;
      card.classList.add("combo");

      if (nextLevel > previousLevel) {
        const visual = itemBtn.querySelector(".item-visual");
        if (visual) {
          visual.classList.remove("burst-out");
          void visual.offsetWidth;
          visual.classList.add("burst-out");
        }

        if (appState.currentTab === "meal" && window.gsap) {
          const rect = itemBtn.getBoundingClientRect();
          const colors = ["#ffbe0b", "#43c463", "#ff7f7f", "#7f8cff", "#ffffff"];
          for (let index = 0; index < 18; index += 1) {
            const bit = document.createElement("span");
            bit.className = "spark";
            bit.style.left = `${rect.left + rect.width * 0.72}px`;
            bit.style.top = `${rect.top + rect.height * 0.5}px`;
            bit.style.setProperty("--spark-color", colors[index % colors.length]);
            document.body.appendChild(bit);

            gsap.to(bit, {
              x: 38 + Math.random() * 74,
              y: -42 + Math.random() * 84,
              rotation: Math.random() * 180,
              opacity: 0,
              scale: 0,
              duration: 0.72,
              ease: "power3.out",
              onComplete: () => bit.remove()
            });
          }
        }
      }

      sparkleBurst(itemBtn);

      if (window.gsap) {
        gsap.fromTo(
          itemBtn,
          { scale: 0.82, rotate: -7 },
          { scale: 1, rotate: 0, duration: 0.45, ease: "elastic.out(1, 0.45)" }
        );
      }

      if (nextLevel === 3 && window.confetti) {
        confetti({
          particleCount: 46,
          spread: 60,
          startVelocity: 30,
          origin: {
            x: (itemBtn.getBoundingClientRect().left + itemBtn.offsetWidth / 2) / window.innerWidth,
            y: (itemBtn.getBoundingClientRect().top + itemBtn.offsetHeight / 2) / window.innerHeight
          }
        });
      }
    }

    function celebrateAllComplete() {
      if (!window.confetti) return;

      confetti({
        particleCount: 150,
        spread: 82,
        startVelocity: 42,
        origin: { x: 0.5, y: 0.45 }
      });
    }

    function buildCard(cardData, index) {
      const normalized = normalizeCardData(appState.currentTab, cardData, index);

      const card = createElement("div", {
        className: "child-card",
        dataset: {
          cardId: normalized.id,
          level: String(getNormalizedLevel(normalized.level))
        }
      });

      const deleteButton = createElement("button", {
        className: "delete-card-btn",
        type: "button",
        text: "−"
      });

      const statusArea = createElement("div", { className: "status-area" });
      const badge = createElement("div", { className: "status-badge idle" });
      statusArea.appendChild(badge);

      const leftInfo = createElement("div", { className: "left-info" });

      const photo = createElement("img", {
        className: "child-photo",
        src: normalized.photo,
        alt: "아이 사진"
      });

      const nameInput = createElement("input", {
        className: "name-input",
        type: "text",
        value: sanitizeNameInput(normalized.name),
        maxlength: 10,
        disabled: true
      });

      const uploadWrap = createElement("div", { className: "upload-wrap" });
      const uploadLabel = createElement("label", {
        className: "upload-label",
        text: "사진 바꾸기"
      });

      const photoInput = createElement("input", {
        className: "photo-input",
        type: "file",
        accept: "image/*"
      });

      const uploadGuide = createElement("div", {
        className: "upload-guide",
        text: "수정 모드에서만 사진을 바꿀 수 있어요"
      });

      uploadLabel.appendChild(photoInput);
      uploadWrap.appendChild(uploadLabel);
      uploadWrap.appendChild(uploadGuide);

      leftInfo.appendChild(photo);
      leftInfo.appendChild(nameInput);
      leftInfo.appendChild(uploadWrap);

      const itemControl = createElement("div", { className: "item-control" });
      const itemBtn = createElement("button", {
        className: "item-btn",
        type: "button",
        title: `${ITEM_ASSETS[appState.currentTab].alt} 클릭`
      });

      const itemHelp = createElement("div", {
        className: "item-help",
        html: "클릭하면 순서대로<br>가득참 → 1/3 → 2/3 → 완료 → 처음"
      });

      itemControl.appendChild(itemBtn);
      itemControl.appendChild(itemHelp);

      card.appendChild(deleteButton);
      card.appendChild(statusArea);
      card.appendChild(leftInfo);
      card.appendChild(itemControl);

      attachCardEvents(card);
      updateCardByLevel(card);

      return card;
    }

    function buildAddCardTile() {
      const tile = createElement("button", {
        className: `add-card-tile ${getCurrentEditMode() ? "show" : ""}`,
        type: "button",
        title: "새 카드 추가"
      });

      tile.innerHTML = `
        <div class="add-card-inner">
          <div class="add-card-plus">+</div>
          <div class="add-card-text">${getCurrentTabConfig().addTileText}</div>
          <div class="add-card-guide">수정 모드에서만<br>새 카드를 추가할 수 있어요</div>
        </div>
      `;

      tile.addEventListener("click", addNewCard);
      return tile;
    }

    function applyEditModeToAllCards() {
      const cards = [...DOM.cardList.querySelectorAll(".child-card")];

      cards.forEach((card) => {
        const nameInput = card.querySelector(".name-input");
        const deleteBtn = card.querySelector(".delete-card-btn");

        if (getCurrentEditMode()) {
          card.classList.add("editing");
          nameInput.disabled = false;
          deleteBtn.disabled = false;
        } else {
          card.classList.remove("editing");
          nameInput.disabled = true;
          deleteBtn.disabled = true;
        }
      });

      DOM.editModeBtn.textContent = getCurrentEditMode()
        ? "카드 수정 모드: ON"
        : "카드 수정 모드: OFF";

      DOM.editModeBtn.classList.toggle("active", getCurrentEditMode());

      const addTile = DOM.cardList.querySelector(".add-card-tile");
      if (addTile) {
        addTile.classList.toggle("show", getCurrentEditMode());
      }

      localStorage.setItem(getCurrentStorage().editModeKey, JSON.stringify(getCurrentEditMode()));
    }

    function renderCards(cardDataArray) {
      DOM.cardList.innerHTML = "";

      cardDataArray.forEach((cardData, index) => {
        DOM.cardList.appendChild(buildCard(cardData, index));
      });

      DOM.cardList.appendChild(buildAddCardTile());
      applyEditModeToAllCards();
      animateCards([...DOM.cardList.querySelectorAll(".child-card, .add-card-tile")]);
    }

    function getSuggestedChildName() {
      const existingNumbers = [...DOM.cardList.querySelectorAll(".child-card .name-input")]
        .map((input) => sanitizeNameInput(input.value))
        .map((name) => {
          const match = /^아이(\d+)$/.exec(name);
          return match ? Number(match[1]) : null;
        })
        .filter((value) => Number.isInteger(value));

      let candidate = 1;
      while (existingNumbers.includes(candidate)) candidate += 1;
      return `아이${candidate}`;
    }

    function addNewCard() {
      if (!getCurrentEditMode()) {
        alert("카드 수정 모드를 켠 뒤에 카드를 추가할 수 있어요.");
        return;
      }

      const newCardData = {
        id: getNextCardId(),
        name: getSuggestedChildName(),
        photo: `https://picsum.photos/seed/${appState.currentTab}_newkid${Date.now()}/${DEFAULT_PHOTO_SIZE}/${DEFAULT_PHOTO_SIZE}`,
        level: 0
      };

      const addTile = DOM.cardList.querySelector(".add-card-tile");
      const newCard = buildCard(newCardData, DOM.cardList.querySelectorAll(".child-card").length);

      if (addTile) {
        DOM.cardList.insertBefore(newCard, addTile);
      } else {
        DOM.cardList.appendChild(newCard);
      }

      applyEditModeToAllCards();
      saveCardDataToLocalStorage();
      DOM.resultText.textContent = "새 아이 카드가 추가되었어요.";
      animateCards([newCard]);
      animateResultBox();
    }

    function attachCardEvents(card) {
      const itemBtn = card.querySelector(".item-btn");
      const nameInput = card.querySelector(".name-input");
      const photoInput = card.querySelector(".photo-input");
      const childPhoto = card.querySelector(".child-photo");
      const deleteCardBtn = card.querySelector(".delete-card-btn");
      const uploadLabel = card.querySelector(".upload-label");

      itemBtn.addEventListener("click", () => {
        const previousLevel = getNormalizedLevel(card.dataset.level);
        const level = (previousLevel + 1) % 4;
        card.dataset.level = String(level);
        updateCardByLevel(card);
        animateItemChange(card, previousLevel, level);
        saveCardDataToLocalStorage();
      });

      nameInput.addEventListener("input", () => {
        if (!getCurrentEditMode()) return;

        const sanitized = sanitizeNameInput(nameInput.value);
        if (nameInput.value !== sanitized) nameInput.value = sanitized;
        saveCardDataToLocalStorage();
      });

      nameInput.addEventListener("blur", () => {
        const sanitized = sanitizeNameInput(nameInput.value);
        nameInput.value = sanitized || "이름없음";
        saveCardDataToLocalStorage();
      });

      photoInput.addEventListener("change", async (event) => {
        if (!getCurrentEditMode()) return;

        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          alert("이미지 파일을 선택해주세요!");
          return;
        }

        try {
          const resizedImage = await resizeImageForStorage(file, 220, 220, 0.75);
          childPhoto.src = resizedImage;
          saveCardDataToLocalStorage();
          DOM.resultText.textContent = "사진을 저장했어요.";
        } catch (error) {
          alert("사진 처리 중 오류가 생겼어요.");
          console.error(error);
        }

        photoInput.value = "";
      });

      deleteCardBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!getCurrentEditMode()) return;

        const name = getCardName(card);
        const confirmed = window.confirm(`"${name}" 카드를 삭제할까요?`);
        if (!confirmed) return;

        card.remove();
        saveCardDataToLocalStorage();
        DOM.resultText.textContent = "카드가 삭제되었어요.";
      });

      uploadLabel.addEventListener("click", (event) => {
        if (!getCurrentEditMode()) {
          event.preventDefault();
          event.stopPropagation();
        }
      });
    }

    function collectCurrentStatus() {
      const childCards = [...DOM.cardList.querySelectorAll(".child-card")];

      const fullNames = [];
      const almostNames = [];
      const effortNames = [];
      const noneNames = [];

      childCards.forEach((card) => {
        const name = getCardName(card);
        const level = getNormalizedLevel(card.dataset.level);

        if (level === 3) fullNames.push(name);
        else if (level === 2) almostNames.push(name);
        else if (level === 1) effortNames.push(name);
        else noneNames.push(name);
      });

      return {
        totalCount: childCards.length,
        fullNames,
        almostNames,
        effortNames,
        noneNames,
        fullCount: fullNames.length,
        almostCount: almostNames.length,
        effortCount: effortNames.length,
        noneCount: noneNames.length
      };
    }

    function appendResultLine(container, label, value) {
      const line = document.createElement("div");
      line.append(document.createTextNode(label + " "));
      const strong = document.createElement("strong");
      strong.textContent = value;
      line.appendChild(strong);
      container.appendChild(line);
    }

    function appendResultText(container, text) {
      const line = document.createElement("div");
      line.textContent = text;
      container.appendChild(line);
    }

    function appendResultSpacer(container) {
      container.appendChild(document.createElement("br"));
    }

    function showFinalCheckResult() {
      const status = collectCurrentStatus();
      const label = getCurrentTabConfig().resultLabel;

      DOM.resultText.innerHTML = "";

      appendResultLine(DOM.resultText, "✅ 다 먹은 유아:", `${status.fullCount}명`);
      appendResultText(DOM.resultText, `👉 이름: ${status.fullNames.length ? status.fullNames.join(", ") : "없음"}`);
      appendResultSpacer(DOM.resultText);

      appendResultLine(DOM.resultText, "🌟 거의 다 먹었어요:", `${status.almostCount}명`);
      appendResultText(DOM.resultText, `👉 이름: ${status.almostNames.length ? status.almostNames.join(", ") : "없음"}`);
      appendResultSpacer(DOM.resultText);

      appendResultLine(DOM.resultText, "👏 노력했어요:", `${status.effortCount}명`);
      appendResultText(DOM.resultText, `👉 이름: ${status.effortNames.length ? status.effortNames.join(", ") : "없음"}`);
      appendResultSpacer(DOM.resultText);

      appendResultLine(DOM.resultText, `🥄 아직 ${label}을 먹지 않은 유아:`, `${status.noneCount}명`);
      appendResultText(DOM.resultText, `👉 이름: ${status.noneNames.length ? status.noneNames.join(", ") : "없음"}`);
      appendResultSpacer(DOM.resultText);

      appendResultLine(DOM.resultText, "📌 총 인원:", `${status.totalCount}명`);
      animateResultBox();

      if (status.totalCount > 0 && status.fullCount === status.totalCount) {
        celebrateAllComplete();
      }
    }

    function saveDailyRecord() {
      const selectedDate = DOM.recordDate.value;
      if (!selectedDate) {
        alert("날짜를 먼저 선택해주세요!");
        return;
      }

      const status = collectCurrentStatus();
      const history = loadHistoryData();

      const newRecord = {
        date: selectedDate,
        fullNames: status.fullNames,
        almostNames: status.almostNames,
        effortNames: status.effortNames,
        noneNames: status.noneNames,
        fullCount: status.fullCount,
        almostCount: status.almostCount,
        effortCount: status.effortCount,
        noneCount: status.noneCount,
        totalCount: status.totalCount
      };

      const existingIndex = history.findIndex((item) => item.date === selectedDate);

      if (existingIndex >= 0) {
        history[existingIndex] = newRecord;
      } else {
        history.push(newRecord);
      }

      saveHistoryData(history);
      renderHistoryTable();
      DOM.resultText.textContent = `${selectedDate} 날짜 기록을 저장했어요.`;
      animateResultBox();
    }

    function renderHistoryTable() {
      const history = loadHistoryData();
      DOM.historyTableWrap.innerHTML = "";

      if (history.length === 0) {
        DOM.historyTableWrap.appendChild(createElement("div", {
          className: "empty-history",
          text: "아직 저장된 날짜별 기록이 없어요."
        }));
        return;
      }

      const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

      const table = createElement("table", { className: "history-table" });
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      const headers = [
        "날짜",
        "다 먹은 유아",
        "거의 다 먹었어요",
        "노력했어요",
        "먹지 않은 유아",
        "다 먹음 수",
        "거의 다 수",
        "노력 수",
        "안 먹음 수",
        "총계"
      ];

      headers.forEach((headerText) => {
        headRow.appendChild(createElement("th", { text: headerText }));
      });

      thead.appendChild(headRow);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");

      sortedHistory.forEach((record) => {
        const row = document.createElement("tr");

        row.appendChild(createElement("td", { text: record.date }));
        row.appendChild(createElement("td", { text: record.fullNames.length ? record.fullNames.join(", ") : "없음" }));
        row.appendChild(createElement("td", { text: record.almostNames.length ? record.almostNames.join(", ") : "없음" }));
        row.appendChild(createElement("td", { text: record.effortNames.length ? record.effortNames.join(", ") : "없음" }));
        row.appendChild(createElement("td", { text: record.noneNames.length ? record.noneNames.join(", ") : "없음" }));
        row.appendChild(createElement("td", { text: String(record.fullCount) }));
        row.appendChild(createElement("td", { text: String(record.almostCount) }));
        row.appendChild(createElement("td", { text: String(record.effortCount) }));
        row.appendChild(createElement("td", { text: String(record.noneCount) }));
        row.appendChild(createElement("td", { text: String(record.totalCount) }));

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      DOM.historyTableWrap.appendChild(table);
    }

    function escapeSpreadsheetCell(value) {
      const text = String(value ?? "");
      const safeText = /^[=+\-@]/.test(text) ? "'" + text : text;
      return safeText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function exportHistoryToExcel() {
      const history = loadHistoryData();

      if (history.length === 0) {
        alert("엑셀로 저장할 기록이 없어요!");
        return;
      }

      const headers = [
        "날짜",
        "다 먹은 유아",
        "거의 다 먹었어요",
        "노력했어요",
        "먹지 않은 유아",
        "다 먹음 수",
        "거의 다 수",
        "노력 수",
        "안 먹음 수",
        "총계"
      ];

      const excelRows = [...history]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((record) => [
          record.date,
          record.fullNames.length ? record.fullNames.join(", ") : "없음",
          record.almostNames.length ? record.almostNames.join(", ") : "없음",
          record.effortNames.length ? record.effortNames.join(", ") : "없음",
          record.noneNames.length ? record.noneNames.join(", ") : "없음",
          record.fullCount,
          record.almostCount,
          record.effortCount,
          record.noneCount,
          record.totalCount
        ]);

      const headerHtml = headers
        .map((header) => `<th>${escapeSpreadsheetCell(header)}</th>`)
        .join("");
      const bodyHtml = excelRows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeSpreadsheetCell(cell)}</td>`).join("")}</tr>`)
        .join("");
      const workbookHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Excel.Sheet">
  <style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px;mso-number-format:"\\@"}</style>
</head>
<body>
  <table>
    <caption>${escapeSpreadsheetCell(getCurrentTabConfig().sheetName)}</caption>
    <thead><tr>${headerHtml}</tr></thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</body>
</html>`;

      downloadBlob(
        new Blob(["\ufeff", workbookHtml], { type: "application/vnd.ms-excel;charset=utf-8" }),
        `${getCurrentTabConfig().exportPrefix}_${getTodayString()}.xls`
      );
    }

    function resetLevels() {
      const confirmed = window.confirm("오늘 체크 상태를 모두 초기화할까요?");
      if (!confirmed) return;

      [...DOM.cardList.querySelectorAll(".child-card")].forEach((card) => {
        card.dataset.level = "0";
        updateCardByLevel(card);
      });

      saveCardDataToLocalStorage();
      DOM.resultText.textContent = "오늘 체크 상태를 모두 초기화했어요.";
      animateCards([...DOM.cardList.querySelectorAll(".child-card")]);
      animateResultBox();
    }

    function resetSavedCardsToDefault() {
      const confirmed = window.confirm("저장된 카드 구성을 지우고 기본 카드 3개로 되돌릴까요?");
      if (!confirmed) return;

      localStorage.removeItem(getCurrentStorage().cardKey);
      localStorage.removeItem(getCurrentStorage().sequenceKey);
      loadCardSequence(appState.currentTab);
      renderCards(getDefaultCards(appState.currentTab));
      saveCardDataToLocalStorage();
      DOM.resultText.textContent = "카드 저장을 지우고 처음 카드로 바꿨어요.";
      animateResultBox();
    }

    function clearAllHistory() {
      const confirmed = window.confirm("날짜별 기록을 모두 지울까요?");
      if (!confirmed) return;

      localStorage.removeItem(getCurrentStorage().historyKey);
      renderHistoryTable();
      DOM.resultText.textContent = "날짜별 기록을 모두 지웠어요.";
      animateResultBox();
    }

    function updateTabUI() {
      const config = getCurrentTabConfig();

      DOM.milkTabBtn.classList.toggle("active", appState.currentTab === "milk");
      DOM.mealTabBtn.classList.toggle("active", appState.currentTab === "meal");
      DOM.snackTabBtn.classList.toggle("active", appState.currentTab === "snack");

      DOM.mainTitle.textContent = config.title;
      DOM.historyTitle.textContent = config.historyTitle;
      DOM.resetBtn.textContent = config.resetText;
    }

    function renderCurrentTab() {
      updateTabUI();

      const savedCards = loadCardDataFromLocalStorage();

      if (savedCards && savedCards.length > 0) {
        renderCards(savedCards);
        DOM.resultText.textContent = "저장된 카드 데이터를 불러왔어요.";
      } else {
        renderCards(getDefaultCards(appState.currentTab));
        saveCardDataToLocalStorage();
        DOM.resultText.textContent = "기본 카드 데이터를 불러왔어요.";
      }

      renderHistoryTable();
      animateResultBox();
    }

    function switchTab(tab) {
      appState.currentTab = tab;
      renderCurrentTab();
    }

    function bindEvents() {
      DOM.editModeBtn.addEventListener("click", () => {
        setCurrentEditMode(!getCurrentEditMode());
        applyEditModeToAllCards();
        saveCardDataToLocalStorage();
        DOM.resultText.textContent = getCurrentEditMode()
          ? "카드 수정 모드가 켜졌어요."
          : "카드 수정 모드가 꺼졌어요.";
        animateResultBox();
      });

      DOM.saveBtn.addEventListener("click", () => {
        saveCardDataToLocalStorage();
        DOM.resultText.textContent = "현재 카드 정보를 저장했어요.";
        animateResultBox();
      });

      DOM.clearSaveBtn.addEventListener("click", resetSavedCardsToDefault);
      DOM.finalCheckBtn.addEventListener("click", showFinalCheckResult);
      DOM.resetBtn.addEventListener("click", resetLevels);

      DOM.saveRecordBtn.addEventListener("click", saveDailyRecord);
      DOM.exportExcelBtn.addEventListener("click", exportHistoryToExcel);
      DOM.clearRecordBtn.addEventListener("click", clearAllHistory);

      DOM.mealTabBtn.addEventListener("click", () => switchTab("meal"));
      DOM.milkTabBtn.addEventListener("click", () => switchTab("milk"));
      DOM.snackTabBtn.addEventListener("click", () => switchTab("snack"));
    }

    function initializeApp() {
      DOM.recordDate.value = getTodayString();

      TAB_ORDER.forEach((tab) => {
        appState.editModeByTab[tab] = loadEditModeForTab(tab);
        loadCardSequence(tab);
      });

      bindEvents();
      renderCurrentTab();
    }

    initializeApp();
}
