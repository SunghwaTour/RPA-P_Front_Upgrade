"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Phone, Lock } from "lucide-react"
import { sendVerificationCode, verifyPhoneNumber } from "@/lib/api"

interface PhoneVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerified: () => void
  customerName: string
  phone: string
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  customerName,
  phone,
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<"input" | "verify">("input")
  const [phoneNumber, setPhoneNumber] = useState(phone || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)

  // 전화번호 자동 포맷팅 (하이픈 자동 추가)
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, "")

    // 010-1234-5678 형식으로 변환
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else if (numbers.length <= 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  // 타이머 효과
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setStep("input")
      setPhoneNumber(phone || "")
      setVerificationCode("")
      setError("")
      setTimeLeft(0)
    }
  }, [isOpen, phone])

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      setError("휴대폰 번호를 입력해주세요.")
      return
    }

    // 숫자만 추출
    const numbersOnly = phoneNumber.replace(/[^0-9]/g, "")

    // 휴대폰 번호 형식 검증 (01로 시작, 10-11자리)
    if (!numbersOnly.startsWith("01") || (numbersOnly.length !== 10 && numbersOnly.length !== 11)) {
      setError("올바른 휴대폰 번호 형식이 아닙니다.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await sendVerificationCode(phoneNumber)

      if (result.success) {
        setStep("verify")
        setTimeLeft(300) // 5분
        // 개발 환경에서 코드가 반환되면 콘솔에 출력
        if (result.code) {
          console.log("인증 코드:", result.code)
        }
      } else {
        setError(result.message || "인증 코드 전송에 실패했습니다.")
      }
    } catch (err: any) {
      console.error("인증 코드 전송 오류:", err)
      setError(err.message || "인증 코드 전송 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("인증 코드를 입력해주세요.")
      return
    }

    if (verificationCode.length !== 4) {
      setError("인증 코드는 4자리 숫자입니다.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await verifyPhoneNumber(phoneNumber, verificationCode)

      if (result.success) {
        onVerified()
        onClose()
      } else {
        setError(result.message || "인증에 실패했습니다.")
      }
    } catch (err: any) {
      console.error("인증 코드 검증 오류:", err)
      setError(err.message || "인증 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = () => {
    setVerificationCode("")
    handleSendCode()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4">
        <Card className="p-6 relative">
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 헤더 */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">휴대폰 인증</h2>
            <p className="text-sm text-muted-foreground">
              예약자: <span className="font-semibold text-foreground">{customerName}</span>
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 휴대폰 번호 입력 단계 */}
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  휴대폰 번호
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setPhoneNumber(formatted)
                  }}
                  className="h-12 text-base"
                  disabled={isLoading}
                  maxLength={13}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  숫자만 입력하세요. 자동으로 하이픈이 추가됩니다.
                </p>
              </div>

              <Button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full h-12 text-base"
              >
                {isLoading ? "전송 중..." : "인증 코드 전송"}
              </Button>
            </div>
          )}

          {/* 인증 코드 입력 단계 */}
          {step === "verify" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="code" className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4" />
                  인증 코드
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="4자리 숫자"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                    setVerificationCode(value)
                  }}
                  className="h-12 text-base text-center text-2xl tracking-widest"
                  disabled={isLoading}
                  maxLength={4}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {phoneNumber}로 전송된 인증 코드를 입력하세요.
                  </p>
                  {timeLeft > 0 && (
                    <p className="text-xs font-semibold text-primary">{formatTime(timeLeft)}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 4}
                className="w-full h-12 text-base"
              >
                {isLoading ? "확인 중..." : "인증 확인"}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => setStep("input")}
                  variant="outline"
                  className="flex-1 h-10"
                  disabled={isLoading}
                >
                  번호 수정
                </Button>
                <Button
                  onClick={handleResendCode}
                  variant="outline"
                  className="flex-1 h-10"
                  disabled={isLoading || timeLeft > 240}
                >
                  {timeLeft > 240 ? "재전송 대기" : "재전송"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
