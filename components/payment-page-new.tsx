"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronDown, ChevronUp, ArrowRight, CreditCard, Percent } from "lucide-react"
import { initiatePayment } from "@/lib/api"
import type { Reservation } from "@/types"

interface PaymentPageNewProps {
  reservation: Reservation
  onClose: () => void
  onSuccess: () => void
}

export function PaymentPageNew({ reservation, onClose, onSuccess }: PaymentPageNewProps) {
  const [showReservationInfo, setShowReservationInfo] = useState(false)
  const [showPriceInfo, setShowPriceInfo] = useState(false)
  const [paymentType, setPaymentType] = useState<"full" | "deposit" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!paymentType) {
      alert("결제 방식을 선택해주세요")
      return
    }

    try {
      setIsProcessing(true)
      const paymentConfig = await initiatePayment(reservation.id)

      if (!window.IMP) {
        alert("결제 모듈을 불러올 수 없습니다.")
        return
      }

      window.IMP.init(process.env.NEXT_PUBLIC_PORTONE_USER_CODE)

      // 결제 금액 설정 (한번에 결제 vs 나눠서 결제)
      const amount = paymentType === "full"
        ? Number(reservation.quote_amount)
        : reservation.deposit_amount

      const config = {
        ...paymentConfig.payment_config,
        amount: amount,
        name: paymentType === "full" ? "킹버스 전액 결제" : "킹버스 예약금",
      }

      window.IMP.request_pay(config, async (response: any) => {
        if (response.success) {
          alert("결제가 완료되었습니다!")
          onSuccess()
          onClose()
        } else {
          alert(`결제 실패: ${response.error_msg}`)
        }
      })
    } catch (error) {
      console.error("결제 시작 오류:", error)
      alert("결제를 시작할 수 없습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  // 결제 방식 선택 화면
  if (!paymentType) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[600px] mx-auto">
        {/* 헤더 */}
        <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
          <div className="flex items-center px-4 py-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">결제</h1>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* 한번에 결제 */}
          <Card
            onClick={() => setPaymentType("full")}
            className="p-6 mb-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">한번에 결제</h3>
                <p className="text-sm text-gray-600">총 금액이 한 번에 결제됩니다</p>
              </div>
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
          </Card>

          {/* 나눠서 결제 */}
          <Card
            onClick={() => setPaymentType("deposit")}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">나눠서 결제</h3>
                <p className="text-sm text-gray-600">
                  예약금 결제 후에 ○○일 잔금이 결제 됩니다.
                </p>
              </div>
              <Percent className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </main>

        <div className="p-4 safe-area-inset">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl"
          >
            선택하기
          </Button>
        </div>
      </div>
    )
  }

  // 결제하기 화면
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold">결제하기</h1>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {/* 예약 번호 */}
        <button
          onClick={() => setShowReservationInfo(!showReservationInfo)}
          className="w-full flex items-center justify-between p-4 mb-3 bg-white rounded-lg border"
        >
          <span className="text-sm text-gray-600">예약 번호 : {reservation.id}</span>
          {showReservationInfo ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* 운행 정보 */}
        <div className="mb-4">
          <h3 className="text-base font-bold mb-3">운행 정보</h3>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-bold mb-1">{reservation.departure_location}</h4>
                <p className="text-xs text-gray-500">
                  {new Date(reservation.departure_date).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit'
                  })} 오후 {new Date(reservation.departure_date).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </p>
                <span className="text-xs text-gray-500">출발</span>
              </div>

              <div className="mx-4">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1 text-right">
                <h4 className="font-bold mb-1">{reservation.destination_location}</h4>
                <p className="text-xs text-gray-500 invisible">placeholder</p>
                <span className="text-xs text-gray-500">도착</span>
              </div>
            </div>

            {/* 왕복인 경우 */}
            {reservation.is_round_trip && reservation.return_date && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex-1">
                  <h4 className="font-bold mb-1">{reservation.destination_location}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(reservation.return_date).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit'
                    })} 오전 {new Date(reservation.return_date).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                  <span className="text-xs text-gray-500">출발</span>
                </div>

                <div className="mx-4">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </div>

                <div className="flex-1 text-right">
                  <h4 className="font-bold mb-1">{reservation.departure_location}</h4>
                  <p className="text-xs text-gray-500 invisible">placeholder</p>
                  <span className="text-xs text-gray-500">복귀</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* 운행 금액 */}
        <button
          onClick={() => setShowPriceInfo(!showPriceInfo)}
          className="w-full flex items-center justify-between p-4 mb-3 bg-white rounded-lg border"
        >
          <span className="text-base font-bold">운행 금액</span>
          {showPriceInfo ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showPriceInfo && (
          <Card className="p-4 mb-4">
            <h3 className="text-base font-bold mb-3">견적</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">예약금</span>
                <span className="font-bold">
                  {reservation.deposit_amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">잔금</span>
                <span className="font-bold">
                  {reservation.remaining_amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 결제 요약 */}
        <Card className="p-4 bg-blue-50 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">
              {paymentType === "full" ? "전액 결제" : "예약금 결제"}
            </span>
            <span className="text-xl font-bold text-primary">
              {paymentType === "full"
                ? Number(reservation.quote_amount).toLocaleString()
                : reservation.deposit_amount.toLocaleString()}원
            </span>
          </div>
          {paymentType === "deposit" && (
            <p className="text-xs text-gray-600 mt-2">
              잔금 {reservation.remaining_amount.toLocaleString()}원은 이후 결제됩니다
            </p>
          )}
        </Card>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl"
        >
          {isProcessing ? "처리 중..." : `${
            paymentType === "full"
              ? Number(reservation.quote_amount).toLocaleString()
              : reservation.deposit_amount.toLocaleString()
          }원 결제하기`}
        </Button>
      </div>
    </div>
  )
}
