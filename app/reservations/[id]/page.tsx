"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Phone, Copy } from "lucide-react"
import { getReservation, notifyRemainingPayment } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { BankTransferGuide } from "@/components/bank-transfer-guide"
import { PaymentInfoCard } from "@/components/payment-info-card"
import { RemainingPaymentCard } from "@/components/remaining-payment-card"
import { DispatchInfoCard } from "@/components/dispatch-info-card"
import { CancellationModal } from "@/components/cancellation-modal"
import type { Reservation } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ReservationDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPayment, setShowPayment] = useState(false)

  // 인증 체크
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace("/")
        return
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [router])

  // 예약 상세 로드
  useEffect(() => {
    if (authChecking) return

    const loadReservation = async () => {
      try {
        setLoading(true)
        const data = await getReservation(Number(id))
        setReservation(data)
      } catch (err: any) {
        console.error("예약 상세 조회 오류:", err)
        setError(err.message || "예약 정보를 불러올 수 없습니다.")
      } finally {
        setLoading(false)
      }
    }
    loadReservation()
  }, [id, authChecking])

  const handleCancelled = () => {
    router.push("/reservations")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("복사되었습니다")
  }

  if (authChecking || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background max-w-[600px] mx-auto">
        <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
          <div className="flex items-center px-4 py-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reservations")} className="mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">예약 상세</h1>
          </div>
        </header>
        <div className="p-4 text-center py-12">
          <p className="text-gray-500 mb-4">{error || "예약 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/reservations")} className="bg-primary text-white">
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const canCancel = !['cancelled', 'completed', 'dispatched', 'in_progress', 'refund_requested'].includes(reservation.status)
  const canPay = reservation.status === 'payment_waiting'

  if (showPayment) {
    return (
      <BankTransferGuide
        reservation={reservation}
        onBack={() => setShowPayment(false)}
        onComplete={() => {
          setShowPayment(false)
          const loadReservation = async () => {
            const data = await getReservation(Number(id))
            setReservation(data)
          }
          loadReservation()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reservations")} className="mr-2">
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
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start mb-3">
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

              <div className="flex items-center justify-center pt-1">
                {reservation.is_round_trip ? (
                  <img src="/myReservation/roundTrip.svg" alt="왕복" className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-primary" />
                )}
              </div>

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
              {reservation.special_requirements || '없음'}
            </p>
          </div>

          {/* 입금 계좌 안내 */}
          {(reservation.status === 'payment_waiting' || reservation.status === 'deposit_pending' || reservation.payment_option) && reservation.payment_option && (
            <div className="mt-6">
              <h2 className="text-base font-bold mb-3">입금 안내</h2>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">은행</span>
                    <span className="font-semibold text-blue-900">국민은행</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">계좌번호</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-900">81430104241731</span>
                      <button
                        onClick={() => copyToClipboard("81430104241731")}
                        className="p-1 rounded bg-blue-100 hover:bg-blue-200"
                      >
                        <Copy className="w-3 h-3 text-blue-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">예금주</span>
                    <span className="font-semibold text-blue-900">김형주(킹버스)</span>
                  </div>
                </div>
                <div className="border-t border-blue-200 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      {reservation.payment_option === 'full' ? '입금 금액' : '예약금'}
                    </span>
                    <span className="font-bold text-blue-900">
                      {reservation.payment_option === 'full'
                        ? `${Number(reservation.quote_amount || 0).toLocaleString()}원`
                        : `${Number(reservation.deposit_amount || 0).toLocaleString()}원`
                      }
                    </span>
                  </div>
                  {reservation.payment_option === 'split' && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-blue-500">잔금</span>
                      <span className="text-xs text-blue-500">{Number(reservation.remaining_amount || 0).toLocaleString()}원 (추후 안내)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 결제/환불 정보 카드 */}
        {reservation.payments && reservation.payments.length > 0 ? (
          <PaymentInfoCard
            payments={reservation.payments}
            onViewDetails={() => {
              console.log("결제 상세 보기", reservation.payments)
            }}
          />
        ) : reservation.latest_payment && reservation.latest_payment.status === 'paid' ? (
          <PaymentInfoCard
            payments={[reservation.latest_payment]}
            onViewDetails={() => {
              console.log("결제 상세 보기 (latest)", reservation.latest_payment?.id)
            }}
          />
        ) : null}

        {/* 잔금 입금 알림 카드 */}
        {reservation.needs_remaining_payment && reservation.departure_date && (
          <RemainingPaymentCard
            remainingAmount={reservation.remaining_amount}
            paymentDeadline={reservation.departure_date}
            onPayClick={async () => {
              try {
                await notifyRemainingPayment(reservation.id)
                alert('잔금 입금 알림이 전송되었습니다.')
                const data = await getReservation(Number(id))
                setReservation(data)
              } catch (err: any) {
                alert(err.message || '알림 전송에 실패했습니다.')
              }
            }}
          />
        )}

        {/* 운행 상세 카드 */}
        {(reservation.status === 'confirmed' || reservation.status === 'dispatched' || reservation.status === 'in_progress') && (
          <DispatchInfoCard
            vehicleCount={reservation.vehicle_count}
            passengerCount={reservation.passenger_count}
            driverInfo={
              reservation.assigned_driver_id
                ? {
                    id: reservation.assigned_driver_id,
                    name: '유정노',
                    phone: '031-1212-1212'
                  }
                : undefined
            }
            dispatchedAt={reservation.approved_at || undefined}
          />
        )}

        {/* 환불 요청 / 취소된 예약 환불 정보 */}
        {(reservation.status === 'refund_requested' || reservation.status === 'cancelled') && (reservation.refund_amount || reservation.cancel_reason) && (
          <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-red-400" style={{ border: '1px solid rgba(242, 244, 246, 1)', borderLeft: `4px solid ${reservation.status === 'refund_requested' ? '#f97316' : '#ef4444'}` }}>
            <h2 className="text-base font-bold mb-3" style={{ color: reservation.status === 'refund_requested' ? '#f97316' : '#ef4444' }}>
              {reservation.status === 'refund_requested' ? '환불 요청이 접수되었습니다' : '예약이 취소되었습니다'}
            </h2>
            <div className="space-y-2 text-sm">
              {reservation.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">취소일</span>
                  <span className="font-medium">
                    {new Date(reservation.cancelled_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: '2-digit', day: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {reservation.cancel_reason && (
                <div className="flex justify-between">
                  <span className="text-gray-500">취소 사유</span>
                  <span className="font-medium">{reservation.cancel_reason}</span>
                </div>
              )}
              {reservation.refund_rate !== undefined && reservation.refund_rate !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">환불 비율</span>
                  <span className="font-medium">{reservation.refund_rate}%</span>
                </div>
              )}
              {reservation.refund_amount !== undefined && reservation.refund_amount !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">환불 금액</span>
                  <span className="font-bold text-red-600">{Number(reservation.refund_amount).toLocaleString()}원</span>
                </div>
              )}
              {reservation.refund_bank_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">환불 계좌</span>
                  <span className="font-medium">{reservation.refund_bank_name} {reservation.refund_account_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">환불 상태</span>
                <span className={`font-medium ${reservation.refund_completed_at ? 'text-green-600' : 'text-orange-600'}`}>
                  {reservation.refund_completed_at ? '환불 완료' : reservation.refund_amount ? '환불 처리 중' : '-'}
                </span>
              </div>
            </div>
          </div>
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

      {/* 취소 모달 */}
      {showCancelDialog && reservation && (
        <CancellationModal
          reservation={reservation}
          onClose={() => setShowCancelDialog(false)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  )
}
