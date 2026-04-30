# Product Builder

급식, 우유, 간식 섭취 상태를 유아별 카드로 체크하고 날짜별 기록을 저장하는 정적 웹 앱입니다.

## 구조

- `public/index.html`: 앱 화면 뼈대
- `public/css/style.css`: 전체 UI 스타일과 1/3 이미지 소실 모션
- `public/js/config.js`: 탭, 상태, 기본 카드 설정
- `public/js/storage.js`: localStorage 저장/로드
- `public/js/ui.js`: 카드, 테이블, 테마 렌더링
- `public/js/app.js`: 앱 상태, 이벤트, 기록/엑셀 흐름
- `public/assets/images/`: 급식판, 우유팩, 쿠키 이미지 자산
- `wrangler.json`: Cloudflare Pages 배포 설정

## 실행

정적 파일 기반이라 `public/index.html`을 브라우저로 열면 됩니다. Cloudflare Pages에서는 `public` 폴더가 배포 출력 폴더입니다.
