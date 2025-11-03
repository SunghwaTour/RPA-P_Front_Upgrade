"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Calendar, Users, Bus } from "lucide-react"

interface ReservationFormProps {
  onBack: () => void
}

export function ReservationForm({ onBack }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    date: "",
    passengers: "",
    roundTrip: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 호출하여 견적 조회
    console.log("예약 요청:", formData)
    alert("견적 조회 기능은 API 연동 후 사용 가능합니다.")
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
      <main className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 출발지 */}
          <Card className="p-4">
            <Label htmlFor="departure" className="flex items-center gap-2 mb-2 text-base font-semibold">
              <MapPin className="w-5 h-5 text-primary" />
              출발지
            </Label>
            <Input
              id="departure"
              placeholder="출발지를 입력하세요"
              value={formData.departure}
              onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
              className="h-12 text-base"
              required
            />
          </Card>

          {/* 도착지 */}
          <Card className="p-4">
            <Label htmlFor="destination" className="flex items-center gap-2 mb-2 text-base font-semibold">
              <MapPin className="w-5 h-5 text-primary" />
              도착지
            </Label>
            <Input
              id="destination"
              placeholder="도착지를 입력하세요"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="h-12 text-base"
              required
            />
          </Card>

          {/* 출발일 */}
          <Card className="p-4">
            <Label htmlFor="date" className="flex items-center gap-2 mb-2 text-base font-semibold">
              <Calendar className="w-5 h-5 text-primary" />
              출발일시
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="h-12 text-base"
              required
            />
          </Card>

          {/* 인원수 */}
          <Card className="p-4">
            <Label htmlFor="passengers" className="flex items-center gap-2 mb-2 text-base font-semibold">
              <Users className="w-5 h-5 text-primary" />
              인원수
            </Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              max="500"
              placeholder="인원수를 입력하세요"
              value={formData.passengers}
              onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
              className="h-12 text-base"
              required
            />
            <p className="text-sm text-muted-foreground mt-2">최대 500명까지 예약 가능합니다</p>
          </Card>

          {/* 왕복 여부 */}
          <Card className="p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.roundTrip}
                onChange={(e) => setFormData({ ...formData, roundTrip: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-base font-semibold">왕복 예약</span>
            </label>
          </Card>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold rounded-xl touch-manipulation"
          >
            <Bus className="w-5 h-5 mr-2" />
            견적 조회하기
          </Button>
        </form>

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
