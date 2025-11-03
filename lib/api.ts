import { API_BASE_URL, getAccessToken } from "./supabase"
import type {
  QuoteRequest,
  QuoteResponse,
  CreateReservationRequest,
  Reservation,
  PaginatedResponse,
  PaymentInitiateResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse,
  PaymentStatusResponse,
  Payment
} from "@/types"

// API 호출 헬퍼 함수
async function fetchAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new Error(error.error || error.detail || "API request failed")
  }

  return response.json()
}

// 견적 조회
export async function getQuote(params: QuoteRequest): Promise<QuoteResponse> {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  return fetchAPI<QuoteResponse>(`/api/v1/reservation/quote/?${queryParams.toString()}`)
}

// 예약 생성
export async function createReservation(data: CreateReservationRequest): Promise<Reservation> {
  return fetchAPI<Reservation>("/api/v1/reservation/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// 예약 목록 조회
export async function getReservations(params?: {
  page?: number
  status?: string
}): Promise<PaginatedResponse<Reservation>> {
  let url = "/api/v1/reservation/"

  if (params) {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', String(params.page))
    if (params.status) queryParams.append('status', params.status)
    url += `?${queryParams.toString()}`
  }

  return fetchAPI<PaginatedResponse<Reservation>>(url)
}

// 예약 상세 조회
export async function getReservation(id: number): Promise<Reservation> {
  return fetchAPI<Reservation>(`/api/v1/reservation/${id}/`)
}

// 예약 취소
export async function cancelReservation(id: number): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/api/v1/reservation/${id}/cancel/`, {
    method: "POST",
  })
}

// 결제 시작
export async function initiatePayment(reservationId: number): Promise<PaymentInitiateResponse> {
  return fetchAPI<PaymentInitiateResponse>(`/api/v1/reservation/${reservationId}/payment/initiate/`, {
    method: "POST",
  })
}

// 결제 검증
export async function verifyPayment(data: PaymentVerifyRequest): Promise<PaymentVerifyResponse> {
  return fetchAPI<PaymentVerifyResponse>("/api/v1/reservation/payment/verify/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// 결제 상태 조회
export async function getPaymentStatus(reservationId: number): Promise<PaymentStatusResponse> {
  return fetchAPI<PaymentStatusResponse>(`/api/v1/reservation/${reservationId}/payment/status/`)
}

// 결제 내역 조회
export async function getPaymentHistory(params?: {
  page?: number
}): Promise<PaginatedResponse<Payment>> {
  let url = "/api/v1/reservation/payment/history/"

  if (params?.page) {
    url += `?page=${params.page}`
  }

  return fetchAPI<PaginatedResponse<Payment>>(url)
}

// 결제 취소
export async function cancelPayment(paymentId: string, reason: string): Promise<{ success: boolean; message: string }> {
  return fetchAPI<{ success: boolean; message: string }>(`/api/v1/reservation/payment/${paymentId}/cancel/`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
}
