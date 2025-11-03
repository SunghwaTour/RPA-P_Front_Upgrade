"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Bus, Calendar, Users } from "lucide-react"

interface MyReservationsProps {
  onBack: () => void
  user: { name: string; email: string } | null
}

export function MyReservations({ onBack, user }: MyReservationsProps) {
  // TODO: API에서 예약 목록 가져오기
  const reservations: any[] = []

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">내 예약</h1>
        </div>
      </header>

      {/* 예약 목록 */}
      <main className="px-4 py-6">
        {reservations.length === 0 ? (
          <Card className="p-8 text-center">
            <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">예약 내역이 없습니다</h3>
            <p className="text-muted-foreground mb-6">첫 예약을 시작해보세요!</p>
            <Button onClick={onBack} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              예약하러 가기
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{reservation.departure_location}</h3>
                      <p className="text-sm text-muted-foreground">→ {reservation.destination_location}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {reservation.status_display}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(reservation.departure_date).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{reservation.passenger_count}명</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{reservation.quote_amount?.toLocaleString()}원</span>
                  <Button size="sm" variant="outline">
                    상세보기
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
