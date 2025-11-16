"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyPayment } from "@/lib/api"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const processPayment = async () => {
      try {
        // URL에서 결제 결과 파라미터 추출
        const imp_uid = searchParams.get("imp_uid")
        const merchant_uid = searchParams.get("merchant_uid")
        const success = searchParams.get("imp_success")

        // 결제 실패한 경우
        if (success === "false" || !imp_uid || !merchant_uid) {
          setStatus("error")
          setMessage("결제가 취소되었거나 실패했습니다.")
          setTimeout(() => {
            router.push("/")
          }, 3000)
          return
        }

        // 백엔드에 결제 검증 요청
        const result = await verifyPayment({
          imp_uid,
          merchant_uid,
        })

        if (result.success) {
          setStatus("success")
          setMessage("결제가 완료되었습니다!")
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else {
          setStatus("error")
          setMessage(result.message || "결제 검증에 실패했습니다.")
          setTimeout(() => {
            router.push("/")
          }, 3000)
        }
      } catch (error: any) {
        console.error("결제 처리 오류:", error)
        setStatus("error")
        setMessage(error.message || "결제 처리 중 오류가 발생했습니다.")
        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    }

    processPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h1 className="text-xl font-bold mb-2">결제 처리 중</h1>
            <p className="text-gray-600">잠시만 기다려주세요...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-bold mb-2">결제 완료</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">메인 페이지로 이동합니다...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-bold mb-2">결제 실패</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">메인 페이지로 이동합니다...</p>
          </>
        )}
      </div>
    </div>
  )
}
