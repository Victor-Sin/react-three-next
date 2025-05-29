'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef, useState, useEffect } from 'react'
import { OrbitControls, PerspectiveCamera, View as ViewImpl, useProgress } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'
import { useSelector, useDispatch } from 'react-redux'
import { setMeshLoaded } from '@/store/slices/centralSlice'

const LoadingScreen = () => {
  const { progress } = useProgress()
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '200px',
        height: '4px',
        background: '#eee',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: '#1976d2',
          transition: 'width 0.3s ease-in-out'
        }} />
      </div>
      <div style={{ marginTop: '16px', color: '#666' }}>
        Loading... {Math.round(progress)}%
      </div>
    </div>
  )
}

export const Common = ({ color }) => (
  <Suspense fallback={<LoadingScreen />}>
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
