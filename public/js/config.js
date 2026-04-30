export const TAB_ORDER = ["meal", "milk", "snack"];

export const TAB_CONFIG = {
  meal: {
    label: "급식",
    title: "급식 체크",
    subtitle: "급식 이미지를 누르면 먹은 양이 1/3씩 사라져요.",
    bodyClass: "theme-meal",
    asset: "./assets/images/meal-tray.png",
    assetAlt: "귀여운 급식판 이미지",
    resultLabel: "급식",
    resetText: "오늘 급식 체크 초기화",
    historyTitle: "급식 날짜별 기록",
    storagePrefix: "product_builder_meal",
    exportPrefix: "급식_체크기록",
    sheetName: "급식기록"
  },
  milk: {
    label: "우유",
    title: "우유 체크",
    subtitle: "우유팩 이미지를 누르면 마신 양이 1/3씩 사라져요.",
    bodyClass: "theme-milk",
    asset: "./assets/images/milk-carton.png",
    assetAlt: "귀여운 우유팩 이미지",
    resultLabel: "우유",
    resetText: "오늘 우유 체크 초기화",
    historyTitle: "우유 날짜별 기록",
    storagePrefix: "product_builder_milk",
    exportPrefix: "우유_체크기록",
    sheetName: "우유기록"
  },
  snack: {
    label: "간식",
    title: "간식 체크",
    subtitle: "쿠키 이미지를 누르면 먹은 양이 1/3씩 사라져요.",
    bodyClass: "theme-snack",
    asset: "./assets/images/cookie.png",
    assetAlt: "귀여운 쿠키 이미지",
    resultLabel: "간식",
    resetText: "오늘 간식 체크 초기화",
    historyTitle: "간식 날짜별 기록",
    storagePrefix: "product_builder_snack",
    exportPrefix: "간식_체크기록",
    sheetName: "간식기록"
  }
};

export const STATUS = [
  {
    key: "none",
    label: "아직이에요",
    resultTitle: "아직 먹지 않은 유아",
    badgeText: "아직이에요",
    helpText: "0/3"
  },
  {
    key: "oneThird",
    label: "조금 먹었어요",
    resultTitle: "조금 먹었어요",
    badgeText: "1/3 먹었어요",
    helpText: "1/3"
  },
  {
    key: "twoThirds",
    label: "거의 다 먹었어요",
    resultTitle: "거의 다 먹었어요",
    badgeText: "2/3 먹었어요",
    helpText: "2/3"
  },
  {
    key: "full",
    label: "다 먹었어요",
    resultTitle: "다 먹은 유아",
    badgeText: "다 먹었어요",
    helpText: "3/3"
  }
];

export const DEFAULT_CARDS = {
  meal: [
    { name: "하늘", level: 0, photo: "" },
    { name: "바다", level: 0, photo: "" },
    { name: "별이", level: 0, photo: "" }
  ],
  milk: [
    { name: "하늘", level: 0, photo: "" },
    { name: "바다", level: 0, photo: "" },
    { name: "별이", level: 0, photo: "" }
  ],
  snack: [
    { name: "하늘", level: 0, photo: "" },
    { name: "바다", level: 0, photo: "" },
    { name: "별이", level: 0, photo: "" }
  ]
};
