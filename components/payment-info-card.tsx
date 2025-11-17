"use client"

import { Payment } from "@/types"
import { ChevronRight } from "lucide-react"

interface PaymentInfoCardProps {
  payments: Payment[]  // 단일 payment에서 배열로 변경
  onViewDetails?: () => void
}

export function PaymentInfoCard({ payments, onViewDetails }: PaymentInfoCardProps) {
  // 결제 건이 없으면 렌더링하지 않음
  if (!payments || payments.length === 0) {
    return null
  }

  // 가장 최근 결제 일시 (정렬된 배열의 마지막)
  const latestPayment = payments[payments.length - 1]

  // 총 결제 금액
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  // 결제 타입 레이블 생성
  const paymentTypeLabel = payments.length > 1
    ? payments.map(p => p.payment_type_display).join(' + ')
    : payments[0].payment_type_display || '결제'

  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
      <h2 className="text-base font-bold mb-4">결제/환불 정보</h2>

      <div className="space-y-3">
        {/* 결제 일시 - 가장 최근 결제 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">결제 일시</span>
          <span className="font-medium">
            {latestPayment.paid_at
              ? new Date(latestPayment.paid_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }) + ' ' + new Date(latestPayment.paid_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              : '-'
            }
          </span>
        </div>

        {/* 결제 타입 (예약금 + 잔금) */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {paymentTypeLabel}
          </span>
          <span className="font-medium">
            {totalAmount.toLocaleString()}원
          </span>
        </div>

        {/* 결제 수단 - 가장 최근 결제 */}
        {latestPayment.payment_method && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">카드사</span>
            <span className="font-medium">{latestPayment.payment_method}</span>
          </div>
        )}

        {/* 결제/환불 내역 자세히 보기 */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full mt-2 py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            결제/환불 내역 자세히 보기
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
