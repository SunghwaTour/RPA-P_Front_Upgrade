"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bus, Calendar, MapPin, Users, Menu, LogOut, ChevronRight, Clock } from "lucide-react"
import { ReservationFormComplete } from "@/components/reservation-form-complete"
import { MyReservationsComplete } from "@/components/my-reservations-complete"

interface MainScreenProps {
  user: { name: string; email: string } | null
  onLogout: () => void
}

export function MainScreen({ user, onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<"home" | "reservation" | "myReservations">("home")
  const [showMenu, setShowMenu] = useState(false)

  if (activeTab === "reservation") {
    return <ReservationFormComplete onBack={() => setActiveTab("home")} />
  }

  if (activeTab === "myReservations") {
    return <MyReservationsComplete onBack={() => setActiveTab("home")} user={user} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-white border-b sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{user?.name}님</h1>
              <p className="text-xs text-muted-foreground">안녕하세요!</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowMenu(!showMenu)} className="touch-manipulation">
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* 메뉴 드롭다운 */}
        {showMenu && (
          <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-xl shadow-lg border overflow-hidden">
            <button
              onClick={() => {
                onLogout()
                setShowMenu(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="px-4 py-6 pb-24">
        {/* 빠른 액션 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card
            className="p-6 bg-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity touch-manipulation"
            onClick={() => setActiveTab("reservation")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">내 예약</h3>
                <p className="text-sm text-primary-foreground/80">예약 현황 확인</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 bg-white border-2 border-primary cursor-pointer hover:bg-accent transition-colors touch-manipulation"
            onClick={() => setActiveTab("reservation")}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Bus className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-primary">예약 문의</h3>
                <p className="text-sm text-muted-foreground">새로운 예약</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 서비스 안내 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">King Bus 서비스</h2>
          <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">전국 어디든 편안하게</h3>
                  <p className="text-sm text-muted-foreground">출발지부터 목적지까지 안전한 이동</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">대규모 인원 수용</h3>
                  <p className="text-sm text-muted-foreground">최대 500명까지 동시 예약 가능</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">실시간 견적 확인</h3>
                  <p className="text-sm text-muted-foreground">즉시 예상 금액을 확인하세요</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 최근 예약 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">최근 예약</h2>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("myReservations")} className="text-primary">
              전체보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Card className="p-5 text-center">
            <div className="py-8">
              <Bus className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">아직 예약 내역이 없습니다</p>
              <Button
                onClick={() => setActiveTab("reservation")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                첫 예약 시작하기
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t safe-area-inset">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => setActiveTab("home")}
            className="flex flex-col items-center gap-1 px-4 py-2 touch-manipulation text-primary"
          >
            <Bus className="w-6 h-6" />
            <span className="text-xs font-medium">홈</span>
          </button>
          <button
            onClick={() => setActiveTab("reservation")}
            className="flex flex-col items-center gap-1 px-4 py-2 touch-manipulation text-muted-foreground"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">예약하기</span>
          </button>
          <button
            onClick={() => setActiveTab("myReservations")}
            className="flex flex-col items-center gap-1 px-4 py-2 touch-manipulation text-muted-foreground"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">내 예약</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
