// PortOne (구 아임포트) SDK 통합

declare global {
  interface Window {
    IMP?: any
  }
}

// PortOne 스크립트 로드
export const loadPortOneScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.IMP) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.iamport.kr/v1/iamport.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("PortOne 스크립트 로드 실패"))
    document.head.appendChild(script)
  })
}

// PortOne 초기화
export const initPortOne = (userCode: string) => {
  if (window.IMP) {
    window.IMP.init(userCode)
  } else {
    console.error("PortOne SDK가 로드되지 않았습니다")
  }
}

export interface PortOnePaymentRequest {
  pg: string // PG사 구분코드
  pay_method: string // 결제수단
  merchant_uid: string // 주문번호
  name: string // 주문명
  amount: number // 결제금액
  buyer_email: string
  buyer_name: string
  buyer_tel: string
  buyer_addr?: string
  buyer_postcode?: string
  m_redirect_url?: string // 모바일 결제 후 리다이렉트 URL
}

export interface PortOnePaymentResponse {
  success: boolean
  imp_uid?: string
  merchant_uid?: string
  error_msg?: string
  error_code?: string
  pay_method?: string
  paid_amount?: number
  status?: string
}

// PortOne 결제 요청
export const requestPortOnePayment = (
  paymentData: PortOnePaymentRequest
): Promise<PortOnePaymentResponse> => {
  return new Promise((resolve) => {
    if (!window.IMP) {
      resolve({
        success: false,
        error_msg: "PortOne SDK가 로드되지 않았습니다",
      })
      return
    }

    window.IMP.request_pay(paymentData, (response: PortOnePaymentResponse) => {
      resolve(response)
    })
  })
}
