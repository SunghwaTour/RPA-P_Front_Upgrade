// API 데이터 모델 타입 정의

export type ReservationStatus =
  | 'pending'           // 예약 대기
  | 'approved'          // 승인됨 (deprecated)
  | 'payment_waiting'   // 결제 대기
  | 'payment_completed' // 결제 완료
  | 'confirmed'         // 예약 확정
  | 'dispatched'        // 배차 완료
  | 'in_progress'       // 운행 중
  | 'completed'         // 운행 완료
  | 'cancelled'         // 취소됨
  | 'payment_failed'    // 결제 실패

export type VehicleType = 'general' | 'solati'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'partial_cancelled' | 'refunded'

export interface Customer {
  id: string // Supabase UUID
  email: string
  name: string
  phone: string | null
  provider: 'google' | 'kakao' | 'email'
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface VehicleBreakdown {
  vehicle_no: number
  passengers: number
}

export interface Quote {
  base_price: number
  distance_price: number
  total_price: number
  distance_km: number
  estimated_hours: number
  calculation_details?: CalculationDetails
}

export interface CalculationDetails {
  vehicle_type: VehicleType
  vehicle_display: string
  season_type: 'peak' | 'off_peak'
  season_display: string
  fuel_cost: number
  toll_fee: number
  base_alpha: number
  distance_fee: number
  minimum_guarantee: number
  vehicle_multiplier: number // 1.0 or 1.1
  driver_multiplier: number // 1.15
}

export interface QuoteResponse {
  success: boolean
  total_price: number
  deposit_amount: number
  remaining_amount: number
  distance_km: number
  estimated_hours: number
  days: number
  vehicle_count: number
  is_multi_vehicle: boolean
  vehicle_breakdown: VehicleBreakdown[]
  vehicle_type_display: string
  season_display: string
  is_round_trip: boolean
  one_day_fare?: number
  summary?: {
    base_info: string
    vehicle_season: string
    pricing_note: string
  }
}

export interface Reservation {
  id: number
  customer: Customer

  // 운행 정보
  departure_location: string
  departure_coordinates: string // "lat,lng"
  destination_location: string
  destination_coordinates: string // "lat,lng"
  departure_date: string // ISO 8601
  return_date: string | null // ISO 8601

  // 예약 상세
  passenger_count: number
  vehicle_count: number
  vehicle_type: VehicleType
  vehicle_type_display: string
  is_multi_vehicle: boolean
  passengers_per_vehicle?: number
  vehicle_breakdown: VehicleBreakdown[]
  is_round_trip: boolean
  driver_accompanied: boolean
  special_requirements: string

  // 상태 및 견적
  status: ReservationStatus
  status_display: string
  quote_amount: number
  quote: Quote | null
  deposit_amount: number
  remaining_amount: number

  // 승인 정보
  approved_by_id: number | null
  approved_at: string | null

  // 배차 정보
  trp_dispatch_id: number | null
  assigned_vehicle_id: number | null
  assigned_driver_id: number | null

  // 결제 정보
  payment_status?: PaymentStatusInfo
  latest_payment?: Payment

  // 시간 정보
  created_at: string
  updated_at: string

  // 메서드
  can_cancel: boolean
}

export interface PaymentStatusInfo {
  status: PaymentStatus
  status_display: string
}

export interface Payment {
  id: string // UUID
  reservation_id: number

  // 포트원 정보
  imp_uid: string | null
  merchant_uid: string

  // 결제 정보
  payment_method: string // card, trans, vbank, manual 등
  pg_provider: string // html5_inicis 등
  pay_method: string

  // 금액
  amount: number
  currency: string // KRW
  refund_amount?: number

  // 상태
  status: PaymentStatus
  status_display: string

  // 결제 상세
  receipt_url: string | null
  apply_num: string | null // 승인번호
  vbank_name: string | null
  vbank_num: string | null
  vbank_date: string | null

  // 실패/취소
  fail_reason: string | null
  cancel_reason: string | null
  cancelled_at: string | null

  // 시간
  paid_at: string | null
  created_at: string
  updated_at: string

  // 메서드
  is_deposit_payment?: boolean
  can_cancel: boolean
}

// API 요청 타입
export interface CreateReservationRequest {
  departure_location: string
  departure_coordinates: string
  destination_location: string
  destination_coordinates: string
  departure_date: string // ISO 8601
  return_date?: string | null
  passenger_count: number
  vehicle_count: number
  vehicle_type: VehicleType
  is_round_trip: boolean
  driver_accompanied: boolean
  special_requirements?: string
}

export interface QuoteRequest {
  departure_location: string
  destination_location: string
  departure_coordinates: string
  destination_coordinates: string
  passenger_count: number
  departure_date: string
  return_date?: string | null
  is_round_trip: boolean
  is_solati: boolean
  vehicle_count?: number
}

export interface PaymentInitiateResponse {
  success: boolean
  payment_config: {
    pg: string
    pay_method: string
    merchant_uid: string
    name: string
    amount: number
    buyer_email: string
    buyer_name: string
    buyer_tel: string
  }
  deposit_amount: number
  total_amount: number
  remaining_amount: number
}

export interface PaymentVerifyRequest {
  imp_uid: string
  merchant_uid: string
}

export interface PaymentVerifyResponse {
  success: boolean
  message: string
  payment_status: string
  reservation_status: string
  receipt_url?: string
}

export interface PaymentStatusResponse {
  reservation_status: ReservationStatus
  reservation_status_display: string
  has_payment: boolean
  deposit_amount: number
  remaining_amount: number
  total_amount: number
  payment?: Payment
}

// API 응답 타입
export interface ApiResponse<T> {
  data?: T
  error?: string
  detail?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 포트원 결제 타입
export interface PortOneResponse {
  success: boolean
  imp_uid?: string
  merchant_uid?: string
  error_msg?: string
  error_code?: string
  pay_method?: string
  paid_amount?: number
  status?: string
}

// 카카오맵 타입
export interface KakaoCoordinates {
  lat: number
  lng: number
}

export interface KakaoPlace {
  place_name: string
  address_name: string
  road_address_name?: string
  x: string // longitude
  y: string // latitude
}

export interface KakaoAddressResult {
  address_name: string
  road_address?: {
    address_name: string
  }
  x: string
  y: string
}
