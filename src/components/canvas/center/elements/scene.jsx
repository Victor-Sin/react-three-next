import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useTextures } from '@/contexts/Texturecontext'
import { useSelector, useDispatch } from 'react-redux'
import { BurnTransition } from './BurnTransitionMaterial'
import { resetScene, setMode, completeScene, startTransition, completeTransition, nextChapter } from '@/store/slices/centralSlice'
import { VideoTexture } from 'three'
import { Placeholder } from './Placeholder'
import { useTexture } from '@react-three/drei'

// Map textures for the triptych
const mapTextures = {
    left: '/img/center/map/chapter_one/map_left.png',
    center: '/img/center/map/chapter_one/map_center.png',
    right: '/img/center/map/chapter_one/map_right.png',
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
    fire: '/img/scenes/star.mp4',
    chapter_transition: '/img/scenes/chapter_transition.mp4'
}

export const Scene = ({ scale = [1, 1, 1], children }) => {
    const mesh = useRef(null)
    const videoRef = useRef(null)
    const { textures, isLoaded } = useTextures()
    const [currentTextureIndex, setCurrentTextureIndex] = useState(0)
    const { mode, placedObject, allScenesCompleted, chapter } = useSelector(state => state.central)
    const dispatch = useDispatch()
    const [cinematicTexture, setCinematicTexture] = useState(null)

    // Initialize cinematic video when an object is placed
    useEffect(() => {
        if (mode === 'scene' && placedObject && cinematicVideos[placedObject] && !cinematicTexture) {
            const video = document.createElement('video')
            video.src = cinematicVideos[placedObject]
            video.loop = false
            video.muted = false
            video.playsInline = true
            video.autoplay = true
            videoRef.current = video

            video.addEventListener('loadeddata', () => {
                const texture = new VideoTexture(video)
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                setCinematicTexture(texture)
            })

            video.addEventListener('ended', () => {
                dispatch(startTransition())

                setTimeout(() => {
                    if (placedObject === 'star') {
                        dispatch(nextChapter())
                    } else {
                        dispatch(resetScene())
                        dispatch(setMode('map'))
                        dispatch(completeScene(placedObject))
                    }
                    dispatch(completeTransition())
                }, 1000)
            })

            video.play().then(() => {
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
            setTimeout(() => {
                setCinematicTexture(null)
            }, 1000)
        }
    }, [mode])

    // Get textures from context with memoization
    const { mapTexture, splashTexture } = useMemo(() => {
        let mapTexture
        if (chapter === 1) {
            mapTexture = textures['/img/center/map/chapter_two/map_center.png']
        } else {
            mapTexture = allScenesCompleted
                ? textures['/img/center/map/chapter_one_night/map_center.png']
                : textures['/img/center/map/chapter_one/map_center.png']
        }
        const splashTexture = textures['/img/splash/center.png']
        console.log('[Scene] mapTexture', mapTexture, chapter)
        return { mapTexture, splashTexture }
    }, [textures, allScenesCompleted, chapter])

    if (!isLoaded) return null

    return (
        <group>
            <mesh ref={mesh} position={[0, 0, 0]}>
                <planeGeometry args={[scale[0], scale[1]]} />
                <BurnTransition
                    tmp_name="central"
                    uTextureMapA={mode === 'splashscreen' ? splashTexture : mapTexture}
                    uTextureMapB={mapTexture}
                    uTextureCinematic={cinematicTexture}
                />
            </mesh>
            {children}
        </group>
    )
}