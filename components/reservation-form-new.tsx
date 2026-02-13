"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Minus, Plus, ChevronUp, ChevronDown, ArrowLeftRight, RotateCcw } from "lucide-react"
import { LocationSearchModal } from "@/components/location-search-modal"
import { DatePickerCalendar } from "@/components/date-picker-calendar"
import { QuoteResultPage } from "@/components/quote-result-page"
import { getQuote, createReservation } from "@/lib/api"
import type { QuoteResponse } from "@/types"

interface ReservationFormNewProps {
  onBack: () => void
  onReservationComplete?: () => void
  initialRoundTrip?: boolean
}

export function ReservationFormNew({ onBack, onReservationComplete, initialRoundTrip = false }: ReservationFormNewProps) {
  const [formData, setFormData] = useState({
    departure_location: "",
    departure_coordinates: "",
    destination_location: "",
    destination_coordinates: "",
    passenger_count: 0,
    vehicle_count: 0,
    vehicle_type: "general" as "general" | "solati",
    is_round_trip: initialRoundTrip,
    departure_date: "",
    departure_time: "09:00",
    return_date: "",
    return_time: "09:00",
    special_requirements: "",
  })

  const [locationModal, setLocationModal] = useState<{
    isOpen: boolean
    type: "departure" | "destination"
  }>({ isOpen: false, type: "departure" })

  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false)
  const [showReturnTimePicker, setShowReturnTimePicker] = useState(false)
  const [departureTimeSelected, setDepartureTimeSelected] = useState(false)
  const [returnTimeSelected, setReturnTimeSelected] = useState(false)
  const [showDepartureDatePicker, setShowDepartureDatePicker] = useState(false)
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false)

  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showQuoteResult, setShowQuoteResult] = useState(false)

  const handleLocationSelect = (location: { name: string; coords: string }) => {
    if (locationModal.type === "departure") {
      setFormData(prev => ({
        ...prev,
        departure_location: location.name,
        departure_coordinates: location.coords,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        destination_location: location.name,
        destination_coordinates: location.coords,
      }))
    }
    setLocationModal({ isOpen: false, type: "departure" })
  }

  // 출발지 ↔ 도착지 교환
  const handleSwapLocations = () => {
    setFormData(prev => ({
      ...prev,
      departure_location: prev.destination_location,
      departure_coordinates: prev.destination_coordinates,
      destination_location: prev.departure_location,
      destination_coordinates: prev.departure_coordinates,
    }))
  }

  // 출발 일정 초기화
  const handleResetDepartureSchedule = () => {
    setFormData(prev => ({
      ...prev,
      departure_date: "",
      departure_time: "09:00",
    }))
    setShowDepartureDatePicker(false)
    setShowDepartureTimePicker(false)
    setDepartureTimeSelected(false)
  }

  // 도착 일정 초기화
  const handleResetReturnSchedule = () => {
    setFormData(prev => ({
      ...prev,
      return_date: "",
      return_time: "09:00",
    }))
    setShowReturnDatePicker(false)
    setShowReturnTimePicker(false)
    setReturnTimeSelected(false)
  }

  const handleQuoteSubmit = async () => {
    setLoading(true)
    try {
      const departureDateTime = `${formData.departure_date}T${formData.departure_time}:00Z`
      const returnDateTime = formData.is_round_trip && formData.return_date
        ? `${formData.return_date}T${formData.return_time}:00Z`
        : undefined

      const quoteResponse = await getQuote({
        departure_location: formData.departure_location,
        destination_location: formData.destination_location,
        departure_coordinates: formData.departure_coordinates,
        destination_coordinates: formData.destination_coordinates,
        passenger_count: formData.passenger_count,
        departure_date: departureDateTime,
        return_date: returnDateTime,
        is_round_trip: formData.is_round_trip,
        is_solati: formData.vehicle_type === "solati",
        vehicle_count: formData.vehicle_count,
      })

      setQuote(quoteResponse)
      setShowQuoteResult(true)
    } catch (error) {
      console.error("견적 조회 오류:", error)
      alert("견적 조회 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleReservationSubmit = async (phone: string) => {
    if (!quote) return

    const departureDateTime = `${formData.departure_date}T${formData.departure_time}:00Z`
    const returnDateTime = formData.is_round_trip && formData.return_date
      ? `${formData.return_date}T${formData.return_time}:00Z`
      : undefined

    await createReservation({
      departure_location: formData.departure_location,
      departure_coordinates: formData.departure_coordinates,
      destination_location: formData.destination_location,
      destination_coordinates: formData.destination_coordinates,
      departure_date: departureDateTime,
      return_date: returnDateTime,
      passenger_count: formData.passenger_count,
      vehicle_count: formData.vehicle_count,
      vehicle_type: formData.vehicle_type,
      is_round_trip: formData.is_round_trip,
      driver_accompanied: true,
      special_requirements: formData.special_requirements,
    })
  }

  // 견적 결과 페이지 표시
  if (showQuoteResult && quote) {
    return (
      <QuoteResultPage
        quote={quote}
        onBack={() => setShowQuoteResult(false)}
        onSubmit={handleReservationSubmit}
        onReservationComplete={onReservationComplete}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">예약 정보 입력</h1>
        </div>
      </header>

      <main className="pb-32">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border-l-4 border-primary p-4 mx-4 mt-4 mb-4 rounded">
          <p className="text-sm text-blue-900">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              예약 정보를 입력하여 견적이 산출됩니다
            </span>
          </p>
        </div>

        <div className="px-4 space-y-4">
          {/* 출·도착지 입력 */}
          <div>
            <h2 className="text-base font-bold mb-3">출·도착지 입력</h2>

            {/* 출발지/도착지 입력 버튼 + 교환 버튼 */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  setLocationModal({ isOpen: true, type: "departure" })
                }}
                className="flex-1 flex items-center gap-2 p-3 rounded-full border border-gray-300 bg-white transition-all"
              >
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className={`text-sm truncate ${formData.departure_location ? "text-foreground" : "text-gray-500"}`}>
                  {formData.departure_location || "출발지 입력"}
                </span>
              </button>

              {/* 교환 버튼 */}
              <button
                onClick={handleSwapLocations}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors touch-manipulation flex-shrink-0"
                aria-label="출발지와 도착지 교환"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => {
                  setLocationModal({ isOpen: true, type: "destination" })
                }}
                className="flex-1 flex items-center gap-2 p-3 rounded-full border border-gray-300 bg-white transition-all"
              >
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className={`text-sm truncate ${formData.destination_location ? "text-foreground" : "text-gray-500"}`}>
                  {formData.destination_location || "도착지 입력"}
                </span>
              </button>
            </div>
          </div>

          {/* 인원 입력 */}
          <div>
            <h2 className="text-base font-bold mb-3">인원 입력</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData(prev => ({ ...prev, passenger_count: Math.max(0, prev.passenger_count - 1) }))}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                style={{ width: '56px', height: '52px', borderRadius: '13px' }}
              >
                <Minus className="w-6 h-6 text-gray-900" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={formData.passenger_count}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData(prev => ({ ...prev, passenger_count: Math.min(500, Math.max(0, value)) }))
                  }}
                  className="w-full text-center font-bold px-2 border-2 border-gray-200 focus:outline-none focus:border-primary"
                  style={{ height: '52px', borderRadius: '13px', fontSize: '16px' }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: '16px' }}>명</span>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, passenger_count: Math.min(500, prev.passenger_count + 1) }))}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                style={{ width: '56px', height: '52px', borderRadius: '13px' }}
              >
                <Plus className="w-6 h-6 text-gray-900" />
              </button>
            </div>
          </div>

          {/* 버스 유형 선택 */}
          <div>
            <h2 className="text-base font-bold mb-3">버스 유형 선택</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData(prev => ({ ...prev, vehicle_type: "general" }))}
                className={`p-4 rounded-lg border-2 transition-all touch-manipulation ${
                  formData.vehicle_type === "general"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className={`font-bold mb-1 ${formData.vehicle_type === "general" ? "text-primary" : "text-foreground"}`}>
                    일반형
                  </div>
                  <div className="text-xs text-gray-600">28인승~45인승</div>
                </div>
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, vehicle_type: "solati" }))}
                className={`p-4 rounded-lg border-2 transition-all touch-manipulation ${
                  formData.vehicle_type === "solati"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className={`font-bold mb-1 ${formData.vehicle_type === "solati" ? "text-primary" : "text-foreground"}`}>
                    고급형
                  </div>
                  <div className="text-xs text-gray-600">최대 15인승</div>
                </div>
              </button>
            </div>
          </div>

          {/* 버스 대수 입력 */}
          <div>
            <h2 className="text-base font-bold mb-3">버스 대수 입력</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData(prev => ({ ...prev, vehicle_count: Math.max(0, prev.vehicle_count - 1) }))}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                style={{ width: '56px', height: '52px', borderRadius: '13px' }}
              >
                <Minus className="w-6 h-6 text-gray-900" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.vehicle_count}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData(prev => ({ ...prev, vehicle_count: Math.min(20, Math.max(0, value)) }))
                  }}
                  className="w-full text-center font-bold px-2 border-2 border-gray-200 focus:outline-none focus:border-primary"
                  style={{ height: '52px', borderRadius: '13px', fontSize: '16px' }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ fontSize: '16px' }}>대</span>
              </div>
              <button
                onClick={() => setFormData(prev => ({ ...prev, vehicle_count: Math.min(20, prev.vehicle_count + 1) }))}
                className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation flex-shrink-0"
                style={{ width: '56px', height: '52px', borderRadius: '13px' }}
              >
                <Plus className="w-6 h-6 text-gray-900" />
              </button>
            </div>
          </div>

          {/* 여정 선택 */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">여정 선택</h2>
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setFormData(prev => ({ ...prev, is_round_trip: true }))}
                className={`px-6 py-2 rounded-full font-medium transition-all touch-manipulation ${
                  formData.is_round_trip
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                왕복
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, is_round_trip: false }))}
                className={`px-6 py-2 rounded-full font-medium transition-all touch-manipulation ${
                  !formData.is_round_trip
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                편도
              </button>
            </div>
          </div>

          {/* 출발 정보 */}
          <div>
            {/* 타이틀 + 일정 초기화 */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">출발 정보</h2>
              <button
                onClick={handleResetDepartureSchedule}
                className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 touch-manipulation"
              >
                일정 초기화
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 날짜/시간 선택 영역 */}
            <div className="bg-white rounded-lg border">
              {/* 출발 날짜 */}
              <div className="px-4">
                <button
                  onClick={() => setShowDepartureDatePicker(!showDepartureDatePicker)}
                  className="w-full flex items-center justify-between py-4 touch-manipulation"
                >
                  <span className={formData.departure_date ? "text-primary font-medium" : "text-gray-500"}>
                    {formData.departure_date
                      ? new Date(formData.departure_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
                      : "날짜 선택"}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    변경
                    {showDepartureDatePicker ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {showDepartureDatePicker && (
                  <DatePickerCalendar
                    value={formData.departure_date}
                    onChange={(date) => {
                      setFormData(prev => ({ ...prev, departure_date: date }))
                      setShowDepartureDatePicker(false)
                    }}
                    onClose={() => setShowDepartureDatePicker(false)}
                    disablePast={true}
                  />
                )}
              </div>

              {/* 출발 시간 */}
              <div className="px-4 border-t">
                <button
                  onClick={() => setShowDepartureTimePicker(!showDepartureTimePicker)}
                  className="w-full flex items-center justify-between py-4 touch-manipulation"
                >
                  <span className={departureTimeSelected ? "text-primary font-medium" : "text-foreground"}>
                    {departureTimeSelected ? formData.departure_time : "출발 시간"}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    선택
                    {showDepartureTimePicker ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {showDepartureTimePicker && (
                  <TimeWheelPicker
                    value={formData.departure_time}
                    onChange={(time) => {
                      setFormData(prev => ({ ...prev, departure_time: time }))
                      setDepartureTimeSelected(true)
                      setShowDepartureTimePicker(false)
                    }}
                    onClose={() => setShowDepartureTimePicker(false)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 도착 정보 (왕복일 경우만) */}
          {formData.is_round_trip && (
            <div>
              {/* 타이틀 + 일정 초기화 */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold">도착 정보</h2>
                <button
                  onClick={handleResetReturnSchedule}
                  className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 touch-manipulation"
                >
                  일정 초기화
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* 날짜/시간 선택 영역 */}
              <div className="bg-white rounded-lg border">
                {/* 도착 날짜 */}
                <div className="px-4">
                  <button
                    onClick={() => setShowReturnDatePicker(!showReturnDatePicker)}
                    className="w-full flex items-center justify-between py-4 touch-manipulation"
                  >
                    <span className={formData.return_date ? "text-primary font-medium" : "text-gray-500"}>
                      {formData.return_date
                        ? new Date(formData.return_date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')
                        : "도착 날짜"}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      선택
                      {showReturnDatePicker ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {showReturnDatePicker && (
                    <DatePickerCalendar
                      value={formData.return_date}
                      onChange={(date) => {
                        setFormData(prev => ({ ...prev, return_date: date }))
                        setShowReturnDatePicker(false)
                      }}
                      onClose={() => setShowReturnDatePicker(false)}
                      minDate={formData.departure_date}
                      disablePast={true}
                    />
                  )}
                </div>

                {/* 도착 시간 */}
                <div className="px-4 border-t">
                  <button
                    onClick={() => setShowReturnTimePicker(!showReturnTimePicker)}
                    className="w-full flex items-center justify-between py-4 touch-manipulation"
                  >
                    <span className={returnTimeSelected ? "text-primary font-medium" : "text-foreground"}>
                      {returnTimeSelected ? formData.return_time : "도착 시간"}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      선택
                      {showReturnTimePicker ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>

                  {showReturnTimePicker && (
                    <TimeWheelPicker
                      value={formData.return_time}
                      onChange={(time) => {
                        setFormData(prev => ({ ...prev, return_time: time }))
                        setReturnTimeSelected(true)
                        setShowReturnTimePicker(false)
                      }}
                      onClose={() => setShowReturnTimePicker(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 요청사항 */}
          <div>
            <h2 className="text-base font-bold mb-3">요청사항</h2>
            <textarea
              value={formData.special_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
              placeholder="요청사항을 입력해주세요 (선택사항)"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
              rows={4}
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>
      </main>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-inset max-w-[600px] mx-auto">
        <Button
          onClick={handleQuoteSubmit}
          disabled={
            loading ||
            !formData.departure_location ||
            !formData.destination_location ||
            formData.passenger_count === 0 ||
            !formData.departure_date ||
            (formData.is_round_trip && !formData.return_date)
          }
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl disabled:opacity-50 touch-manipulation"
        >
          {loading ? "견적 조회 중..." : "견적 보기"}
        </Button>
      </div>

      {/* 위치 검색 모달 */}
      <LocationSearchModal
        isOpen={locationModal.isOpen}
        onClose={() => setLocationModal({ isOpen: false, type: "departure" })}
        onSelect={handleLocationSelect}
        title={locationModal.type === "departure" ? "출발지 검색" : "도착지 검색"}
      />
    </div>
  )
}

// iOS 스타일 시간 휠 피커 컴포넌트
function TimeWheelPicker({
  value,
  onChange,
  onClose
}: {
  value: string
  onChange: (time: string) => void
  onClose: () => void
}) {
  const [hour, minute] = value.split(':').map(Number)
  const [selectedPeriod, setSelectedPeriod] = useState<'오전' | '오후'>(hour < 12 ? '오전' : '오후')
  const [selectedHour, setSelectedHour] = useState(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
  const [selectedMinute, setSelectedMinute] = useState(minute)

  const periods = ['오전', '오후']
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const handleConfirm = () => {
    let finalHour = selectedHour
    if (selectedPeriod === '오후' && selectedHour !== 12) {
      finalHour += 12
    } else if (selectedPeriod === '오전' && selectedHour === 12) {
      finalHour = 0
    }
    const timeString = `${finalHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
    onChange(timeString)
  }

  return (
    <div className="mt-2 bg-gray-50 rounded-lg p-4">
      <div className="flex gap-2 mb-4">
        {/* 오전/오후 선택 */}
        <div className="flex-1">
          <div className="h-32 overflow-y-auto">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as '오전' | '오후')}
                className={`w-full py-2 text-center transition-all ${
                  selectedPeriod === period
                    ? 'text-foreground font-bold text-lg'
                    : 'text-gray-400 text-sm'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* 시 선택 */}
        <div className="flex-1">
          <div className="h-32 overflow-y-auto">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                className={`w-full py-2 text-center transition-all ${
                  selectedHour === h
                    ? 'text-foreground font-bold text-lg'
                    : 'text-gray-400 text-sm'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* 분 선택 */}
        <div className="flex-1">
          <div className="h-32 overflow-y-auto">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMinute(m)}
                className={`w-full py-2 text-center transition-all ${
                  selectedMinute === m
                    ? 'text-foreground font-bold text-lg'
                    : 'text-gray-400 text-sm'
                }`}
              >
                {m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={handleConfirm}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
      >
        적용
      </Button>
    </div>
  )
}
