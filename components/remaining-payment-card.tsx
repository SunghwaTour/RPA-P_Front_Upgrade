"use client"

import { Button } from "@/components/ui/button"

interface RemainingPaymentCardProps {
  remainingAmount: number
  paymentDeadline: string // ISO 8601 date string
  onPayClick: () => void
}

export function RemainingPaymentCard({ remainingAmount, paymentDeadline, onPayClick }: RemainingPaymentCardProps) {
  // D-day 계산
  const calculateDday = (deadline: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const dday = calculateDday(paymentDeadline)

  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">잔금</h2>
        <span className={`text-sm font-medium ${dday <= 3 ? 'text-red-600' : 'text-primary'}`}>
          D-{dday}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {/* 결제 기한 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">결제 기한</span>
          <span className="font-medium">
            {new Date(paymentDeadline).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).replace(/\. /g, '.').replace(/\.$/, '')} {new Date(paymentDeadline).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </span>
        </div>

        {/* 남은 결제 금액 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">남은 결제 금액</span>
          <span className="font-bold text-lg">
            {Number(remainingAmount).toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 결제하기 버튼 */}
      <Button
        onClick={onPayClick}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg"
      >
        결제하기
      </Button>
    </div>
  )
}
