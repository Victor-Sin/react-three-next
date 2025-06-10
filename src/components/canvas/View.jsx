'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera, View as ViewImpl, useProgress } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useSelector, useDispatch } from 'react-redux'
import { setMeshLoaded } from '@/store/slices/centralSlice'

const LoadingScreen = () => {
  const { progress } = useProgress()
  return (
    <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white">
      <div className="mb-6 animate-pulse">
        <svg width="80" height="84" viewBox="0 0 304 322" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M161.869 140.919C164.634 140.862 167.097 141.599 169.123 143.457L169.357 143.678L169.563 143.884C170.175 144.519 170.707 145.252 171.248 146.062L171.213 146.074L172.28 147.703C172.705 148.353 173.076 149.07 173.433 149.833L173.787 150.611L173.79 150.616C174.444 152.069 174.289 153.591 173.657 155.275L173.525 155.614C172.15 158.987 169.791 161.565 166.703 163.478L166.076 163.852L166.074 163.853C162.574 165.865 158.873 167.082 154.91 167.088L154.526 167.085H154.523C150.839 167.026 147.628 165.669 144.833 163.286L144.28 162.797L144.277 162.794L144.156 162.677C144.012 162.531 143.874 162.365 143.733 162.176L143.89 162.188L143.387 160.175L142.975 158.541C142.437 156.518 142.91 154.61 143.961 152.539L143.962 152.54C144.054 152.361 144.155 152.194 144.302 151.941C144.402 151.77 144.519 151.563 144.63 151.334L144.738 151.098L144.74 151.091C145.293 149.774 146.286 148.904 147.715 148.239L148.007 148.109L148.012 148.107C149.551 147.44 150.717 146.812 152.04 146.275L152.618 146.052L152.62 146.051C154.785 145.247 156.951 145.214 159.11 145.953L159.541 146.111L159.545 146.112C160.449 146.462 161.035 147.206 161.568 148.365L161.793 148.888C162.503 150.634 162.682 152.274 162.126 153.862L162.005 154.18C161.311 155.857 159.919 156.967 158.058 157.963C157.11 158.458 156.165 158.729 155.179 158.703L154.98 158.694C153.715 158.601 153.172 158.346 152.884 157.838L152.83 157.732C152.458 156.937 152.607 156.099 153.354 155.102C153.589 154.79 153.97 154.478 154.44 154.194L154.446 154.19L154.452 154.187C154.546 154.128 154.609 154.113 154.638 154.109C154.665 154.106 154.687 154.109 154.709 154.116C154.752 154.131 154.906 154.206 155.061 154.501L156.615 157.456L157.792 154.332C158.409 152.696 157.374 151.262 156.011 150.737L155.734 150.645L155.723 150.642L155.324 150.546C154.4 150.357 153.514 150.415 152.675 150.708C151.742 151.034 150.96 151.619 150.292 152.294C148.073 154.528 147.508 158.479 149.535 161.132V161.133C150.801 162.801 152.606 163.538 154.353 163.819L154.701 163.87C158.263 164.329 161.33 163.09 163.89 160.991L163.889 160.99C165.668 159.534 167.62 157.623 168.095 154.729L168.136 154.445C168.49 151.678 168.014 149.04 166.99 146.565L166.778 146.072C165.728 143.716 164.162 142.115 162.235 141.103C162.114 141.039 161.992 140.978 161.869 140.919Z" fill="#1976d2" stroke="#1976d2" strokeWidth="3" />
          <path d="M153.664 47.457C152.238 59.0156 146.65 91.6623 119.707 120.692C88.8455 153.942 50.6456 160.156 39.9102 161.524C50.8658 162.057 67.0732 163.993 85.3675 170.763C96.0449 174.717 115.522 181.916 129.329 196.385C159.437 227.918 156.771 271.973 156.771 271.973C156.771 271.973 160.585 232.904 190.322 201.184C219.803 169.732 255.418 163.077 266.003 161.5C253.981 159.854 223.641 154.046 196.107 129.329C161.315 98.085 155.009 58.2156 153.664 47.457Z" stroke="#1976d2" strokeWidth="3" strokeMiterlimit="10" />
          <path d="M153.258 2.0116C151.322 18.4161 143.832 64.7198 107.998 105.957C66.9572 153.188 16.2482 162.104 2 164.086C16.538 164.805 38.032 167.506 62.2852 177.059C76.4522 182.635 102.259 192.791 120.553 213.265C160.411 257.887 156.747 320.387 156.747 320.387C156.747 320.387 161.918 264.983 201.463 219.908C240.671 175.227 287.949 165.686 302 163.414C286.048 161.107 245.807 152.956 209.346 117.979C163.263 73.7742 155.008 17.2452 153.258 2V2.0116Z" stroke="#1976d2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mb-4 h-1 w-48 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-gray-600">
        Loading... {Math.round(progress)}%
      </div>
    </div>
  )
}

export const Common = ({ color }) => (
  <Suspense fallback={null}>
    {color && <color attach='background' args={[color]} />}
    <ambientLight intensity={1} />
    {/* <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
    <pointLight position={[-10, -10, -10]} color='blue' decay={0.2} /> */}
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
  </Suspense>
)

const View = forwardRef(({ children, orbit, panelId, ...props }, ref) => {
  const localRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const dispatch = useDispatch()
  useImperativeHandle(ref, () => localRef.current)

  // Effect to handle mesh loading
  useEffect(() => {
    const handleMeshLoad = () => {
      if (localRef.current) {
        try {
          dispatch(setMeshLoaded({ panel: panelId, isLoaded: true }))
        } catch (error) {
          console.error('Error dispatching setMeshLoaded:', error)
        }
      }
    }

    // Aggiungi un piccolo delay per assicurarsi che il mesh sia effettivamente caricato
    const loadTimer = setTimeout(handleMeshLoad, 100)

    return () => {
      clearTimeout(loadTimer)
      try {
        dispatch(setMeshLoaded({ panel: panelId, isLoaded: false }))
      } catch (error) {
        console.error('Error dispatching setMeshLoaded cleanup:', error)
      }
    }
  }, [dispatch, panelId])

  useEffect(() => {
    // Simulate minimum loading time to prevent flickering
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div ref={localRef} {...props} style={{ position: 'relative', ...props.style }}>
        {isLoading && <LoadingScreen />}
        <Three>
          <ViewImpl track={localRef}>
            {/* Apply panel-specific background for debugging */}
            {/* {panelId === 'left' && <color attach='background' args={['#000000']} />}
            {panelId === 'center' && <color attach='background' args={['#000000']} />}
            {panelId === 'right' && <color attach='background' args={['#000000']} />} */}

            {children}
            {orbit && <OrbitControls />}
          </ViewImpl>
        </Three>
      </div>
    </>
  )
})
View.displayName = 'View'

export { View }
