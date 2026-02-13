"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { getRefundInfo, cancelReservation } from "@/lib/api"
import type { Reservation } from "@/types"

interface CancellationModalProps {
  reservation: Reservation
  onClose: () => void
  onCancelled: () => void
}

const REFUND_POLICY = [
  { days: "10일 이상", rate: 100 },
  { days: "9일 전", rate: 80 },
  { days: "8일 전", rate: 60 },
  { days: "7일 전", rate: 40 },
  { days: "6일 전", rate: 20 },
  { days: "5일 이하", rate: 0 },
]

const BANKS = [
  "국민은행", "신한은행", "우리은행", "하나은행", "농협은행",
  "기업은행", "카카오뱅크", "토스뱅크", "SC제일은행", "대구은행",
  "부산은행", "경남은행", "광주은행", "전북은행", "제주은행",
  "새마을금고", "신협", "우체국", "수협은행", "산업은행",
]

export function CancellationModal({ reservation, onClose, onCancelled }: CancellationModalProps) {
  const [loading, setLoading] = useState(true)
  const [refundInfo, setRefundInfo] = useState<{
    paid_amount: number
    refund_rate: number
    refund_amount: number
    penalty_amount: number
    days_until_departure: number
  } | null>(null)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolder, setAccountHolder] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 항상 백엔드에서 결제 여부 확인 (프론트 데이터 불일치 방지)
  const hasPaidPayments = refundInfo ? refundInfo.paid_amount > 0 : false

  useEffect(() => {
    loadRefundInfo()
  }, [])

  const loadRefundInfo = async () => {
    try {
      const info = await getRefundInfo(reservation.id)
      setRefundInfo(info)
    } catch (err: any) {
      console.error("환불 정보 조회 오류:", err)
      // API 실패 시 결제 없는 것으로 처리 (단순 취소 허용)
      setRefundInfo({ paid_amount: 0, refund_rate: 0, refund_amount: 0, penalty_amount: 0, days_until_departure: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (hasPaidPayments && (!bankName || !accountNumber || !accountHolder)) {
      setError("환불 계좌 정보를 모두 입력해주세요.")
      return
    }

    try {
      setIsCancelling(true)
      setError(null)
      await cancelReservation(reservation.id, {
        reason: "고객 요청",
        ...(hasPaidPayments ? {
          refund_bank_name: bankName,
          refund_account_number: accountNumber,
          refund_account_holder: accountHolder,
        } : {}),
      })
      onCancelled()
    } catch (err: any) {
      console.error("예약 취소 오류:", err)
      setError(err.message || "예약 취소 중 오류가 발생했습니다.")
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-[440px] p-6 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">환불 정보를 불러오는 중...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-orange-500 shrink-0" />
          <h3 className="text-lg font-bold">예약 취소</h3>
        </div>

        {/* Refund Policy */}
        {hasPaidPayments && (
          <>
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">환불 정책 안내</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                {REFUND_POLICY.map((item) => (
                  <div key={item.days} className="flex justify-between">
                    <span className="text-gray-600">출발 {item.days}</span>
                    <span className={`font-medium ${
                      refundInfo && refundInfo.refund_rate === item.rate
                        ? 'text-primary font-bold'
                        : item.rate === 0 ? 'text-red-500' : 'text-gray-700'
                    }`}>
                      {item.rate === 0 ? '환불 불가' : `${item.rate}% 환불`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Current refund info */}
            {refundInfo && (
              <div className="mb-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-orange-700">현재 상태</span>
                    <span className="font-semibold text-orange-900">
                      출발 D-{refundInfo.days_until_departure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">결제 금액</span>
                    <span className="font-semibold text-orange-900">
                      {Number(refundInfo.paid_amount).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-700">환불 예정</span>
                    <span className="font-bold text-orange-900">
                      {Number(refundInfo.refund_amount).toLocaleString()}원 ({refundInfo.refund_rate}%)
                    </span>
                  </div>
                  {refundInfo.penalty_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-red-600">위약금</span>
                      <span className="font-semibold text-red-700">
                        {Number(refundInfo.penalty_amount).toLocaleString()}원
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Refund account form */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">환불 계좌 정보</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">은행</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">은행을 선택해주세요</option>
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">계좌번호</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="계좌번호를 입력해주세요"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">예금주</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="예금주명을 입력해주세요"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Non-paid reservation simple message */}
        {!hasPaidPayments && (
          <p className="text-gray-600 mb-6">
            예약을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다.
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isCancelling}
          >
            돌아가기
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isCancelling ? "취소 중..." : "예약 취소하기"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
