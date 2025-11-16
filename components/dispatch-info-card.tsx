"use client"

import { Phone } from "lucide-react"

interface DispatchInfoCardProps {
  vehicleInfo?: {
    id: number
    license_plate?: string
    vehicle_type?: string
    max_capacity?: number
  }
  driverInfo?: {
    id: number
    name?: string
    phone?: string
  }
  vehicleCount: number
  passengerCount: number
  dispatchedAt?: string
}

export function DispatchInfoCard({
  vehicleInfo,
  driverInfo,
  vehicleCount,
  passengerCount,
  dispatchedAt
}: DispatchInfoCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid rgba(242, 244, 246, 1)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">운행 상세</h2>
        {dispatchedAt && (
          <span className="text-xs text-gray-500">
            {new Date(dispatchedAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })} {new Date(dispatchedAt).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })} 배차 완료
          </span>
        )}
      </div>

      {/* 배차 정보 */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3">배차 정보</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">인승</span>
            <span className="font-medium">{passengerCount}인승</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">대수</span>
            <span className="font-medium">{vehicleCount}대</span>
          </div>
        </div>
      </div>

      {/* 기사 정보 */}
      {driverInfo && (
        <div>
          <h3 className="text-sm font-bold mb-3">기사 정보</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">기사명</span>
              <span className="font-medium">{driverInfo.name || '배정 대기'}</span>
            </div>
            {driverInfo.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">연락처</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{driverInfo.phone}</span>
                  <button
                    onClick={() => window.location.href = `tel:${driverInfo.phone}`}
                    className="text-primary"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
