import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useTextures } from '@/contexts/Texturecontext'
import { useSelector, useDispatch } from 'react-redux'
import { BurnTransition } from './BurnTransitionMaterial'
import { resetScene, setMode, completeScene, setTransition } from '@/store/slices/centralSlice'
import { VideoTexture } from 'three'
import { Placeholder } from './Placeholder'
import { useTexture } from '@react-three/drei'

// Map textures for the triptych
const mapTextures = {
    left: '/img/center/map/chapter_one/map_lefta.png',
    center: '/img/center/map/chapter_one/map_centera.png',
    right: '/img/center/map/chapter_one/map_righta.png',
    splash: '/img/splash/center.png'
}

// Other scene textures
const sceneTextures = [
    '/img/center/lake.png',
    '/img/center/temple.png',
    '/img/center/mountain.png',
]

// Video paths for cinematics
const cinematicVideos = {
    sun: '/img/scenes/sun.mp4',
    lightning: '/img/scenes/lightning.mp4',
    boat: '/img/scenes/boat.mp4',
    star: '/img/scenes/star.mp4',
    chapter_transition: '/img/scenes/chapter_transition.mp4'
}

export const Scene = ({ scale = [1, 1, 1], children }) => {
    const mesh = useRef(null)
    const videoRef = useRef(null)
    const { textures, isLoaded } = useTextures()
    const [currentTextureIndex, setCurrentTextureIndex] = useState(0)
    const { mode, placedObject } = useSelector(state => state.central)
    const dispatch = useDispatch()
    const [cinematicTexture, setCinematicTexture] = useState(null)

    const texture = useTexture('/img/center/map/chapter_one/map_centera.png')
    // Handle click in splashscreen mode
    const handleSplashClick = () => {
        if (mode === 'splashscreen') {
            // First start the transition
            dispatch(setTransition({
                isTransitioning: true,
                shouldTransition: true,
                name: "central",
                type: 'burn'
            }))

            // Then change mode after a short delay to allow transition to start
            setTimeout(() => {
                dispatch(setMode('map'))
                // Reset transition state after mode change
                setTimeout(() => {
                    dispatch(setTransition({
                        isTransitioning: false,
                        shouldTransition: false,
                        name: "central",
                        type: 'burn'
                    }))
                }, 1000) // After transition completes
            }, 100)
        }
    }

    // Initialize cinematic video when an object is placed
    useEffect(() => {
        if (mode === 'scene' && placedObject && cinematicVideos[placedObject] && !cinematicTexture) {
            console.log(`[Scene] Loading cinematic video for ${placedObject}`)

            const video = document.createElement('video')
            video.src = cinematicVideos[placedObject]
            video.loop = false // Don't loop, we want it to end
            video.muted = false // Allow audio for cinematics
            video.playsInline = true
            video.autoplay = true
            videoRef.current = video

            video.addEventListener('loadeddata', () => {
                console.log(`[Scene] Cinematic video loaded for ${placedObject}`)
                const texture = new VideoTexture(video)
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                setCinematicTexture(texture)
            })

            video.addEventListener('ended', () => {
                console.log(`[Scene] Cinematic video ended for ${placedObject}`)
                // Return to map when video ends
                dispatch(resetScene())
                dispatch(setMode('map'))
                dispatch(completeScene(placedObject))
                setCinematicTexture(null)
            })

            video.play().then(() => {
                console.log(`[Scene] Cinematic video started playing for ${placedObject}`)
            }).catch(error => {
                console.error(`[Scene] Error playing cinematic video for ${placedObject}:`, error)
            })
        }
    }, [mode, placedObject, cinematicTexture, dispatch])

    // Cleanup video when component unmounts or mode changes
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.src = ''
                videoRef.current.load()
            }
        }
    }, [])

    // Clean up video when returning to map mode
    useEffect(() => {
        if (mode === 'map' && videoRef.current) {
            videoRef.current.pause()
            videoRef.current.src = ''
            videoRef.current.load()
            setCinematicTexture(null)
        }
    }, [mode])

    // Select textures based on current mode
    const { textureA, textureB, fallbackTexture } = useMemo(() => {
        console.log(mode, "MODE")
        if (mode === 'splashscreen') {
            return {
                textureA: textures[mapTextures.splash],
                textureB: textures[mapTextures.splash],
                fallbackTexture: textures[mapTextures.splash]
            }
        } else if (mode === 'map') {
            return {
                textureA: textures[mapTextures.center],
                textureB: textures[mapTextures.center],
                fallbackTexture: textures[mapTextures.center]
            }
        } else {
            return {
                textureA: textures[sceneTextures[currentTextureIndex]] || textures[sceneTextures[0]],
                textureB: textures[mapTextures.splash],
                fallbackTexture: textures[mapTextures.splash]
            }
        }
    }, [mode, textures, currentTextureIndex, mapTextures, sceneTextures])

    if (!isLoaded) return null

    return (
        <group>
            <mesh ref={mesh} position={[0, 0, 0]}>
                <planeGeometry args={[scale[0], scale[1]]} />
                <BurnTransition
                    tmp_name="central"
                    uTextureMapA={texture}
                    uTextureMapB={texture}
                    uTextureCinematic={cinematicTexture || fallbackTexture}
                />
            </mesh>
            {mode === 'splashscreen' && (
                <Placeholder
                    position={[0, 0, 0.001]}
                    onClick={handleSplashClick}
                    texture={textures['/img/object/sunmoon.png']}
                    scale={1}
                    opacity={1}
                    size={[1, 1]}
                />
            )}
            {children}
        </group>
    )
}