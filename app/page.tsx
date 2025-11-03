"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { MainScreen } from "@/components/main-screen"
import { getUser, onAuthStateChange, signOut } from "@/lib/supabase"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 로그인 상태 확인
    const checkAuth = async () => {
      try {
        const currentUser = await getUser()
        if (currentUser) {
          setUser({
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '사용자',
            email: currentUser.email || '',
          })
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error("인증 확인 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 인증 상태 변화 감지
    const { data: authListener } = onAuthStateChange(async (authUser) => {
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '사용자',
          email: authUser.email || '',
        })
        setIsLoggedIn(true)
      } else {
        setUser(null)
        setIsLoggedIn(false)
      }
      setLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUser(null)
      setIsLoggedIn(false)
    } catch (error) {
      console.error("로그아웃 오류:", error)
      alert("로그아웃 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <MainScreen user={user} onLogout={handleLogout} />
}
