"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Calendar, Users, Bus, Calculator } from "lucide-react"
import { getQuote, createReservation } from "@/lib/api"
import type { QuoteResponse, CreateReservationRequest } from "@/types"

interface ReservationFormCompleteProps {
  onBack: () => void
}

declare global {
  interface Window {
    kakao: any
  }
}

export function ReservationFormComplete({ onBack }: ReservationFormCompleteProps) {
  const [formData, setFormData] = useState({
    departure_location: "",
    departure_coordinates: "",
    destination_location: "",
    destination_coordinates: "",
    departure_date: "",
    departure_time: "",
    return_date: "",
    return_time: "",
    passenger_count: 20,
    vehicle_type: "general" as "general" | "solati",
    is_round_trip: false,
    driver_accompanied: true,
    special_requirements: "",
  })

  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuote, setShowQuote] = useState(false)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 견적 계산
  const handleCalculateQuote = async () => {
    setError(null)
    setLoading(true)

    try {
      // 유효성 검사
      if (!formData.departure_location || !formData.destination_location) {
        throw new Error("출발지와 도착지를 입력해주세요")
      }
      if (!formData.departure_date || !formData.departure_time) {
        throw new Error("출발 날짜와 시간을 입력해주세요")
      }
      if (formData.passenger_count < 1 || formData.passenger_count > 500) {
        throw new Error("인원수는 1~500명 사이여야 합니다")
      }

      const departureDateTime = `${formData.departure_date}T${formData.departure_time}:00`
      let returnDateTime = null

      if (formData.is_round_trip && formData.return_date && formData.return_time) {
        returnDateTime = `${formData.return_date}T${formData.return_time}:00`
      }

      const quoteResponse = await getQuote({
        departure_location: formData.departure_location,
        destination_location: formData.destination_location,
        departure_coordinates: formData.departure_coordinates || "37.5665,126.9780",
        destination_coordinates: formData.destination_coordinates || "37.5665,126.9780",
        passenger_count: formData.passenger_count,
        departure_date: departureDateTime,
        return_date: returnDateTime,
        is_round_trip: formData.is_round_trip,
        is_solati: formData.vehicle_type === "solati",
      })

      setQuote(quoteResponse)
      setShowQuote(true)
    } catch (err: any) {
      setError(err.message || "견적 조회 중 오류가 발생했습니다")
      console.error("견적 조회 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  // 예약 신청
  const handleSubmit = async () => {
    if (!quote) {
      setError("먼저 견적을 조회해주세요")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const departureDateTime = `${formData.departure_date}T${formData.departure_time}:00`
      let returnDateTime = null

      if (formData.is_round_trip && formData.return_date && formData.return_time) {
        returnDateTime = `${formData.return_date}T${formData.return_time}:00`
      }

      const reservationData: CreateReservationRequest = {
        departure_location: formData.departure_location,
        departure_coordinates: formData.departure_coordinates || "37.5665,126.9780",
        destination_location: formData.destination_location,
        destination_coordinates: formData.destination_coordinates || "37.5665,126.9780",
        departure_date: departureDateTime,
        return_date: returnDateTime,
        passenger_count: formData.passenger_count,
        vehicle_count: quote.vehicle_count,
        vehicle_type: formData.vehicle_type,
        is_round_trip: formData.is_round_trip,
        driver_accompanied: formData.driver_accompanied,
        special_requirements: formData.special_requirements,
      }

      await createReservation(reservationData)

      alert("예약 신청이 완료되었습니다! 관리자 승인 후 결제가 가능합니다.")
      onBack()
    } catch (err: any) {
      setError(err.message || "예약 신청 중 오류가 발생했습니다")
      console.error("예약 신청 오류:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 safe-area-inset">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">예약 문의</h1>
        </div>
      </header>

      {/* 폼 */}
      <main className="px-4 py-6 pb-24">
        {error && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        <div className="space-y-4">
          {/* 출발지 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <MapPin className="w-5 h-5 text-green-600" />
              출발지
            </Label>
            <Input
              placeholder="출발지를 입력하세요"
              value={formData.departure_location}
              onChange={(e) =>
                setFormData({ ...formData, departure_location: e.target.value })
              }
              className="h-12 text-base"
            />
          </Card>

          {/* 도착지 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <MapPin className="w-5 h-5 text-red-600" />
              도착지
            </Label>
            <Input
              placeholder="도착지를 입력하세요"
              value={formData.destination_location}
              onChange={(e) =>
                setFormData({ ...formData, destination_location: e.target.value })
              }
              className="h-12 text-base"
            />
          </Card>

          {/* 출발 날짜 및 시간 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <Calendar className="w-5 h-5 text-primary" />
              출발 일시
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="h-12"
                min={new Date().toISOString().split("T")[0]}
              />
              <Input
                type="time"
                value={formData.departure_time}
                onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                className="h-12"
              />
            </div>
          </Card>

          {/* 왕복 여부 */}
          <Card className="p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_round_trip}
                onChange={(e) => setFormData({ ...formData, is_round_trip: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-base font-semibold">왕복 예약</span>
            </label>
          </Card>

          {/* 복귀 날짜 및 시간 (왕복인 경우) */}
          {formData.is_round_trip && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
                <Calendar className="w-5 h-5 text-blue-600" />
                복귀 일시
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={formData.return_date}
                  onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                  className="h-12"
                  min={formData.departure_date}
                />
                <Input
                  type="time"
                  value={formData.return_time}
                  onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
                  className="h-12"
                />
              </div>
            </Card>
          )}

          {/* 인원수 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <Users className="w-5 h-5 text-primary" />
              인원수
            </Label>
            <Input
              type="number"
              min="1"
              max="500"
              value={formData.passenger_count}
              onChange={(e) =>
                setFormData({ ...formData, passenger_count: parseInt(e.target.value) || 1 })
              }
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">최대 500명까지 예약 가능합니다</p>
          </Card>

          {/* 차량 타입 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
              <Bus className="w-5 h-5 text-primary" />
              차량 타입
            </Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="vehicle_type"
                  value="general"
                  checked={formData.vehicle_type === "general"}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as "general" | "solati" })}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">일반형 (28-45인승)</div>
                  <div className="text-sm text-muted-foreground">표준 전세버스</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="vehicle_type"
                  value="solati"
                  checked={formData.vehicle_type === "solati"}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as "general" | "solati" })}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-medium">Solati (고급형)</div>
                  <div className="text-sm text-muted-foreground">프리미엄 소형버스 (최대 15명)</div>
                </div>
              </label>
            </div>
          </Card>

          {/* 특이사항 */}
          <Card className="p-4">
            <Label className="mb-2 text-base font-semibold block">특이사항</Label>
            <textarea
              value={formData.special_requirements}
              onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              className="w-full p-3 border rounded-lg min-h-[100px]"
              placeholder="특별한 요청사항이 있으면 입력해주세요 (선택사항)"
            />
          </Card>

          {/* 견적 정보 */}
          {showQuote && quote && (
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">예상 견적</h3>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="text-3xl font-bold text-primary mb-2 text-center">
                  {quote.total_price.toLocaleString()}원
                </div>
                <div className="text-sm text-muted-foreground space-y-1 text-center">
                  <p>거리: {quote.distance_km}km • 소요: {quote.estimated_hours}시간</p>
                  <p>{quote.vehicle_type_display} • {quote.season_display}</p>
                  {quote.is_multi_vehicle && (
                    <p className="text-orange-600 font-medium">
                      {quote.vehicle_count}대 차량 필요
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-700 mb-1">
                    예약금: {quote.deposit_amount.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-600">
                    잔금 {quote.remaining_amount.toLocaleString()}원은 운행 당일 결제
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 버튼 */}
          <div className="space-y-3">
            <Button
              onClick={handleCalculateQuote}
              disabled={loading}
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {loading ? "조회 중..." : "견적 확인하기"}
            </Button>

            {showQuote && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold rounded-xl"
              >
                <Bus className="w-5 h-5 mr-2" />
                {loading ? "신청 중..." : "예약 신청하기"}
              </Button>
            )}
          </div>
        </div>

        {/* 안내 사항 */}
        <Card className="mt-6 p-4 bg-accent">
          <h3 className="font-semibold mb-2 text-foreground">예약 안내</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• 견적 조회 후 관리자 승인이 필요합니다</li>
            <li>• 예약금은 총 금액의 10%입니다</li>
            <li>• 출발 3일 전까지 취소 가능합니다</li>
          </ul>
        </Card>
      </main>
    </div>
  )
}
