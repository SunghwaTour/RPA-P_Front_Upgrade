"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Bus, Calendar } from "lucide-react"
import { getReservations, getReservation, cancelReservation } from "@/lib/api"
import type { Reservation, ReservationStatus } from "@/types"
import { BankTransferGuide } from "./bank-transfer-guide"

interface MyReservationsCompleteProps {
  onBack: () => void
  user: { name: string; email: string } | null
}

const statusColors: Record<ReservationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  payment_waiting: "bg-orange-100 text-orange-700",
  deposit_pending: "bg-amber-100 text-amber-700",
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
  deposit_pending: "입금 확인 대기",
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
  const [showPaymentScreen, setShowPaymentScreen] = useState(false)

  useEffect(() => {
    loadReservations()
  }, [])

  const loadReservations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getReservations({})
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
              <Card
                key={reservation.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(reservation.id)}
              >
                {/* Header: Status + Trip type badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-foreground">
                      {statusNames[reservation.status]}
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {reservation.return_date ? "왕복" : "편도"}
                  </span>
                </div>

                {/* Trip details: departure -> destination */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                  {/* Departure location (always departure) */}
                  <div className="text-left">
                    <h4 className="font-semibold text-base text-foreground mb-1">
                      {reservation.departure_location}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(reservation.departure_date).toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit"
                      })}{" "}
                      {reservation.departure_date.includes("오후") || reservation.departure_date.includes("오전")
                        ? reservation.departure_date.split(" ").slice(-2).join(" ")
                        : new Date(reservation.departure_date).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          }).replace("AM", "오전").replace("PM", "오후")
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">출발</p>
                  </div>

                  {/* Arrow icon */}
                  <div className="flex items-center justify-center pt-1">
                    {reservation.return_date ? (
                      <img src="/myReservation/roundTrip.svg" alt="왕복" className="w-5 h-5" />
                    ) : (
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </div>

                  {/* Destination location (always destination) */}
                  <div className="text-right">
                    <h4 className="font-semibold text-base text-foreground mb-1">
                      {reservation.destination_location}
                    </h4>
                    {reservation.return_date ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(reservation.return_date).toLocaleDateString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit"
                          })}{" "}
                          {reservation.return_date.includes("오후") || reservation.return_date.includes("오전")
                            ? reservation.return_date.split(" ").slice(-2).join(" ")
                            : new Date(reservation.return_date).toLocaleTimeString("ko-KR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true
                              }).replace("AM", "오전").replace("PM", "오후")
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">복귀</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">도착</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedReservation(null)}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-lg font-bold">예약 상세</h2>
          </div>

          <div className="px-4 py-6 space-y-4">
            {/* Reservation number and status */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">예약 번호 : {selectedReservation.id}</p>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  statusColors[selectedReservation.status]
                }`}
              >
                {statusNames[selectedReservation.status]}
              </span>
            </div>

            {/* 운행 정보 */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">운행 정보</h3>
                {selectedReservation.return_date && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">왕복</span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{selectedReservation.departure_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {new Date(selectedReservation.departure_date).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit"
                    })}{" "}
                    {new Date(selectedReservation.departure_date).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false
                    })}
                  </span>
                  <span className="text-muted-foreground">출발</span>
                </div>
                {selectedReservation.return_date ? (
                  <>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">{selectedReservation.destination_location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {new Date(selectedReservation.return_date).toLocaleDateString("ko-KR", {
                          month: "2-digit",
                          day: "2-digit"
                        })}{" "}
                        {new Date(selectedReservation.return_date).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        })}
                      </span>
                      <span className="text-muted-foreground">도착</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">{selectedReservation.destination_location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 버스 정보 */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-base mb-3">버스 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">인승</span>
                  <span className="font-medium">{selectedReservation.passenger_count}인승</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">대수</span>
                  <span className="font-medium">{selectedReservation.vehicle_count}대</span>
                </div>
              </div>
            </div>

            {/* 고객 정보 */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-base mb-3">고객 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">고객명</span>
                  <span className="font-medium">{selectedReservation.customer?.name || "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">연락처</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedReservation.customer?.phone || "-"}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">이메일</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedReservation.customer?.email || "-"}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 요청사항 */}
            <div className="border-b pb-4">
              <h3 className="font-semibold text-base mb-3">요청사항</h3>
              <p className="text-sm text-muted-foreground">
                {selectedReservation.special_requirements || "없는데 있습니다"}
              </p>
            </div>

            {/* 입금 계좌 안내 */}
            {(selectedReservation.status === 'payment_waiting' || selectedReservation.status === 'deposit_pending' || selectedReservation.payment_option) && selectedReservation.payment_option && (
              <div className="border-b pb-4">
                <h3 className="font-semibold text-base mb-3">입금 안내</h3>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">은행</span>
                      <span className="font-semibold text-blue-900">국민은행</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">계좌번호</span>
                      <span className="font-semibold text-blue-900">81430104241731</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">예금주</span>
                      <span className="font-semibold text-blue-900">김형주(킹버스)</span>
                    </div>
                  </div>
                  <div className="border-t border-blue-200 mt-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700">
                        {selectedReservation.payment_option === 'full' ? '입금 금액' : '예약금'}
                      </span>
                      <span className="font-bold text-blue-900">
                        {selectedReservation.payment_option === 'full'
                          ? `${Number(selectedReservation.quote_amount || 0).toLocaleString()}원`
                          : `${Number(selectedReservation.deposit_amount || 0).toLocaleString()}원`
                        }
                      </span>
                    </div>
                    {selectedReservation.payment_option === 'split' && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-blue-500">잔금</span>
                        <span className="text-xs text-blue-500">{Number(selectedReservation.remaining_amount || 0).toLocaleString()}원 (추후 안내)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 결제/환불 정보 */}
            {selectedReservation.status === "payment_completed" && selectedReservation.latest_payment && (
              <div className="pb-4">
                <h3 className="font-semibold text-base mb-3">결제/환불 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예약금</span>
                    <span className="font-medium">{Number(selectedReservation.deposit_amount).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 금액</span>
                    <span className="font-medium">{Number(selectedReservation.latest_payment.amount).toLocaleString()}원</span>
                  </div>
                  {selectedReservation.latest_payment.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제 수단</span>
                      <span className="font-medium">
                        {selectedReservation.latest_payment.payment_method === "card" ? "카드" :
                         selectedReservation.latest_payment.payment_method === "trans" ? "계좌이체" :
                         selectedReservation.latest_payment.payment_method === "vbank" ? "가상계좌" :
                         selectedReservation.latest_payment.payment_method}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom buttons */}
            <div className="space-y-3">
              {selectedReservation.status === "payment_waiting" && (
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setShowPaymentScreen(true)}
                >
                  결제하기
                </Button>
              )}
              {selectedReservation.status === "payment_completed" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // TODO: Navigate to payment history detail page
                    alert("결제/환불 내역 페이지로 이동 (구현 예정)")
                  }}
                >
                  결제/환불 내역 자세히 보기
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Screen */}
      {showPaymentScreen && selectedReservation && (
        <BankTransferGuide
          reservation={selectedReservation}
          onBack={() => setShowPaymentScreen(false)}
          onComplete={() => {
            setShowPaymentScreen(false)
            setSelectedReservation(null)
            loadReservations()
          }}
        />
      )}
    </div>
  )
}
