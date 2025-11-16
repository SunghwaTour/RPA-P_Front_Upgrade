"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Menu } from "lucide-react"
import { ReservationFormNew } from "@/components/reservation-form-new"
import { MyReservationsNew } from "@/components/my-reservations-new"

interface MainScreenProps {
  user: { name: string; email: string } | null
  onLogout: () => void
}

export function MainScreen({ user, onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<"home" | "reservation" | "myReservations">("home")
  const [showMenu, setShowMenu] = useState(false)
  const [reservationType, setReservationType] = useState<"roundtrip" | "oneway" | null>(null)

  // 왕복/편도 선택 시 예약 폼으로 이동
  useEffect(() => {
    if (reservationType) {
      setActiveTab("reservation")
    }
  }, [reservationType])

  if (activeTab === "reservation") {
    return <ReservationFormNew
      onBack={() => {
        setActiveTab("home")
        setReservationType(null)
      }}
      initialRoundTrip={reservationType === "roundtrip"}
      onReservationComplete={() => {
        setActiveTab("myReservations")
        setReservationType(null)
      }}
    />
  }

  if (activeTab === "myReservations") {
    return <MyReservationsNew onBack={() => setActiveTab("home")} user={user} />
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center justify-between px-4 py-4">
          <img src="/home/logo_en.svg" alt="KING BUS" className="h-6" />
          <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className="touch-manipulation">
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* 메뉴 드롭다운 */}
        {showMenu && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-xl shadow-lg border overflow-hidden z-50">
            <button
              onClick={() => {
                onLogout()
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              로그아웃
            </button>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-4 py-6">
        {/* 인사말과 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{user?.name || '사용자'}님</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("myReservations")}
              className="text-sm"
            >
              내 예약
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("reservation")}
              className="text-sm"
            >
              예약 문의
            </Button>
          </div>
        </div>

        {/* 예약 타입 카드 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 왕복 예약 */}
          <Card
            className="relative h-[200px] bg-white cursor-pointer hover:shadow-md transition-all touch-manipulation shadow-sm"
            onClick={() => setReservationType("roundtrip")}
          >
            <div className="absolute top-5 left-5">
              <h3 className="text-base font-bold text-foreground">
                <span className="text-primary">왕복</span> 예약
              </h3>
            </div>
            <div className="absolute bottom-5 right-5">
              <img src="/home/roundTrip.svg" alt="왕복 예약" className="w-[52px] h-[52px]" />
            </div>
          </Card>

          {/* 편도 예약 */}
          <Card
            className="relative h-[200px] bg-white cursor-pointer hover:shadow-md transition-all touch-manipulation shadow-sm"
            onClick={() => setReservationType("oneway")}
          >
            <div className="absolute top-5 left-5">
              <h3 className="text-base font-bold text-foreground">
                <span className="text-primary">편도</span> 예약
              </h3>
            </div>
            <div className="absolute bottom-5 right-5">
              <img src="/home/oneWay.svg" alt="편도 예약" className="w-[52px] h-[52px]" />
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
