"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { PhoneVerificationNew } from "@/components/phone-verification-new"
import type { QuoteResponse } from "@/types"

interface QuoteResultPageProps {
  quote: QuoteResponse
  onBack: () => void
  onSubmit: (phone: string) => Promise<void>
  onReservationComplete?: () => void
}

export function QuoteResultPage({ quote, onBack, onSubmit, onReservationComplete }: QuoteResultPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)

  const handleSubmit = async () => {
    // 전화번호 인증 모달 띄우기
    setShowPhoneVerification(true)
  }

  const handlePhoneVerified = async (phone: string) => {
    setShowPhoneVerification(false)
    setIsSubmitting(true)
    try {
      await onSubmit(phone)
      setShowConfirmModal(true)
    } catch (error) {
      console.error("예약 신청 오류:", error)
      alert("예약 신청 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToReservations = () => {
    setShowConfirmModal(false)
    if (onReservationComplete) {
      onReservationComplete()
    } else {
      onBack()
    }
  }

  const handleConfirmClose = () => {
    setShowConfirmModal(false)
    onBack()
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 pb-32">
        {/* 타이틀 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">예상 견적입니다</h1>
          <p className="text-gray-600">견적 금액을 확인하고 예약을 신청해 주세요</p>
        </div>

        {/* 견적 금액 카드 */}
        <Card className="mb-6 p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">예상 견적</p>
          <h2 className="text-4xl font-bold mb-3">
            {quote.total_price.toLocaleString()}원
          </h2>
          <p className="text-gray-600">
            {quote.vehicle_type_display} ({quote.is_multi_vehicle ? `${quote.vehicle_count}대` : '1대'})
          </p>
        </Card>

        {/* 나눠서 결제시 */}
        <Card className="mb-4">
          <div className="p-4">
            <h3 className="font-bold text-primary mb-4">나눠서 결제시</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">예약금</span>
                <span className="text-lg font-bold">
                  {quote.deposit_amount.toLocaleString()}원
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">잔금</span>
                <span className="text-lg font-bold">
                  {quote.remaining_amount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 한 번에 결제시 */}
        <Card>
          <div className="p-4">
            <h3 className="font-bold text-primary mb-4">한 번에 결제시</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">총 금액</span>
              <span className="text-lg font-bold">
                {quote.total_price.toLocaleString()}원
              </span>
            </div>
          </div>
        </Card>

        {/* 추가 정보 */}
        {quote.summary && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">견적 상세</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {quote.summary.base_info && (
                <p>• 거리/일정: {quote.summary.base_info}</p>
              )}
              {quote.summary.vehicle_season && (
                <p>• 차량/시즌: {quote.summary.vehicle_season}</p>
              )}
              {quote.summary.pricing_note && (
                <p>• {quote.summary.pricing_note}</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 py-6 text-base font-medium"
          >
            이전
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] bg-primary hover:bg-primary/90 text-white py-6 text-base font-bold rounded-xl"
          >
            {isSubmitting ? "처리 중..." : "예약 신청하기"}
          </Button>
        </div>
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm max-w-[400px] p-6 text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">예약 신청이 완료되었습니다</h3>
            <p className="text-gray-600 mb-6">
              예약이 확정되면 문자로 안내드리며,<br />
              이후 결제를 진행해 주세요
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleConfirmClose}
                className="flex-1"
              >
                홈으로
              </Button>
              <Button
                onClick={handleGoToReservations}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                내 예약 보기
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 전화번호 인증 모달 */}
      {showPhoneVerification && (
        <PhoneVerificationNew
          onClose={() => setShowPhoneVerification(false)}
          onVerified={handlePhoneVerified}
        />
      )}
    </div>
  )
}
