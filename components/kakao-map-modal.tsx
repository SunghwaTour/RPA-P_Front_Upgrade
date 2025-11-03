"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Search, MapPin, Navigation } from "lucide-react"

interface KakaoMapModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (address: string, coordinates: string) => void
  title: string
}

declare global {
  interface Window {
    kakao: any
  }
}

interface SearchResult {
  place_name: string
  address_name: string
  road_address_name?: string
  x: string // longitude
  y: string // latitude
}

export function KakaoMapModal({ isOpen, onClose, onSelectLocation, title }: KakaoMapModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    lat: number
    lng: number
  } | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const placesRef = useRef<any>(null)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (!isOpen) return

    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        initializeMap()
        return
      }

      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`
      script.async = true
      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap()
        })
      }
      document.head.appendChild(script)
    }

    loadKakaoMap()
  }, [isOpen])

  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) return

    const container = document.getElementById("kakao-map-container")
    if (!container) return

    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 3,
    }

    mapRef.current = new window.kakao.maps.Map(container, options)
    geocoderRef.current = new window.kakao.maps.services.Geocoder()
    placesRef.current = new window.kakao.maps.services.Places()

    // 지도 클릭 이벤트
    window.kakao.maps.event.addListener(mapRef.current, "click", (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      selectLocationOnMap(latlng.getLat(), latlng.getLng())
    })

    setMapLoaded(true)
  }

  const searchLocation = () => {
    if (!searchQuery.trim() || !placesRef.current || !geocoderRef.current) return

    // 키워드 검색
    placesRef.current.keywordSearch(searchQuery, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const results: SearchResult[] = result.map((item: any) => ({
          place_name: item.place_name,
          address_name: item.address_name,
          road_address_name: item.road_address_name,
          x: item.x,
          y: item.y,
        }))
        setSearchResults(results)
      } else {
        // 주소 검색
        geocoderRef.current.addressSearch(searchQuery, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const results: SearchResult[] = result.map((item: any) => ({
              place_name: item.address_name,
              address_name: item.address_name,
              road_address_name: item.road_address?.address_name,
              x: item.x,
              y: item.y,
            }))
            setSearchResults(results)
          } else {
            alert("검색 결과가 없습니다.")
            setSearchResults([])
          }
        })
      }
    })
  }

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.y)
    const lng = parseFloat(result.x)

    const coords = new window.kakao.maps.LatLng(lat, lng)
    mapRef.current.setCenter(coords)
    mapRef.current.setLevel(3)

    selectLocationOnMap(lat, lng, result.address_name)
    setSearchResults([])
  }

  const selectLocationOnMap = (lat: number, lng: number, address?: string) => {
    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // 새 마커 추가
    const markerPosition = new window.kakao.maps.LatLng(lat, lng)
    markerRef.current = new window.kakao.maps.Marker({
      position: markerPosition,
      map: mapRef.current,
    })

    if (address) {
      setSelectedLocation({ address, lat, lng })
    } else {
      // 좌표로 주소 검색
      geocoderRef.current.coord2Address(lng, lat, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addr =
            result[0].address?.address_name ||
            result[0].road_address?.address_name ||
            `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`
          setSelectedLocation({ address: addr, lat, lng })
        } else {
          setSelectedLocation({
            address: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
            lat,
            lng,
          })
        }
      })
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        const coords = new window.kakao.maps.LatLng(lat, lng)
        mapRef.current.setCenter(coords)
        mapRef.current.setLevel(3)

        selectLocationOnMap(lat, lng)
      },
      (error) => {
        let errorMessage = "위치를 가져올 수 없습니다."
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "위치 권한이 거부되었습니다."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "위치 정보를 사용할 수 없습니다."
            break
          case error.TIMEOUT:
            errorMessage = "위치 요청 시간이 초과되었습니다."
            break
        }
        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  const handleConfirm = () => {
    if (!selectedLocation) {
      alert("위치를 선택해주세요.")
      return
    }

    const coordinates = `${selectedLocation.lat},${selectedLocation.lng}`
    onSelectLocation(selectedLocation.address, coordinates)
    handleClose()
  }

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedLocation(null)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchLocation()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        {/* 헤더 */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* 검색 바 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="주소나 장소명을 입력하세요"
                className="pl-10 h-12"
              />
            </div>
            <Button onClick={searchLocation} className="h-12 px-6">
              검색
            </Button>
          </div>

          {/* 검색 결과 목록 */}
          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg border">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{result.place_name}</p>
                      <p className="text-sm text-gray-600 truncate">{result.address_name}</p>
                      {result.road_address_name && (
                        <p className="text-xs text-gray-500 truncate">{result.road_address_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 지도 */}
          <div id="kakao-map-container" className="w-full h-[400px] rounded-lg border bg-gray-100" />

          {/* 선택된 위치 정보 */}
          {selectedLocation && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{selectedLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    좌표: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
                <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                  이 위치로 선택
                </Button>
              </div>
            </div>
          )}

          {/* 현재 위치 버튼 */}
          <div className="text-center">
            <Button onClick={getCurrentLocation} variant="outline" className="gap-2">
              <Navigation className="w-4 h-4" />
              현재 위치 사용
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
