"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Search, MapPin, Navigation, Map } from "lucide-react"

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
  const [showSearchResults, setShowSearchResults] = useState(false)

  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const placesRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (!isOpen) return

    const loadKakaoMap = () => {
      // 이미 스크립트가 로드되어 있는 경우
      if (window.kakao && window.kakao.maps) {
        console.log("카카오맵 이미 로드됨")
        initializeServices()
        setTimeout(() => initializeMap(), 100)
        return
      }

      // 스크립트가 이미 추가되어 있는지 확인
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
      if (existingScript) {
        console.log("카카오맵 스크립트 로딩 중...")
        // 스크립트가 로드될 때까지 대기
        const checkKakao = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(checkKakao)
            window.kakao.maps.load(() => {
              console.log("카카오맵 로드 완료")
              initializeServices()
              setTimeout(() => initializeMap(), 100)
            })
          }
        }, 100)
        return
      }

      // 새로운 스크립트 추가
      console.log("카카오맵 스크립트 추가 중...")
      const script = document.createElement("script")
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`
      script.async = true
      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log("카카오맵 로드 완료")
          initializeServices()
          setTimeout(() => initializeMap(), 100)
        })
      }
      script.onerror = () => {
        console.error("카카오맵 스크립트 로드 실패")
      }
      document.head.appendChild(script)
    }

    loadKakaoMap()
  }, [isOpen])

  const initializeServices = () => {
    if (!window.kakao || !window.kakao.maps) return

    console.log("카카오맵 서비스 초기화")
    geocoderRef.current = new window.kakao.maps.services.Geocoder()
    placesRef.current = new window.kakao.maps.services.Places()
  }

  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("카카오맵 객체가 없습니다")
      return
    }

    const container = document.getElementById("kakao-map-container")
    if (!container) {
      console.error("지도 컨테이너를 찾을 수 없습니다")
      return
    }

    // 이미 지도가 초기화되어 있다면 재사용
    if (mapRef.current) {
      console.log("기존 지도 재사용")
      // 지도 크기 재조정
      setTimeout(() => {
        mapRef.current.relayout()
        mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.978))
      }, 100)
      setMapLoaded(true)
      return
    }

    console.log("지도 초기화 중...")
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
      level: 3,
    }

    try {
      mapRef.current = new window.kakao.maps.Map(container, options)
      console.log("지도 생성 완료")

      // 지도 클릭 이벤트
      window.kakao.maps.event.addListener(mapRef.current, "click", (mouseEvent: any) => {
        const latlng = mouseEvent.latLng
        selectLocationOnMap(latlng.getLat(), latlng.getLng())
      })

      setMapLoaded(true)
    } catch (error) {
      console.error("지도 생성 실패:", error)
    }
  }

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
    if (!placesRef.current || !geocoderRef.current) {
      console.error("검색 서비스가 초기화되지 않았습니다")
      return
    }

    const query = searchQuery.trim()
    console.log("검색 중:", query)

    // 키워드 검색
    placesRef.current.keywordSearch(query, (result: any, status: any) => {
      console.log("키워드 검색 결과:", status, result)

      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const results: SearchResult[] = result.slice(0, 10).map((item: any) => ({
          place_name: item.place_name,
          address_name: item.address_name,
          road_address_name: item.road_address_name,
          x: item.x,
          y: item.y,
        }))
        console.log("검색 결과:", results.length, "개")
        setSearchResults(results)
        setShowSearchResults(true)
      } else {
        console.log("주소 검색 시도 중...")
        // 주소 검색
        geocoderRef.current.addressSearch(query, (result: any, status: any) => {
          console.log("주소 검색 결과:", status, result)

          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const results: SearchResult[] = result.slice(0, 10).map((item: any) => ({
              place_name: item.address_name,
              address_name: item.address_name,
              road_address_name: item.road_address?.address_name,
              x: item.x,
              y: item.y,
            }))
            console.log("주소 검색 결과:", results.length, "개")
            setSearchResults(results)
            setShowSearchResults(true)
          } else {
            console.error("검색 결과 없음")
            setSearchResults([])
            setShowSearchResults(false)
          }
        })
      }
    })
  }

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.y)
    const lng = parseFloat(result.x)

    if (mapRef.current) {
      const coords = new window.kakao.maps.LatLng(lat, lng)
      mapRef.current.setCenter(coords)
      mapRef.current.setLevel(3)
    }

    selectLocationOnMap(lat, lng, result.place_name || result.address_name)
    setShowSearchResults(false)
  }

  const selectLocationOnMap = (lat: number, lng: number, address?: string) => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) {
      console.error("지도가 초기화되지 않았습니다")
      return
    }

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null)
      markerRef.current = null
      console.log("기존 마커 제거됨")
    }

    // 새 마커 추가
    const markerPosition = new window.kakao.maps.LatLng(lat, lng)
    markerRef.current = new window.kakao.maps.Marker({
      position: markerPosition,
      map: mapRef.current,
    })
    console.log("새 마커 추가됨:", lat, lng)

    if (address) {
      setSelectedLocation({ address, lat, lng })
    } else {
      // 좌표로 주소 검색
      if (!geocoderRef.current) {
        console.error("Geocoder가 초기화되지 않았습니다")
        setSelectedLocation({
          address: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
          lat,
          lng,
        })
        return
      }

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
    setShowSearchResults(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* 검색 바 */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="주소나 장소명을 입력하세요 (2글자 이상)"
                  className="pl-10 h-12"
                />
              </div>
              <Button onClick={getCurrentLocation} variant="outline" className="gap-2 h-12 px-4">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            {/* 검색 결과 드롭다운 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="p-3 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{result.place_name}</p>
                        <p className="text-xs text-gray-600 truncate">{result.address_name}</p>
                        {result.road_address_name && (
                          <p className="text-xs text-gray-500 truncate">{result.road_address_name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 지도 */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">지도를 클릭하거나 검색으로 위치를 선택하세요</p>
            <div id="kakao-map-container" className="w-full h-[450px] rounded-lg border bg-gray-100" />
          </div>

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
        </div>
      </Card>
    </div>
  )
}
