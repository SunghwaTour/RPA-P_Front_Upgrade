# King Bus Frontend - Vercel 배포 가이드

이 문서는 King Bus 예약 시스템 프론트엔드를 Vercel에 배포하는 방법을 설명합니다.

## 사전 준비

### 1. Vercel 계정 생성
- https://vercel.com 에서 계정 생성
- GitHub 계정과 연동 권장

### 2. 필요한 환경 변수 값 준비

배포 전에 다음 값들을 준비하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
NEXT_PUBLIC_API_BASE_URL=https://api.kingbus.kr  # 또는 백엔드 서버 URL

# PortOne
NEXT_PUBLIC_PORTONE_USER_CODE=imp12345678

# Kakao Map (선택사항)
NEXT_PUBLIC_KAKAO_MAP_KEY=your-kakao-map-api-key
```

## Vercel CLI를 통한 배포

### 1. Vercel CLI 설치

```bash
npm install -g vercel
```

### 2. 로그인

```bash
vercel login
```

### 3. 프로젝트 연결 및 배포

```bash
# 프로젝트 디렉토리에서
cd /Users/jay/Desktop/Kingbus/RPA-P/frontend

# 첫 배포 (프로젝트 설정)
vercel

# 질문에 답변:
# ? Set up and deploy "~/frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? kingbus-frontend
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# 프로덕션 배포
vercel --prod
```

### 4. 환경 변수 설정

Vercel CLI로 환경 변수 추가:

```bash
# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Supabase Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# API Base URL
vercel env add NEXT_PUBLIC_API_BASE_URL

# PortOne User Code
vercel env add NEXT_PUBLIC_PORTONE_USER_CODE

# Kakao Map Key (선택사항)
vercel env add NEXT_PUBLIC_KAKAO_MAP_KEY
```

각 명령어 실행 시:
- 환경: Production, Preview, Development 선택 (보통 Production)
- 값을 입력

## Vercel Dashboard를 통한 배포

### 1. GitHub 연동

1. GitHub에 프로젝트 푸시
```bash
cd /Users/jay/Desktop/Kingbus/RPA-P/frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/kingbus-frontend.git
git push -u origin main
```

2. Vercel Dashboard에서 "New Project" 클릭
3. GitHub repository 선택
4. Import

### 2. 프로젝트 설정

**Framework Preset**: Next.js (자동 감지됨)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `.next` (기본값)
- Install Command: `npm install`

**Root Directory**: `./` (기본값)

### 3. 환경 변수 설정

Vercel Dashboard → Settings → Environment Variables에서 추가:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxxxx.supabase.co | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1... | Production, Preview |
| `NEXT_PUBLIC_API_BASE_URL` | https://api.kingbus.kr | Production, Preview |
| `NEXT_PUBLIC_PORTONE_USER_CODE` | imp12345678 | Production, Preview |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | your-kakao-map-api-key | Production, Preview |

### 4. 도메인 설정

1. Vercel Dashboard → Settings → Domains
2. 커스텀 도메인 추가 (예: `app.kingbus.kr`)
3. DNS 레코드 설정:
   - Type: `CNAME`
   - Name: `app` (또는 원하는 서브도메인)
   - Value: `cname.vercel-dns.com`

## 배포 후 확인 사항

### 1. Supabase 설정 업데이트

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app` 또는 커스텀 도메인
- Redirect URLs 추가:
  - `https://your-app.vercel.app/auth/callback`
  - `https://your-custom-domain.com/auth/callback`

### 2. 백엔드 CORS 설정

백엔드 서버(`reservation-system`)의 CORS 설정에 프론트엔드 URL 추가:

```python
# reservation-system/config/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-app.vercel.app",
    "https://your-custom-domain.com",
]
```

### 3. PortOne 설정

PortOne 대시보드에서:
- 리다이렉트 URL 추가: `https://your-app.vercel.app`
- 웹훅 URL 설정 (백엔드 서버)

## 자동 배포 설정

GitHub 연동 시 자동으로:
- `main` 브랜치 푸시 → Production 배포
- PR 생성 → Preview 배포
- 커밋마다 자동 빌드 및 배포

## 환경별 배포

### Preview (스테이징)

```bash
# 별도 브랜치에서
git checkout -b staging
git push origin staging

# Vercel에서 자동으로 preview 배포 생성
```

### Production

```bash
# main 브랜치에 머지
git checkout main
git merge staging
git push origin main

# 또는 Vercel CLI로
vercel --prod
```

## 배포 롤백

Vercel Dashboard → Deployments에서:
1. 이전 배포 선택
2. "Promote to Production" 클릭

또는 CLI:
```bash
vercel rollback
```

## 성능 최적화

Vercel은 자동으로 다음을 제공합니다:
- ✅ Global CDN
- ✅ 자동 HTTPS
- ✅ 이미지 최적화
- ✅ Edge Functions
- ✅ 자동 캐싱

## 모니터링

### Vercel Analytics

Vercel Dashboard → Analytics에서:
- 페이지 뷰
- 로드 타임
- Core Web Vitals

### 로그 확인

```bash
vercel logs
```

또는 Vercel Dashboard → Logs

## 비용

- **Hobby Plan** (무료):
  - 무제한 배포
  - 100GB 대역폭/월
  - 충분한 빌드 시간

- **Pro Plan** ($20/월):
  - 더 많은 대역폭
  - 팀 협업 기능
  - 고급 분석

## 트러블슈팅

### 빌드 실패

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# 환경 변수 확인
vercel env ls
```

### 환경 변수 적용 안됨

- Vercel Dashboard에서 환경 변수 재확인
- "Redeploy" 클릭하여 재배포

### 도메인 연결 안됨

- DNS 전파 대기 (최대 24-48시간)
- DNS 설정 확인: `nslookup your-domain.com`

### API 연결 오류

- 백엔드 CORS 설정 확인
- API_BASE_URL 환경 변수 확인
- 네트워크 탭에서 요청 URL 확인

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI 문서](https://vercel.com/docs/cli)

## 배포 체크리스트

배포 전 확인:
- [ ] 모든 환경 변수 준비됨
- [ ] Supabase OAuth 제공자 활성화
- [ ] 백엔드 API 서버 실행 중
- [ ] PortOne 계정 설정 완료
- [ ] 로컬 빌드 성공 (`npm run build`)

배포 후 확인:
- [ ] 배포 성공 확인
- [ ] Supabase Redirect URL 설정
- [ ] 백엔드 CORS 설정
- [ ] 로그인 테스트
- [ ] 예약 생성 테스트
- [ ] 결제 플로우 테스트
- [ ] 모바일 반응형 확인

## 지원

문제 발생 시:
1. Vercel 로그 확인
2. 브라우저 콘솔 확인
3. GitHub Issues에 문의
