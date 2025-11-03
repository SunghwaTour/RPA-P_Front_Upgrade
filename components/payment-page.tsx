"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Building2, Smartphone } from "lucide-react"
import { initiatePayment, verifyPayment } from "@/lib/api"
import { loadPortOneScript, initPortOne, requestPortOnePayment } from "@/lib/portone"
import type { PaymentInitiateResponse } from "@/types"

interface PaymentPageProps {
  reservationId: number
  onBack: () => void
  onSuccess: () => void
}

export function PaymentPage({ reservationId, onBack, onSuccess }: PaymentPageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentInitiateResponse | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<"card" | "trans" | "vbank">("card")

  useEffect(() => {
    initializePayment()
  }, [reservationId])

  const initializePayment = async () => {
    setLoading(true)
    setError(null)

    try {
      // PortOne 스크립트 로드
      await loadPortOneScript()

      // PortOne 초기화
      const userCode = process.env.NEXT_PUBLIC_PORTONE_USER_CODE
      if (!userCode) {
        throw new Error("PortOne 사용자 코드가 설정되지 않았습니다")
      }
      initPortOne(userCode)

      // 결제 정보 가져오기
      const data = await initiatePayment(reservationId)
      setPaymentData(data)
    } catch (err: any) {
      setError(err.message || "결제 초기화 중 오류가 발생했습니다")
      console.error("결제 초기화 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentData) {
      setError("결제 정보가 없습니다")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // PortOne 결제 요청
      const paymentRequest = {
        ...paymentData.payment_config,
        pay_method: selectedMethod,
        m_redirect_url: window.location.origin + "/payment/callback",
      }

      const response = await requestPortOnePayment(paymentRequest)

      if (response.success && response.imp_uid && response.merchant_uid) {
        // 결제 성공 - 서버 검증
        const verifyResult = await verifyPayment({
          imp_uid: response.imp_uid,
          merchant_uid: response.merchant_uid,
        })

        if (verifyResult.success) {
          alert("결제가 완료되었습니다!")
          onSuccess()
        } else {
          setError(verifyResult.message || "결제 검증에 실패했습니다")
        }
      } else {
        setError(response.error_msg || "결제에 실패했습니다")
      }
    } catch (err: any) {
      setError(err.message || "결제 처리 중 오류가 발생했습니다")
      console.error("결제 처리 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { value: "card", label: "신용/체크카드", icon: CreditCard },
    { value: "trans", label: "실시간 계좌이체", icon: Building2 },
    { value: "vbank", label: "가상계좌", icon: Smartphone },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">예약금 결제</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {error && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">결제 정보를 불러오는 중...</p>
          </div>
        ) : paymentData ? (
          <div className="space-y-4">
            {/* 결제 금액 */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <h3 className="font-semibold mb-4 text-center">결제 금액</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>총 예약금액:</span>
                  <span className="font-medium">{Number(paymentData.total_amount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>예약금 (10%):</span>
                  <span>{Number(paymentData.deposit_amount).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>잔금 (현장결제):</span>
                  <span>{Number(paymentData.remaining_amount).toLocaleString()}원</span>
                </div>
              </div>
            </Card>

            {/* 결제 수단 선택 */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">결제 수단</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.value
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.value}
                        checked={selectedMethod === method.value}
                        onChange={(e) => setSelectedMethod(e.target.value as typeof selectedMethod)}
                        className="w-4 h-4"
                      />
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="font-medium flex-1">{method.label}</span>
                    </label>
                  )
                })}
              </div>
            </Card>

            {/* 안내사항 */}
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-800">결제 안내</h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• 예약금은 총 금액의 10%입니다</li>
                <li>• 잔금은 운행 당일 현장에서 결제하실 수 있습니다</li>
                <li>• 출발 3일 전까지 취소 가능하며, 취소 시 예약금은 전액 환불됩니다</li>
              </ul>
            </Card>

            {/* 결제 버튼 */}
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold rounded-xl"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {loading ? "처리 중..." : `${Number(paymentData.deposit_amount).toLocaleString()}원 결제하기`}
            </Button>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">결제 정보를 불러올 수 없습니다</p>
            <Button onClick={onBack} className="mt-4">
              돌아가기
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}
