"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Bus, Calendar, Users, MapPin, X, CreditCard } from "lucide-react"
import { getReservations, getReservation, cancelReservation, initiatePayment } from "@/lib/api"
import type { Reservation, ReservationStatus } from "@/types"

interface MyReservationsCompleteProps {
  onBack: () => void
  user: { name: string; email: string } | null
}

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  payment_waiting: "bg-orange-100 text-orange-700",
  payment_completed: "bg-green-100 text-green-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  dispatched: "bg-purple-100 text-purple-700",
  in_progress: "bg-cyan-100 text-cyan-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
  payment_failed: "bg-red-100 text-red-700",
}

const statusNames: Record<ReservationStatus, string> = {
  pending: "예약 대기",
  approved: "승인됨",
  payment_waiting: "결제 대기",
  payment_completed: "결제 완료",
  confirmed: "예약 확정",
  dispatched: "배차 완료",
  in_progress: "운행 중",
  completed: "운행 완료",
  cancelled: "취소됨",
  payment_failed: "결제 실패",
}

export function MyReservationsComplete({ onBack }: MyReservationsCompleteProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadReservations()
  }, [statusFilter])

  const loadReservations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getReservations({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      setReservations(response.results)
    } catch (err: any) {
      setError(err.message || "예약 목록을 불러오는 중 오류가 발생했습니다")
      console.error("예약 목록 조회 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await getReservation(id)
      setSelectedReservation(detail)
    } catch (err: any) {
      alert(err.message || "상세 정보를 불러오는 중 오류가 발생했습니다")
    }
  }

  const handleCancelReservation = async (id: number) => {
    if (!confirm("정말 예약을 취소하시겠습니까?")) return

    try {
      await cancelReservation(id)
      alert("예약이 취소되었습니다")
      setSelectedReservation(null)
      loadReservations()
    } catch (err: any) {
      alert(err.message || "예약 취소 중 오류가 발생했습니다")
    }
  }

  const handlePayment = async (reservationId: number) => {
    try {
      const paymentData = await initiatePayment(reservationId)

      // PortOne 결제 창 열기 (실제 구현은 별도 필요)
      alert(`결제 금액: ${paymentData.deposit_amount.toLocaleString()}원\n\nPortOne 결제 기능은 추가 구현이 필요합니다.`)

      // TODO: PortOne SDK 연동
    } catch (err: any) {
      alert(err.message || "결제 시작 중 오류가 발생했습니다")
    }
  }

  const filterButtons = [
    { value: "all", label: "전체" },
    { value: "pending", label: "대기" },
    { value: "payment_waiting", label: "결제대기" },
    { value: "payment_completed", label: "결제완료" },
    { value: "confirmed", label: "확정" },
    { value: "completed", label: "완료" },
  ]

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

      {/* 필터 */}
      <div className="sticky top-[68px] z-40 bg-white border-b px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === btn.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 예약 목록 */}
      <main className="px-4 py-6">
        {error && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : reservations.length === 0 ? (
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
              <Card key={reservation.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <h3 className="font-semibold text-foreground truncate">{reservation.departure_location}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground truncate">{reservation.destination_location}</p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ml-2 ${
                      statusColors[reservation.status]
                    }`}
                  >
                    {statusNames[reservation.status]}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(reservation.departure_date).toLocaleString("ko-KR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{reservation.passenger_count}명</span>
                    {reservation.is_multi_vehicle && (
                      <span className="text-orange-600">• {reservation.vehicle_count}대</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-primary">
                    {reservation.quote_amount?.toLocaleString()}원
                  </span>
                  <div className="flex gap-2">
                    {reservation.status === "payment_waiting" && (
                      <Button
                        size="sm"
                        onClick={() => handlePayment(reservation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        결제
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleViewDetail(reservation.id)}>
                      상세보기
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">예약 상세</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedReservation(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              {/* 상태 */}
              <div className="text-center py-3">
                <span
                  className={`inline-block text-sm font-medium px-4 py-2 rounded-full ${
                    statusColors[selectedReservation.status]
                  }`}
                >
                  {statusNames[selectedReservation.status]}
                </span>
              </div>

              {/* 운행 정보 */}
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Bus className="w-5 h-5 text-primary" />
                  운행 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">출발지</p>
                      <p className="text-muted-foreground">{selectedReservation.departure_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">도착지</p>
                      <p className="text-muted-foreground">{selectedReservation.destination_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">출발일시</p>
                      <p className="text-muted-foreground">
                        {new Date(selectedReservation.departure_date).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span>인원수: {selectedReservation.passenger_count}명</span>
                    {selectedReservation.is_multi_vehicle && (
                      <span className="text-orange-600 font-medium">
                        차량 {selectedReservation.vehicle_count}대
                      </span>
                    )}
                  </div>
                </div>
              </Card>

              {/* 견적 정보 */}
              {selectedReservation.quote && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold mb-3">견적 정보</h3>
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-primary">
                      {selectedReservation.quote.total_price.toLocaleString()}원
                    </div>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>거리: {selectedReservation.quote.distance_km.toLocaleString()}km</p>
                    <p>예상 소요시간: {selectedReservation.quote.estimated_hours.toLocaleString()}시간</p>
                  </div>
                  <div className="border-t pt-3 mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">예약금 (10%):</span>
                      <span className="font-medium">{selectedReservation.deposit_amount.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">잔금 (현장결제):</span>
                      <span className="font-medium">{selectedReservation.remaining_amount.toLocaleString()}원</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* 특이사항 */}
              {selectedReservation.special_requirements && (
                <Card className="p-4 bg-gray-50">
                  <h3 className="font-semibold mb-2">특이사항</h3>
                  <p className="text-sm text-muted-foreground">{selectedReservation.special_requirements}</p>
                </Card>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2 pt-4">
                {selectedReservation.status === "payment_waiting" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePayment(selectedReservation.id)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    예약금 결제
                  </Button>
                )}
                {selectedReservation.can_cancel && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleCancelReservation(selectedReservation.id)}
                  >
                    예약 취소
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
