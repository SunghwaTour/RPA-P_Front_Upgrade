"use client"

import { Button } from "@/components/ui/button"
import { Bus } from "lucide-react"

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleGoogleLogin = async () => {
    try {
      const { signInWithGoogle } = await import("@/lib/supabase")
      await signInWithGoogle()
      // OAuth 리다이렉트 발생, 콜백 처리는 별도 라우트에서
    } catch (error) {
      console.error("Google 로그인 오류:", error)
      alert("Google 로그인 중 오류가 발생했습니다.")
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { signInWithKakao } = await import("@/lib/supabase")
      await signInWithKakao()
      // OAuth 리다이렉트 발생, 콜백 처리는 별도 라우트에서
    } catch (error) {
      console.error("Kakao 로그인 오류:", error)
      alert("Kakao 로그인 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* 배경 그라데이션 효과 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-[#3d56c4] opacity-90" />

      {/* 도로 라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 border-t-2 border-dashed border-white/30" />

      {/* 컨텐츠 */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-32">
        {/* 로고 및 타이틀 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Bus className="w-7 h-7 text-primary" />
            </div>
            <span className="text-white text-2xl font-bold">LINK</span>
          </div>
          <h1 className="text-white text-4xl font-bold mb-3 text-balance">
            믿을 수 있는
            <br />
            버스 예약 파트너
          </h1>
          <p className="text-white/90 text-lg">간편한 예약부터 편안한 여행까지</p>
        </div>

        {/* 버스 일러스트 */}
        <div className="relative w-full max-w-md h-48 mb-16">
          <div className="absolute bottom-0 right-8">
            {/* 버스 정류장 표지판 */}
            <div className="absolute left-4 bottom-0 w-16 h-32 flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-2 shadow-lg">
                <Bus className="w-7 h-7 text-primary" />
              </div>
              <div className="w-2 h-20 bg-white/80 rounded-full" />
            </div>

            {/* 버스 */}
            <div className="ml-24 w-48 h-28 bg-white rounded-3xl shadow-2xl relative overflow-hidden">
              {/* 버스 창문 */}
              <div className="absolute top-4 left-4 right-4 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl" />
              {/* 버스 바퀴 */}
              <div className="absolute -bottom-3 left-8 w-10 h-10 bg-gray-800 rounded-full border-4 border-white" />
              <div className="absolute -bottom-3 right-8 w-10 h-10 bg-gray-800 rounded-full border-4 border-white" />
              {/* 헤드라이트 */}
              <div className="absolute bottom-8 left-4 w-3 h-3 bg-yellow-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 버튼 영역 */}
      <div className="relative z-10 bg-white rounded-t-[2rem] px-6 py-8 shadow-2xl">
        <div className="max-w-md mx-auto space-y-3">
          {/* 카카오 로그인 */}
          <Button
            onClick={handleKakaoLogin}
            className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-full text-base font-semibold shadow-md touch-manipulation"
          >
            <div className="w-6 h-6 bg-secondary-foreground rounded-full mr-3 flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.7 2.8-.8 3.2 0 .2 0 .3.2.4.1.1.3.1.4 0 .5-.3 3.7-2.4 4.3-2.8.4 0 .8.1 1.2.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
              </svg>
            </div>
            카카오로 시작하기
          </Button>

          {/* 구글 로그인 */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-14 bg-white hover:bg-gray-50 text-foreground border-2 rounded-full text-base font-semibold shadow-md touch-manipulation"
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 시작하기
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">전화 문의</p>
      </div>
    </div>
  )
}
