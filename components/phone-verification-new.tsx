"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Delete } from "lucide-react"
import { sendVerificationCode, verifyPhoneNumber } from "@/lib/api"

interface PhoneVerificationNewProps {
  onClose: () => void
  onVerified: (phone: string) => void
}

export function PhoneVerificationNew({ onClose, onVerified }: PhoneVerificationNewProps) {
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  // 타이머
  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  // 인증번호 입력 처리
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // 숫자만 허용

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // 마지막 한 글자만
    setVerificationCode(newCode)
    setError("")

    // 자동으로 다음 입력칸으로 이동
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  // 전화번호 포맷팅
  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}`
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`
  }

  // 인증번호 발송
  const handleSendCode = async () => {
    if (phoneNumber.length !== 11) {
      alert("올바른 전화번호를 입력해주세요")
      return
    }

    try {
      setIsSending(true)
      const formattedPhone = formatPhoneNumber(phoneNumber)
      await sendVerificationCode(formattedPhone)
      setStep("code")
      setTimeLeft(180) // 3분
    } catch (error) {
      console.error("인증번호 발송 오류:", error)
      alert("인증번호 발송에 실패했습니다.")
    } finally {
      setIsSending(false)
    }
  }

  // 인증번호 확인
  const handleVerifyCode = async () => {
    const code = verificationCode.join("")
    if (code.length !== 4) {
      setError("인증번호 4자리를 입력해주세요")
      return
    }

    try {
      setIsVerifying(true)
      setError("")
      const formattedPhone = formatPhoneNumber(phoneNumber)
      await verifyPhoneNumber(formattedPhone, code)
      onVerified(formattedPhone)
      onClose()
    } catch (error: any) {
      console.error("인증 확인 오류:", error)
      setError(error.response?.data?.error || "인증번호가 올바르지 않습니다. 다시 입력해 주세요")
    } finally {
      setIsVerifying(false)
    }
  }

  // 타이머 포맷 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[600px] mx-auto">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-50 safe-area-inset border-b">
        <div className="flex items-center px-4 py-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">휴대폰 인증</h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {step === "phone" ? (
          <>
            <h2 className="text-2xl font-bold mb-2">예약 관련 알림을 받을</h2>
            <h2 className="text-2xl font-bold mb-8">휴대폰 번호를 알려주세요</h2>

            <Input
              type="tel"
              placeholder="휴대폰 번호를 입력해 주세요"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                if (value.length <= 11) {
                  setPhoneNumber(value)
                }
              }}
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-lg mb-6"
              maxLength={11}
            />

            <Button
              onClick={handleSendCode}
              disabled={isSending || phoneNumber.length !== 11}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl disabled:opacity-30"
            >
              {isSending ? "발송 중..." : "다음"}
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">문자로 받은 인증번호</h2>
            <h2 className="text-2xl font-bold mb-4">4자리를 입력해 주세요</h2>

            <p className="text-sm text-gray-600 mb-6">
              남은 시간 {formatTime(timeLeft)}
            </p>

            {/* 인증번호 입력 칸 */}
            <div className="flex gap-3 justify-center mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:border-primary ${
                    error ? "border-red-500" : "border-primary"
                  }`}
                />
              ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-sm text-red-500 text-center mb-6">{error}</p>
            )}

            <p className="text-xs text-center text-gray-500 mb-6">
              인증번호가 오지 않는다면 1588-9281로 문의 주세요
            </p>

            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.some(d => d === "")}
              className="w-full bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 py-6 text-base font-medium rounded-xl disabled:opacity-50 mb-4"
            >
              다시 전송
            </Button>

            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.some(d => d === "")}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-bold rounded-xl disabled:opacity-30"
            >
              {isVerifying ? "확인 중..." : "확인"}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
