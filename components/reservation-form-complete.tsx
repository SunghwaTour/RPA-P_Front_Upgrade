"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Calendar, Users, Bus, Calculator, Map } from "lucide-react"
import { getQuote, createReservation } from "@/lib/api"
import { KakaoMapModal } from "@/components/kakao-map-modal"
import { PhoneVerificationModal } from "@/components/phone-verification-modal"
import { getUser } from "@/lib/supabase"
import type { QuoteResponse, CreateReservationRequest } from "@/types"

interface ReservationFormCompleteProps {
  onBack: () => void
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
    vehicle_count: 1,
    vehicle_type: "general" as "general" | "solati",
    is_round_trip: false,
    driver_accompanied: true,
    special_requirements: "",
  })

  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQuote, setShowQuote] = useState(false)
  const [mapModal, setMapModal] = useState<{
    isOpen: boolean
    type: "departure" | "destination"
  }>({ isOpen: false, type: "departure" })
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getUser()
        setCurrentUser(user)
      } catch (err) {
        console.error("사용자 정보 로드 오류:", err)
      }
    }
    loadUser()
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
        vehicle_count: formData.vehicle_count,
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

  // 예약 신청 버튼 클릭 (휴대폰 인증 모달 표시)
  const handleReservationRequest = () => {
    if (!quote) {
      setError("먼저 견적을 조회해주세요")
      return
    }

    if (!currentUser) {
      setError("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.")
      return
    }

    // 휴대폰 인증 모달 표시
    setShowVerificationModal(true)
  }

  // 휴대폰 인증 완료 후 예약 신청
  const handleSubmitAfterVerification = async () => {
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
        vehicle_count: formData.vehicle_count,
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
            <div className="relative">
              <Input
                placeholder="지도에서 출발지를 선택하세요"
                value={formData.departure_location}
                readOnly
                onClick={() => setMapModal({ isOpen: true, type: "departure" })}
                className="h-12 text-base cursor-pointer bg-white pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMapModal({ isOpen: true, type: "departure" })}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
              >
                <Map className="w-5 h-5" />
              </Button>
            </div>
            {formData.departure_location && (
              <p className="text-xs text-gray-500 mt-1">
                좌표: {formData.departure_coordinates}
              </p>
            )}
          </Card>

          {/* 도착지 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <MapPin className="w-5 h-5 text-red-600" />
              도착지
            </Label>
            <div className="relative">
              <Input
                placeholder="지도에서 도착지를 선택하세요"
                value={formData.destination_location}
                readOnly
                onClick={() => setMapModal({ isOpen: true, type: "destination" })}
                className="h-12 text-base cursor-pointer bg-white pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMapModal({ isOpen: true, type: "destination" })}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700"
              >
                <Map className="w-5 h-5" />
              </Button>
            </div>
            {formData.destination_location && (
              <p className="text-xs text-gray-500 mt-1">
                좌표: {formData.destination_coordinates}
              </p>
            )}
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

          {/* 인원수 및 차량 대수 */}
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

          {/* 원하는 차량 대수 */}
          <Card className="p-4">
            <Label className="flex items-center gap-2 mb-2 text-base font-semibold">
              <Bus className="w-5 h-5 text-primary" />
              원하는 차량 대수
            </Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={formData.vehicle_count}
              onChange={(e) =>
                setFormData({ ...formData, vehicle_count: parseInt(e.target.value) || 1 })
              }
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              인원수에 맞게 자동 계산되지만, 원하시는 경우 직접 지정할 수 있습니다
            </p>
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
                  {Number(quote.total_price).toLocaleString()}원
                </div>
                <div className="text-sm text-muted-foreground space-y-1 text-center">
                  <p>거리: {Number(quote.distance_km).toLocaleString()}km • 소요: {Number(quote.estimated_hours).toLocaleString()}시간</p>
                  <p>{quote.vehicle_type_display} • {quote.season_display}</p>
                  {quote.is_multi_vehicle && (
                    <p className="text-orange-600 font-medium">
                      {Number(quote.vehicle_count).toLocaleString()}대 차량 필요
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-700 mb-1">
                    예약금: {Number(quote.deposit_amount).toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-600">
                    잔금 {Number(quote.remaining_amount).toLocaleString()}원은 운행 당일 결제
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
                onClick={handleReservationRequest}
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

      {/* 카카오맵 모달 */}
      <KakaoMapModal
        isOpen={mapModal.isOpen}
        onClose={() => setMapModal({ ...mapModal, isOpen: false })}
        onSelectLocation={(address, coordinates) => {
          if (mapModal.type === "departure") {
            setFormData({
              ...formData,
              departure_location: address,
              departure_coordinates: coordinates,
            })
          } else {
            setFormData({
              ...formData,
              destination_location: address,
              destination_coordinates: coordinates,
            })
          }
          setMapModal({ ...mapModal, isOpen: false })
        }}
        title={mapModal.type === "departure" ? "출발지 선택" : "도착지 선택"}
      />

      {/* 휴대폰 인증 모달 */}
      <PhoneVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={handleSubmitAfterVerification}
        customerName={currentUser?.user_metadata?.name || currentUser?.email || "고객"}
        phone={currentUser?.user_metadata?.phone || ""}
      />
    </div>
  )
}
