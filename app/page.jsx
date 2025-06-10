'use client'

import dynamic from 'next/dynamic'
import { useEffect, Suspense, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSelector, useDispatch } from 'react-redux'
import { placeObject, setMode } from '@/store/slices/centralSlice'
import PlaceholderIcon from '@/components/ui/PlaceholderIcon'
import Sun from '@/components/ui/icons/Sun'
import Boat from '@/components/ui/icons/Boat'
import Fire from '@/components/ui/icons/Fire'
import Lightning from '@/components/ui/icons/Lightning'
import Star from '@/components/ui/icons/Star'
import SunMoon from '@/components/ui/icons/SunMoon'
import Image from 'next/image'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const Central = dynamic(() => import('@/components/canvas/center/central').then((mod) => mod.Central), { ssr: false })
const LeftPanel = dynamic(() => import('@/components/canvas/left/leftPanel').then((mod) => mod.LeftPanel), { ssr: false })
const RightPanel = dynamic(() => import('@/components/canvas/right/rightPanel').then((mod) => mod.RightPanel), { ssr: false })
const WebSocketStream = dynamic(() => import('@/components/canvas/WebSocketStream').then((mod) => mod.WebSocketStream), { ssr: false })

export default function Page() {
  const dispatch = useDispatch()
  const { isStoryActive, mode, allScenesCompleted, completedScenes, chapter } = useSelector(state => state.central)
  const [showPlaceholders, setShowPlaceholders] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [splashFadingOut, setSplashFadingOut] = useState(false)

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500) // Wait 1.5 seconds for components to load
    return () => clearTimeout(timer)
  }, [])

  // Splash screen fade-in effect
  useEffect(() => {
    if (isLoaded && mode === 'splashscreen') {
      const timer = setTimeout(() => {
        setShowSplash(true)
      }, 200) // Small delay for smooth transition
      return () => clearTimeout(timer)
    } else {
      setShowSplash(false)
    }
  }, [isLoaded, mode])

  // Show placeholders logic
  useEffect(() => {
    if (!isStoryActive && mode === 'map') {
      const timer = setTimeout(() => {
        setShowPlaceholders(true)
      }, 800) // Reduced delay for smoother transition from splash
      return () => clearTimeout(timer)
    } else {
      setShowPlaceholders(false)
    }
  }, [isStoryActive, mode])

  // Handle placeholder clicks
  const handlePlaceholderClick = (objectType) => {
    dispatch(placeObject(objectType))
    dispatch(setMode('scene'))
    setShowPlaceholders(false)
  }

  // Handle star click for chapter progression
  const handleStarClick = () => {
    dispatch(placeObject('star'))
    dispatch(setMode('scene'))
    setShowPlaceholders(false)
  }

  // Handle splash screen click
  const handleSplashClick = () => {
    if (mode === 'splashscreen' && !splashFadingOut) {
      setSplashFadingOut(true)
      // Wait for fade-out animation to complete before changing mode
      setTimeout(() => {
        dispatch(setMode('map'))
        setSplashFadingOut(false)
      }, 1000) // Match the transition duration
    }
  }

  return (
    <>
      <div className='flex h-screen w-screen items-center justify-center bg-orange-100'>
        <div className='mx-auto flex w-full max-w-6xl gap-2'>
          {/* left */}
          <div className='left-panel relative aspect-[73/140] w-1/5 ' id="left-panel" data-panel="left">
            <View className='absolute inset-0 size-full' panelId="left">
              <Suspense fallback={null}>
                <LeftPanel />
                <WebSocketStream panelId="left" fps={10} />
                <Common />
              </Suspense>
            </View>
          </div>

          {/* central */}
          <div className='center-panel relative aspect-[3/2] w-3/5 ' id="center-panel" data-panel="center">
            {/* SVG Placeholders */}
            {showPlaceholders && !isStoryActive && (
              <div className="animate-in fade-in pointer-events-none absolute inset-0 z-10 duration-1000">
                {chapter === 1 ? (
                  <>
                    {/* Chapter 2 placeholders: sun, boat, fire */}
                    {!completedScenes.includes('sun') && (
                      <PlaceholderIcon
                        x={75}
                        y={25}

                        onClick={() => handlePlaceholderClick('sun')}
                        className="pointer-events-auto"
                      >
                        <Sun width={40}
                          height={40} />
                      </PlaceholderIcon>
                    )}
                    {!completedScenes.includes('boat') && (
                      <PlaceholderIcon
                        x={55}
                        y={75}

                        onClick={() => handlePlaceholderClick('boat')}
                        className="pointer-events-auto"
                      >
                        <Boat width={40}
                          height={40} />
                      </PlaceholderIcon>
                    )}
                    {!completedScenes.includes('fire') && (
                      <PlaceholderIcon
                        x={40}
                        y={60}

                        onClick={() => handlePlaceholderClick('fire')}
                        className="pointer-events-auto"
                      >
                        <Fire width={20}
                          height={20} />
                      </PlaceholderIcon>
                    )}
                  </>
                ) : (
                  <>
                    {/* Chapter 1 placeholders: sun, lightning, boat */}
                    {!completedScenes.includes('sun') && (
                      <PlaceholderIcon
                        x={70}
                        y={35}

                        onClick={() => handlePlaceholderClick('sun')}
                        className="pointer-events-auto"
                      >
                        <Sun width={40}
                          height={40} />
                      </PlaceholderIcon>
                    )}
                    {!completedScenes.includes('lightning') && (
                      <PlaceholderIcon
                        x={40}
                        y={35}

                        onClick={() => handlePlaceholderClick('lightning')}
                        className="pointer-events-auto"
                      >
                        <Lightning width={40}
                          height={40} />
                      </PlaceholderIcon>
                    )}
                    {!completedScenes.includes('boat') && (
                      <PlaceholderIcon
                        x={70}
                        y={75}

                        onClick={() => handlePlaceholderClick('boat')}
                        className="pointer-events-auto"
                      >
                        <Boat width={40}
                          height={40} />
                      </PlaceholderIcon>
                    )}
                  </>
                )}
                {/* Star placeholder for chapter progression */}
                {allScenesCompleted && (
                  <PlaceholderIcon
                    x={50}
                    y={45}

                    onClick={handleStarClick}
                    className="pointer-events-auto animate-pulse"
                    style={{ filter: 'drop-shadow(0 0 8px gold)' }}
                  >
                    <Star width={100}
                      height={100} />
                  </PlaceholderIcon>
                )}
              </div>
            )}

            {/* Splash screen overlay */}
            {mode === 'splashscreen' && isLoaded && (
              <div
                className={`absolute inset-0 bottom-[100px] top-[20px] z-20 flex cursor-pointer flex-col items-center justify-between transition-opacity duration-1000 ease-in-out ${showSplash && !splashFadingOut ? 'opacity-100' : 'opacity-0'
                  }`}
                onClick={handleSplashClick}
              >
                {/* Logo */}
                <div className=" flex flex-col items-center justify-center text-[#B05A2A]">
                  <Image
                    src="/img/splash/logo.png"
                    alt="Ix Chel Et Kin Logo"
                    width={128}
                    height={128}
                    className="h-auto w-32 object-contain"
                  />
                  <div className=" text-[12px] font-bold">Le Mythe Maya de</div>
                  <p className="text-[14px]">La Lune et du Soleil</p>

                </div>

                {/* SunMoon Button */}
                <div className="flex flex-col items-center justify-center">
                  <div className="h-fit transition-all duration-300 hover:scale-110">
                    <SunMoon width={100} height={100} />
                  </div>
                  <p className="text-[14px] text-[#B05A2A]">Placer l’objet correspondant pour lancer l’expérience</p>
                </div>
              </div>
            )}

            <View className='absolute inset-0 size-full' panelId="center">
              <Suspense fallback={null}>
                <Central />
                <WebSocketStream panelId="center" fps={15} />
                <Common />
              </Suspense>
            </View>
          </div>

          {/* right */}
          <div className='right-panel relative aspect-[73/140] w-1/5 ' id="right-panel" data-panel="right">
            <View className='absolute inset-0 size-full' panelId="right">
              <Suspense fallback={null}>
                <RightPanel />
                <WebSocketStream panelId="right" fps={10} />
                <Common />
              </Suspense>
            </View>
          </div>
        </div>
      </div >
    </>
  )
}
