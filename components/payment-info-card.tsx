"use client"

import { useState } from "react"
import { Payment } from "@/types"
import { ChevronDown } from "lucide-react"

interface PaymentInfoCardProps {
  payments: Payment[]
}

export function PaymentInfoCard({ payments }: PaymentInfoCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (!payments || payments.length === 0) {
    return null
  }

  const latestPayment = payments[payments.length - 1]
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const paymentTypeLabel = payments.length > 1
    ? payments.map(p => p.payment_type_display).join(' + ')
    : payments[0].payment_type_display || '결제'

  const formatPaymentMethod = (method: string) => {
    const map: Record<string, string> = {
      card: '카드',
      trans: '계좌이체',
      vbank: '가상계좌',
      bank_transfer: '계좌이체',
      manual: '수동 입금',
    }
    return map[method] || method
  }

  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
      <h2 className="text-base font-bold mb-4">결제/환불 정보</h2>

      <div className="space-y-3">
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

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{paymentTypeLabel}</span>
          <span className="font-medium">{totalAmount.toLocaleString()}원</span>
        </div>

        {latestPayment.payment_method && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">결제 수단</span>
            <span className="font-medium">{formatPaymentMethod(latestPayment.payment_method)}</span>
          </div>
        )}

        {/* 아코디언 토글 버튼 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          결제/환불 내역 자세히 보기
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* 아코디언 상세 내역 */}
        {expanded && (
          <div className="space-y-2 pt-1">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">{payment.payment_type_display || '결제'}</span>
                  <span className="font-semibold">{Number(payment.amount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 수단</span>
                  <span>{formatPaymentMethod(payment.payment_method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">결제 일시</span>
                  <span>
                    {payment.paid_at
                      ? new Date(payment.paid_at).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: '2-digit', day: '2-digit'
                        }) + ' ' + new Date(payment.paid_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit', minute: '2-digit', hour12: false
                        })
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상태</span>
                  <span className={
                    payment.status === 'paid' ? 'text-emerald-600 font-medium'
                    : payment.status === 'cancelled' || payment.status === 'refunded' ? 'text-red-500 font-medium'
                    : 'text-gray-600'
                  }>
                    {payment.status_display}
                  </span>
                </div>
                {payment.apply_num && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">승인번호</span>
                    <span className="text-gray-600">{payment.apply_num}</span>
                  </div>
                )}
                {payment.cancel_reason && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">취소 사유</span>
                    <span className="text-red-500">{payment.cancel_reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
