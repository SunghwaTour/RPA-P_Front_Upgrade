"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, ArrowRight, ArrowLeftRight } from "lucide-react"
import { getReservations } from "@/lib/api"
import { ReservationDetailNew } from "@/components/reservation-detail-new"
import type { Reservation } from "@/types"

interface MyReservationsNewProps {
  onBack: () => void
  user: { name: string; email: string } | null
}

export function MyReservationsNew({ onBack, user }: MyReservationsNewProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const response = await getReservations({ page: 1 })
      setReservations(response.results)
    } catch (error) {
      console.error("예약 목록 조회 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 예약 상세 페이지 표시
  if (selectedReservation) {
    return (
      <ReservationDetailNew
        reservation={selectedReservation}
        onBack={() => {
          setSelectedReservation(null)
          loadReservations() // 목록 새로고침
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">내 예약</h1>
        </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">예약 내역이 없습니다</p>
            <Button onClick={onBack} className="bg-primary text-white">
              예약하러 가기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((reservation) => (
              <Card
                key={reservation.id}
                onClick={() => setSelectedReservation(reservation)}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                {/* 상태와 왕복/편도 배지 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {reservation.status_display}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  {!reservation.is_round_trip ? (
                    <span className="text-sm text-gray-600">
                      {new Date(reservation.departure_date).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit'
                      })}{" "}
                      {new Date(reservation.departure_date).toLocaleTimeString('ko-KR', {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      }).replace("AM", "오전").replace("PM", "오후")}{" "}
                      출발
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                      왕복
                    </span>
                  )}
                </div>

                {/* 출발지 → 도착지 */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  {/* 출발지 */}
                  <div className="text-left">
                    <h3 className="font-bold text-base mb-1">{reservation.departure_location}</h3>
                    {reservation.is_round_trip && (
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(reservation.departure_date).toLocaleDateString('ko-KR', {
                          month: '2-digit',
                          day: '2-digit'
                        })}{" "}
                        {new Date(reservation.departure_date).toLocaleTimeString('ko-KR', {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        }).replace("AM", "오전").replace("PM", "오후")}
                      </p>
                    )}
                    <span className="text-xs text-gray-500">출발</span>
                  </div>

                  {/* 아이콘 */}
                  <div className="flex items-center justify-center pt-1">
                    {reservation.is_round_trip ? (
                      <img src="/myReservation/roundTrip.svg" alt="왕복" className="w-5 h-5" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* 도착지 */}
                  <div className="text-right">
                    <h3 className="font-bold text-base mb-1">{reservation.destination_location}</h3>
                    {reservation.is_round_trip && reservation.return_date ? (
                      <>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(reservation.return_date).toLocaleDateString('ko-KR', {
                            month: '2-digit',
                            day: '2-digit'
                          })}{" "}
                          {new Date(reservation.return_date).toLocaleTimeString('ko-KR', {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          }).replace("AM", "오전").replace("PM", "오후")}
                        </p>
                        <span className="text-xs text-gray-500">복귀</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">도착</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
