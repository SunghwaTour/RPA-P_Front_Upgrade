"use client"

import { Payment } from "@/types"
import { ChevronRight } from "lucide-react"

interface PaymentInfoCardProps {
  payment: Payment
  onViewDetails?: () => void
}

export function PaymentInfoCard({ payment, onViewDetails }: PaymentInfoCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
      <h2 className="text-base font-bold mb-4">결제/환불 정보</h2>

      <div className="space-y-3">
        {/* 결제 일시 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">결제 일시</span>
          <span className="font-medium">
            {payment.paid_at
              ? new Date(payment.paid_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                }) + ' ' + new Date(payment.paid_at).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              : '-'
            }
          </span>
        </div>

        {/* 예약금/잔금 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {payment.payment_type_display || '예약금'}
          </span>
          <span className="font-medium">
            {Number(payment.amount).toLocaleString()}원
          </span>
        </div>

        {/* 결제 수단 */}
        {payment.payment_method && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">카드사</span>
            <span className="font-medium">{payment.payment_method}</span>
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
