"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerCalendarProps {
  value?: string // YYYY-MM-DD format
  onChange: (date: string) => void
  onClose?: () => void
  minDate?: string // YYYY-MM-DD format
  disablePast?: boolean
}

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"]
const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]

export function DatePickerCalendar({
  value,
  onChange,
  onClose,
  minDate,
  disablePast = false,
}: DatePickerCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const initialDate = value ? new Date(value) : today
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false)

  const minDateObj = useMemo(() => {
    if (minDate) {
      const d = new Date(minDate)
      d.setHours(0, 0, 0, 0)
      return d
    }
    if (disablePast) {
      return today
    }
    return null
  }, [minDate, disablePast])

  // Generate calendar days for the current view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Get the day of week for the first day (0 = Sunday, adjust for Monday start)
    let startDayOfWeek = firstDayOfMonth.getDay()
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Convert to Monday = 0

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      isDisabled: boolean
    }> = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      })
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)

      const isToday = date.getTime() === today.getTime()
      const isSelected = selectedDate ? date.getTime() === selectedDate.getTime() : false
      const isDisabled = minDateObj ? date < minDateObj : false

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled,
      })
    }

    // Next month days to fill the grid (6 rows x 7 days = 42)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      })
    }

    return days
  }, [viewDate, selectedDate, minDateObj])

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleDateClick = (day: typeof calendarDays[0]) => {
    if (day.isDisabled || !day.isCurrentMonth) return
    setSelectedDate(day.date)
  }

  const handleApply = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      onChange(`${year}-${month}-${day}`)
    }
    onClose?.()
  }

  const handleYearMonthSelect = (year: number, month: number) => {
    setViewDate(new Date(year, month, 1))
    setShowYearMonthPicker(false)
  }

  // Generate years for dropdown (current year - 1 to current year + 5)
  const years = useMemo(() => {
    const currentYear = today.getFullYear()
    return Array.from({ length: 7 }, (_, i) => currentYear - 1 + i)
  }, [])

  return (
    <div className="bg-white rounded-lg border mt-2">
      {/* Header with year/month navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
          className="flex items-center gap-1 text-primary font-medium touch-manipulation"
        >
          {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          <ChevronDown className={cn("w-4 h-4 transition-transform", showYearMonthPicker && "rotate-180")} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Year/Month picker dropdown */}
      {showYearMonthPicker && (
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">년도</label>
              <select
                value={viewDate.getFullYear()}
                onChange={(e) => handleYearMonthSelect(Number(e.target.value), viewDate.getMonth())}
                className="w-full p-2 border rounded-lg text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">월</label>
              <select
                value={viewDate.getMonth()}
                onChange={(e) => handleYearMonthSelect(viewDate.getFullYear(), Number(e.target.value))}
                className="w-full p-2 border rounded-lg text-sm"
              >
                {MONTHS.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 pt-4">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-sm text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-4 pb-4">
        {calendarDays.map((day, index) => {
          const dayNumber = day.date.getDate()

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={day.isDisabled || !day.isCurrentMonth}
              className="relative flex items-center justify-center h-10 w-full touch-manipulation"
            >
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full transition-all",
                  // Base styles
                  !day.isCurrentMonth && "text-gray-300",
                  day.isCurrentMonth && !day.isDisabled && "text-gray-900",
                  day.isDisabled && day.isCurrentMonth && "text-gray-300 cursor-not-allowed",
                  // Hover state - 흰색 배경 원형, 파란색 텍스트
                  day.isCurrentMonth && !day.isDisabled && !day.isSelected && "hover:bg-white hover:text-primary",
                  // Selected state - 파란색 배경 원형, 흰색 텍스트
                  day.isSelected && "bg-primary text-white",
                  // Today state - 파란색 테두리 원형, 파란색 텍스트 (선택되지 않은 경우)
                  day.isToday && !day.isSelected && "border-2 border-primary text-primary"
                )}
              >
                {dayNumber}
              </span>
            </button>
          )
        })}
      </div>

      {/* Apply button */}
      <div className="p-4 border-t">
        <Button
          onClick={handleApply}
          disabled={!selectedDate}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          적용
        </Button>
      </div>
    </div>
  )
}
