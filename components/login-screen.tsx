"use client"

interface LoginScreenProps {
  onLogin: (user: { name: string; email: string }) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleGoogleLogin = async () => {
    try {
      const { signInWithGoogle } = await import("@/lib/supabase")
      await signInWithGoogle()
    } catch (error) {
      console.error("Google 로그인 오류:", error)
      alert("Google 로그인 중 오류가 발생했습니다.")
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { signInWithKakao } = await import("@/lib/supabase")
      await signInWithKakao()
    } catch (error) {
      console.error("Kakao 로그인 오류:", error)
      alert("Kakao 로그인 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5B68F0] via-[#6B76F5] to-[#7B84FA] flex flex-col relative overflow-hidden max-w-[375px] mx-auto">
      {/* 컨텐츠 */}
      <div className="flex-1 flex flex-col pt-32 px-8">
        {/* 타이틀 */}
        <div className="mb-16">
          <h1 className="text-white text-[32px] font-bold leading-tight mb-4">
            믿을 수 있는<br />
            버스 예약 파트너
          </h1>
          <p className="text-white/90 text-[16px]">간편한 예약부터 편안한 여행까지</p>
        </div>

        {/* 버스 일러스트 */}
        <div className="relative w-full h-[200px] mb-auto">
          <img
            src="/login_bus.svg"
            alt="버스 일러스트"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* 로그인 버튼 영역 */}
      <div className="bg-white rounded-t-[32px] px-8 py-10 pb-12">
        <div className="flex justify-center gap-6 mb-6">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            className="w-20 h-20 bg-[#FEE500] hover:bg-[#FEE500]/90 rounded-full flex items-center justify-center shadow-lg touch-manipulation transition-all"
          >
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="#000000">
              <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
            </svg>
          </button>

          {/* 구글 로그인 */}
          <button
            onClick={handleGoogleLogin}
            className="w-20 h-20 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 touch-manipulation transition-all"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </button>
        </div>

        <p className="text-center text-[15px] text-gray-900 font-medium">전화 문의</p>
      </div>
    </div>
  )
}
