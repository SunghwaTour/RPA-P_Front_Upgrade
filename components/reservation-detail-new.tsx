"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ArrowLeftRight, Phone, Mail, Copy, AlertCircle } from "lucide-react"
import { cancelReservation, initiateRemainingPayment } from "@/lib/api"
import { PaymentPageNew } from "@/components/payment-page-new"
import { PaymentInfoCard } from "@/components/payment-info-card"
import { RemainingPaymentCard } from "@/components/remaining-payment-card"
import { DispatchInfoCard } from "@/components/dispatch-info-card"
import { requestPortOnePayment } from "@/lib/portone"
import type { Reservation } from "@/types"

interface ReservationDetailNewProps {
  reservation: Reservation
  onBack: () => void
}

export function ReservationDetailNew({ reservation, onBack }: ReservationDetailNewProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  const handleCancel = async () => {
    try {
      setIsCancelling(true)
      await cancelReservation(reservation.id)
      alert("예약이 취소되었습니다.")
      onBack()
    } catch (error: any) {
      console.error("예약 취소 오류:", error)
      alert(error.response?.data?.error || "예약 취소 중 오류가 발생했습니다.")
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const canCancel = !['cancelled', 'completed', 'dispatched', 'in_progress'].includes(reservation.status)
  const canPay = reservation.status === 'payment_waiting'

  // 잔금 결제 핸들러
  const handleRemainingPayment = async () => {
    try {
      const response = await initiateRemainingPayment(reservation.id)
      await requestPortOnePayment(response.payment_config)
      // 결제 완료 후 페이지 새로고침 또는 상태 업데이트
      window.location.reload()
    } catch (error: any) {
      console.error("잔금 결제 오류:", error)
      alert(error.message || "잔금 결제 중 오류가 발생했습니다.")
    }
  }

  // 결제 페이지 표시
  if (showPayment) {
    return (
      <PaymentPageNew
        reservation={reservation}
        onClose={() => setShowPayment(false)}
        onSuccess={onBack}
      />
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("복사되었습니다")
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">예약 상세</h1>
          </div>
          <span className="text-sm text-gray-600">
            {new Date(reservation.created_at).toLocaleDateString('ko-KR', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </header>

      <main className="p-4 pb-32">
        {/* 예약 번호 및 상태 */}
        <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">예약 번호 :</span>
              <span className="font-medium">{reservation.id}</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              reservation.status === 'payment_waiting' ? 'bg-pink-100 text-pink-700' :
              reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
              reservation.status === 'completed' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {reservation.status_display}
            </span>
          </div>

          {/* 운행 정보 */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4">운행 정보</h2>
            {/* 출발지 → 도착지 */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start mb-3">
              {/* 출발지 */}
              <div className="text-left">
                <h3 className="font-bold text-base mb-1">{reservation.departure_location}</h3>
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
          </div>

          {/* 버스 정보 */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4">버스 정보</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">인승</span>
                <span className="font-medium">{reservation.passenger_count}인승</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">대수</span>
                <span className="font-medium">{reservation.vehicle_count}대</span>
              </div>
            </div>
          </div>

          {/* 고객 정보 */}
          <div className="mb-6">
            <h2 className="text-base font-bold mb-4">고객 정보</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">고객명</span>
                <span className="font-medium">{reservation.customer?.name || '정보 없음'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">연락처</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{reservation.customer?.phone || '정보 없음'}</span>
                  {reservation.customer?.phone && (
                    <button
                      onClick={() => window.location.href = `tel:${reservation.customer?.phone}`}
                      className="text-primary"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">이메일</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{reservation.customer?.email || '정보 없음'}</span>
                  {reservation.customer?.email && (
                    <button
                      onClick={() => copyToClipboard(reservation.customer?.email || '')}
                      className="text-primary"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 요청사항 */}
          <div>
            <h2 className="text-base font-bold mb-2">요청사항</h2>
            <p className="text-sm text-gray-700">
              {reservation.special_requirements || '없는데 있습니다'}
            </p>
          </div>
        </div>

        {/* 결제/환불 정보 카드 - 결제가 완료된 경우 */}
        {reservation.latest_payment && reservation.latest_payment.status === 'paid' && (
          <PaymentInfoCard
            payment={reservation.latest_payment}
            onViewDetails={() => {
              // TODO: 결제/환불 내역 상세 페이지로 이동
              console.log("결제 상세 보기")
            }}
          />
        )}

        {/* 잔금 결제 카드 - 예약금만 결제하고 잔금이 남은 경우 */}
        {reservation.needs_remaining_payment && reservation.departure_date && (
          <RemainingPaymentCard
            remainingAmount={reservation.remaining_amount}
            paymentDeadline={reservation.departure_date} // 출발 3일 전을 기한으로 설정
            onPayClick={handleRemainingPayment}
          />
        )}

        {/* 운행 상세 카드 - 전액 결제 완료 또는 배차 완료 시 */}
        {(reservation.status === 'confirmed' || reservation.status === 'dispatched' || reservation.status === 'in_progress') && (
          <DispatchInfoCard
            vehicleCount={reservation.vehicle_count}
            passengerCount={reservation.passenger_count}
            driverInfo={
              reservation.assigned_driver_id
                ? {
                    id: reservation.assigned_driver_id,
                    name: '유정노', // TODO: 실제 기사 정보 API 연동
                    phone: '031-1212-1212'
                  }
                : undefined
            }
            dispatchedAt={reservation.approved_at || undefined}
          />
        )}

        {/* 예약 취소 링크 */}
        {canCancel && (
          <div className="text-center">
            <button
              onClick={() => setShowCancelDialog(true)}
              className="text-gray-500 underline text-sm"
            >
              예약 취소
            </button>
          </div>
        )}
      </main>

      {/* 하단 고정 버튼 */}
      {canPay && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset">
          <Button
            onClick={() => setShowPayment(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl"
          >
            결제하기
          </Button>
        </div>
      )}

      {/* 취소 확인 다이얼로그 */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-[400px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-bold">예약을 취소하시겠습니까?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              취소 후에는 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="flex-1"
                disabled={isCancelling}
              >
                아니요
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isCancelling ? "취소 중..." : "네, 취소합니다"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
