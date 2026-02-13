"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search, MapPin, Crosshair } from "lucide-react"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: { name: string; coords: string }) => void
  title: string
}

export function LocationSearchModal({ isOpen, onClose, onSelect, title }: LocationSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [isLoadingKakao, setIsLoadingKakao] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const markerRef = useRef<any>(null)

  // 모달 열림/닫힘 애니메이션 제어
  useEffect(() => {
    if (isOpen) {
      // 약간의 지연 후 visible 상태로 전환 (애니메이션 트리거)
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (!isOpen) return

    // 이미 로드되어 있는 경우
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setIsLoadingKakao(true)
      })
      return
    }

    // 스크립트가 이미 추가되어 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      const checkKakao = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakao)
          window.kakao.maps.load(() => {
            setIsLoadingKakao(true)
          })
        }
      }, 100)
      return
    }

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`
    script.async = true

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsLoadingKakao(true)
        })
      }
    }

    document.head.appendChild(script)
  }, [isOpen])

  // 지도 초기화
  useEffect(() => {
    if (!isOpen || !isLoadingKakao) return

    const container = document.getElementById("kakao-map")
    if (!container || !window.kakao) return

    // 항상 새로 지도 생성 (DOM이 새로 생성되므로)
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
      level: 3,
    }

    const kakaoMap = new window.kakao.maps.Map(container, options)
    setMap(kakaoMap)

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(kakaoMap, "click", function(mouseEvent: any) {
      const latlng = mouseEvent.latLng

      // 기존 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }

      // 새 마커 추가
      const newMarker = new window.kakao.maps.Marker({
        position: latlng,
        map: kakaoMap,
      })
      markerRef.current = newMarker

      // 좌표로 주소 검색
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const address = result[0].address.address_name
          const roadAddress = result[0].road_address?.address_name || address

          setSelectedPlace({
            name: roadAddress,
            coords: `${latlng.getLat()},${latlng.getLng()}`,
            latlng: latlng,
          })
        }
      })
    })
  }, [isOpen, isLoadingKakao])

  // 실시간 검색 (2글자 이상)
  useEffect(() => {
    if (!isOpen) return

    // 기존 타이머 제거
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // 검색어가 2글자 미만이면 검색 결과 숨김
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // 500ms 디바운스
    searchTimeoutRef.current = setTimeout(() => {
      performSearch()
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, isOpen])

  const performSearch = () => {
    if (!window.kakao) return

    const ps = new window.kakao.maps.services.Places()

    ps.keywordSearch(searchQuery, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data.slice(0, 10))
        setShowSearchResults(true)
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        setSearchResults([])
        setShowSearchResults(false)
      }
    })
  }

  // 검색 결과 선택
  const handleResultClick = (place: any) => {
    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
    }

    const lat = parseFloat(place.y)
    const lng = parseFloat(place.x)
    const latlng = new window.kakao.maps.LatLng(lat, lng)

    // 지도 중심 이동
    if (map) {
      map.setCenter(latlng)
      map.setLevel(3)

      // 새 마커 추가
      const newMarker = new window.kakao.maps.Marker({
        position: latlng,
        map: map,
      })
      markerRef.current = newMarker
    }

    setSelectedPlace({
      name: place.place_name,
      coords: `${lat},${lng}`,
      latlng: latlng,
    })
    setShowSearchResults(false)
  }

  // 현재 위치 사용
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("위치 서비스를 사용할 수 없습니다")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const latlng = new window.kakao.maps.LatLng(lat, lng)

        if (!window.kakao) return

        // 기존 마커 제거
        if (markerRef.current) {
          markerRef.current.setMap(null)
          markerRef.current = null
        }

        // 지도 중심 이동
        if (map) {
          map.setCenter(latlng)
          map.setLevel(3)

          // 새 마커 추가
          const newMarker = new window.kakao.maps.Marker({
            position: latlng,
            map: map,
          })
          markerRef.current = newMarker
        }

        // 좌표로 주소 검색
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name
            const roadAddress = result[0].road_address?.address_name || address

            setSelectedPlace({
              name: roadAddress,
              coords: `${lat},${lng}`,
              latlng: latlng,
            })
          }
        })
      },
      (error) => {
        alert("위치를 가져올 수 없습니다")
        console.error(error)
      }
    )
  }

  const handleConfirm = () => {
    if (selectedPlace) {
      onSelect({
        name: selectedPlace.name,
        coords: selectedPlace.coords,
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedPlace(null)

    // 지도와 마커 초기화
    setMap(null)
    if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
    }

    onClose()
  }

  // 배경 오버레이 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 오버레이 자체를 클릭한 경우에만 닫기 (모달 내부 클릭은 무시)
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-300 ${
        isVisible ? "bg-black/50" : "bg-transparent"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white w-full max-h-[90vh] max-w-[600px] rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="touch-manipulation">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 검색 바 */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="주소나 장소명을 입력하세요 (2글자 이상)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 rounded-full border-2 border-gray-200 focus:border-primary"
              />
            </div>

            {/* 검색 결과 드롭다운 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {searchResults.map((place, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(place)}
                    className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b last:border-b-0 touch-manipulation"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{place.place_name}</h3>
                        {place.road_address_name && (
                          <p className="text-xs text-gray-600 truncate">{place.road_address_name}</p>
                        )}
                        <p className="text-xs text-gray-500 truncate">{place.address_name}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 현재 위치 사용하기 버튼 */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors touch-manipulation"
          >
            현재 위치 사용하기
            <Crosshair className="w-4 h-4" />
          </button>

          {/* 지도 */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">지도를 클릭하거나 검색으로 위치를 선택하세요</p>
            <div id="kakao-map" className="w-full h-[400px] rounded-lg border bg-gray-100" />
          </div>

          {/* 선택된 장소 표시 */}
          {selectedPlace && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3 mb-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{selectedPlace.name}</p>
                </div>
              </div>
              <Button
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl touch-manipulation"
              >
                이 위치 선택
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
