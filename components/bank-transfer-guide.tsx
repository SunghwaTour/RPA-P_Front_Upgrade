"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Copy, Check, Building2, CreditCard, Banknote } from "lucide-react"
import { selectBankTransfer } from "@/lib/api"
import type { Reservation, PaymentOption } from "@/types"

interface BankTransferGuideProps {
  reservation: Reservation
  onBack: () => void
  onComplete: () => void
}

export function BankTransferGuide({ reservation, onBack, onComplete }: BankTransferGuideProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  const totalAmount = Number(reservation.quote_amount || 0)
  const depositAmount = Number(reservation.deposit_amount || 0)
  const remainingAmount = Number(reservation.remaining_amount || 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    if (!selectedOption) return
    try {
      setIsSubmitting(true)
      await selectBankTransfer(reservation.id, selectedOption)
      onComplete()
    } catch (err: any) {
      alert(err.message || "처리 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 1: 결제 방식 선택
  if (step === 1) {
    return (
      <div className="min-h-screen bg-background max-w-[600px] mx-auto">
        <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
          <div className="flex items-center px-4 py-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">결제</h1>
          </div>
        </header>

        <main className="p-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">결제 방식을 선택해주세요</h2>
            <p className="text-sm text-gray-500">계좌이체로 결제가 진행됩니다.</p>
          </div>

          {/* 한번에 결제 */}
          <button
            onClick={() => { setSelectedOption('full'); setStep(2) }}
            className="w-full bg-white rounded-xl p-5 mb-3 text-left border-2 border-gray-100 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-base">한번에 결제</h3>
                <p className="text-xs text-gray-500">총 금액을 한번에 입금</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">입금 금액</span>
                <span className="text-lg font-bold text-primary">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </button>

          {/* 나눠서 결제 */}
          <button
            onClick={() => { setSelectedOption('split'); setStep(2) }}
            className="w-full bg-white rounded-xl p-5 text-left border-2 border-gray-100 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-base">나눠서 결제</h3>
                <p className="text-xs text-gray-500">예약금 먼저, 잔금은 추후 입금</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">예약금 (10%)</span>
                <span className="text-lg font-bold text-primary">{depositAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">잔금</span>
                <span className="text-sm text-gray-400">{remainingAmount.toLocaleString()}원 (추후 안내)</span>
              </div>
            </div>
          </button>
        </main>
      </div>
    )
  }

  // Step 2: 계좌이체 안내
  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">계좌이체 안내</h1>
        </div>
      </header>

      <main className="p-4 pb-32">
        {/* 예약 요약 */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">예약 정보</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm">{reservation.departure_location}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="font-bold text-sm">{reservation.destination_location}</span>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              {new Date(reservation.departure_date).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}{" "}
              {new Date(reservation.departure_date).toLocaleTimeString('ko-KR', {
                hour: '2-digit', minute: '2-digit', hour12: true
              }).replace("AM", "오전").replace("PM", "오후")}
            </p>
            <p>{reservation.passenger_count}명 · {reservation.vehicle_count}대</p>
          </div>
        </div>

        {/* 입금 계좌 안내 */}
        <div className="bg-blue-50 rounded-xl p-5 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">입금 계좌 안내</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">은행</span>
              <span className="font-semibold text-blue-900">국민은행</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">계좌번호</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-900 tracking-wide">81430104241731</span>
                <button
                  onClick={() => copyToClipboard("81430104241731")}
                  className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">예금주</span>
              <span className="font-semibold text-blue-900">김형주(킹버스)</span>
            </div>
          </div>
        </div>

        {/* 입금 금액 안내 */}
        <div className="bg-white rounded-xl p-5 mb-4 border border-gray-100">
          <h3 className="font-bold mb-3">입금 금액</h3>
          {selectedOption === 'full' ? (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">입금할 금액</span>
              <span className="text-xl font-bold text-primary">{totalAmount.toLocaleString()}원</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">입금할 예약금</span>
                <span className="text-xl font-bold text-primary">{depositAmount.toLocaleString()}원</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">잔금</span>
                  <span className="text-sm text-gray-400">{remainingAmount.toLocaleString()}원은 추후 안내</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            입금 확인 후 예약이 확정됩니다. 입금자명은 예약자명과 동일하게 해주세요.
          </p>
        </div>
      </main>

      {/* 하단 확인 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset">
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl"
        >
          {isSubmitting ? "처리 중..." : "확인"}
        </Button>
      </div>
    </div>
  )
}
