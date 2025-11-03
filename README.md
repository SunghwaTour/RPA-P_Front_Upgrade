# King Bus 예약 시스템 Frontend

Next.js 16 + React 19 + TypeScript 기반의 전세버스 예약 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Authentication**: Supabase Auth (Google, Kakao OAuth)
- **Payment**: PortOne (구 아임포트)
- **HTTP Client**: Axios
- **Maps**: 카카오맵 API

## 주요 기능

- ✅ Google/Kakao 소셜 로그인 (Supabase)
- ✅ 카카오맵 통합 (장소 검색, 지도 선택, 현재 위치)
- ✅ 실시간 견적 조회
- ✅ 버스 예약 생성
- ✅ 예약 목록 조회 및 필터링
- ✅ 예약금 결제 (PortOne)
- ✅ 예약 상세 정보 확인
- ✅ 예약 취소

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 다음 값들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 백엔드 API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# 포트원 (PortOne) 설정
NEXT_PUBLIC_PORTONE_USER_CODE=imp12345678

# 카카오맵 API 키
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-api-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
frontend/
├── app/
│   ├── auth/callback/       # OAuth 콜백 라우트
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 페이지 (인증 라우팅)
├── components/
│   ├── ui/                  # shadcn/ui 기본 컴포넌트
│   ├── login-screen.tsx     # 로그인 화면
│   ├── main-screen.tsx      # 메인 홈 화면
│   ├── reservation-form-complete.tsx  # 예약 생성 폼
│   ├── my-reservations-complete.tsx   # 예약 목록
│   └── payment-page.tsx     # 결제 페이지
├── lib/
│   ├── api.ts              # 백엔드 API 통신
│   ├── supabase.ts         # Supabase 인증
│   ├── portone.ts          # PortOne 결제 연동
│   └── utils.ts            # 유틸리티 함수
├── types/
│   └── index.ts            # TypeScript 타입 정의
└── .env.local.example      # 환경 변수 예시
```

## API 연동

이 프론트엔드는 `../reservation-system`의 Django REST API와 통신합니다.

### 주요 엔드포인트

- `POST /api/v1/reservation/quote/` - 견적 조회
- `POST /api/v1/reservation/` - 예약 생성
- `GET /api/v1/reservation/` - 예약 목록
- `GET /api/v1/reservation/{id}/` - 예약 상세
- `POST /api/v1/reservation/{id}/cancel/` - 예약 취소
- `POST /api/v1/reservation/{id}/payment/initiate/` - 결제 시작
- `POST /api/v1/reservation/payment/verify/` - 결제 검증

자세한 API 문서는 `../reservation-system/FRONTEND_API_DOCUMENTATION.md`를 참고하세요.

## 인증 Flow

1. 사용자가 Google/Kakao 로그인 버튼 클릭
2. Supabase OAuth 리다이렉트
3. 인증 성공 후 `/auth/callback`으로 콜백
4. 세션 생성 및 메인 화면으로 이동
5. API 요청 시 Supabase 토큰을 Authorization 헤더에 포함

## 결제 Flow

1. 예약 승인 후 "결제 대기" 상태
2. "예약금 결제" 버튼 클릭
3. PortOne 결제 창 열림 (카드/계좌이체/가상계좌)
4. 결제 완료 후 서버 검증
5. "결제 완료" 상태로 변경

## 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

### Vercel 배포

이 프로젝트는 Vercel에 쉽게 배포할 수 있습니다:

1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포

## 개발 참고사항

- **모바일 최적화**: 터치 친화적인 UI 설계
- **타입 안전성**: TypeScript로 타입 검증
- **컴포넌트 재사용**: shadcn/ui 기반 일관된 디자인
- **API 에러 처리**: try-catch 및 사용자 친화적 에러 메시지
- **로딩 상태**: 모든 비동기 작업에 로딩 인디케이터 제공

## 문제 해결

### Supabase 인증 오류

- `.env.local`에 올바른 Supabase URL과 Anon Key가 설정되어 있는지 확인
- Supabase 대시보드에서 OAuth 제공자(Google, Kakao)가 활성화되어 있는지 확인

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인 (`http://localhost:8000`)
- CORS 설정이 올바른지 확인

### 결제 오류

- PortOne 사용자 코드가 올바르게 설정되어 있는지 확인
- 결제 테스트 모드인지 실제 모드인지 확인

## 라이선스

이 프로젝트는 King Bus의 소유입니다.
