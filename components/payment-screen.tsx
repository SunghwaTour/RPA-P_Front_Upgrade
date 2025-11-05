"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import type { Reservation } from "@/types"

interface PaymentScreenProps {
  reservation: Reservation
  onBack: () => void
  onPayment: () => void
}

export function PaymentScreen({ reservation, onBack, onPayment }: PaymentScreenProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: false,
    customer: false,
    seller: false,
    privacy: true,
    refund: true,
  })

  const [agreements, setAgreements] = useState({
    all: false,
    payment: false,
    privacy: false,
    refund: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAgreementChange = (key: "all" | "payment" | "privacy" | "refund") => {
    if (key === "all") {
      const newValue = !agreements.all
      setAgreements({
        all: newValue,
        payment: newValue,
        privacy: newValue,
        refund: newValue,
      })
    } else {
      const newAgreements = { ...agreements, [key]: !agreements[key] }
      newAgreements.all = newAgreements.payment && newAgreements.privacy && newAgreements.refund
      setAgreements(newAgreements)
    }
  }

  const canProceed = agreements.payment && agreements.privacy && agreements.refund

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">결제하기</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* 예약 상품 */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2">예약 상품</h3>
          <p className="text-2xl font-bold text-primary mb-2">카드 결제</p>
          <div className="flex justify-between items-end">
            <div className="text-4xl font-bold">{Number(reservation.deposit_amount).toLocaleString()}</div>
            <div className="text-lg text-muted-foreground">예약금</div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">결제 방식은 카드 결제만 지원됩니다</p>
        </Card>

        {/* 예약 상세 */}
        <Card>
          <button
            onClick={() => toggleSection("details")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">예약 상세</span>
            {expandedSections.details ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.details && (
            <div className="px-4 pb-4 space-y-3 text-sm border-t">
              <div className="flex justify-between pt-3">
                <span className="text-muted-foreground">출발지</span>
                <span className="font-medium">{reservation.departure_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">도착지</span>
                <span className="font-medium">{reservation.destination_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">출발일시</span>
                <span className="font-medium">
                  {new Date(reservation.departure_date).toLocaleString("ko-KR")}
                </span>
              </div>
              {reservation.return_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">복귀일시</span>
                  <span className="font-medium">
                    {new Date(reservation.return_date).toLocaleString("ko-KR")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">인원</span>
                <span className="font-medium">{reservation.passenger_count}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">차량</span>
                <span className="font-medium">{reservation.vehicle_count}대</span>
              </div>
            </div>
          )}
        </Card>

        {/* 예약자 정보 */}
        <Card>
          <button
            onClick={() => toggleSection("customer")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">예약자 정보</span>
            {expandedSections.customer ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.customer && (
            <div className="px-4 pb-4 space-y-3 text-sm border-t">
              <div className="flex justify-between pt-3">
                <span className="text-muted-foreground">이름</span>
                <span className="font-medium">{reservation.customer_name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span className="font-medium">{reservation.customer_phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">이메일</span>
                <span className="font-medium">{reservation.customer_email || "-"}</span>
              </div>
            </div>
          )}
        </Card>

        {/* 판매자 정보 */}
        <Card>
          <button
            onClick={() => toggleSection("seller")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">판매자 정보</span>
            {expandedSections.seller ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.seller && (
            <div className="px-4 pb-4 space-y-3 text-sm border-t">
              <div className="flex justify-between pt-3">
                <span className="text-muted-foreground">상호명</span>
                <span className="font-medium">킹버스</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">대표자</span>
                <span className="font-medium">홍길동</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">사업자번호</span>
                <span className="font-medium">123-45-67890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span className="font-medium">02-1234-5678</span>
              </div>
            </div>
          )}
        </Card>

        {/* 개인정보 수집 및 이용 안내 */}
        <Card>
          <button
            onClick={() => toggleSection("privacy")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">개인정보 수집 및 이용 안내</span>
            {expandedSections.privacy ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.privacy && (
            <div className="px-4 pb-4 text-sm border-t pt-3">
              <p className="text-muted-foreground leading-relaxed">
                킹버스는 서비스 제공을 위해 최소한의 개인정보를 수집합니다. 수집된 정보는 예약 및 결제 처리, 고객 문의 응대, 서비스 개선에 활용되며, 관계 법령에 따라 안전하게 보관됩니다.
              </p>
            </div>
          )}
        </Card>

        {/* 개인정보 제3자 제공 동의 */}
        <Card>
          <button
            onClick={() => toggleSection("privacy3rd")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">개인정보 제3자 제공 동의</span>
            {expandedSections.privacy3rd ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.privacy3rd && (
            <div className="px-4 pb-4 text-sm border-t pt-3">
              <p className="text-muted-foreground leading-relaxed">
                예약 서비스 이용을 위한 개인정보 제3자 제공에 동의하며, 제3자에게 제공, 취소/환불 규정을 확인하였으므로 이에 동의합니다
              </p>
            </div>
          )}
        </Card>

        {/* 취소/환불 규정 */}
        <Card>
          <button
            onClick={() => toggleSection("refund")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold">취소/환불 규정</span>
            {expandedSections.refund ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expandedSections.refund && (
            <div className="px-4 pb-4 text-sm border-t pt-3">
              <p className="text-muted-foreground leading-relaxed mb-3">
                예약 취소 시 아래의 환불 규정이 적용됩니다:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>운행일 7일 전: 100% 환불</li>
                <li>운행일 3~6일 전: 50% 환불</li>
                <li>운행일 1~2일 전: 30% 환불</li>
                <li>운행 당일: 환불 불가</li>
              </ul>
            </div>
          )}
        </Card>

        {/* Agreement checkboxes */}
        <Card className="p-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.all}
                onChange={() => handleAgreementChange("all")}
                className="w-5 h-5 rounded border-gray-300"
              />
              <span className="font-semibold">전체 동의</span>
            </label>
            <div className="border-t pt-3 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.payment}
                  onChange={() => handleAgreementChange("payment")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">결제 진행 동의 (필수)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={() => handleAgreementChange("privacy")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">개인정보 수집 및 이용 동의 (필수)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.refund}
                  onChange={() => handleAgreementChange("refund")}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">취소/환불 규정 동의 (필수)</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Notice */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-green-800">
              예약 서비스 이용을 위한 개인정보 제3자 제공, 취소/환불 규정을 확인하였으므로 이에 동의합니다
            </p>
          </div>
        </Card>

        {/* Payment button */}
        <Button
          className="w-full h-14 text-lg font-semibold"
          disabled={!canProceed}
          onClick={onPayment}
        >
          동의하고 결제하기
        </Button>
      </div>
    </div>
  )
}
