'use client'

import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BurnTransition } from '../center/elements/BurnTransitionMaterial'
import { useTextures } from '@/contexts/Texturecontext'
import { setMeshLoaded } from '@/store/slices/centralSlice'
import { VideoTexture } from 'three'
import { useTexture } from '@react-three/drei'

export const RightPanel = (props) => {
    const rightPanelRef = useRef()
    const videoRef = useRef()
    const { viewport } = useThree()
    const { mode, meshLoading, placedObject, allScenesCompleted, chapter } = useSelector(state => state.central)
    const { textures, isLoaded, essentialLoaded } = useTextures()
    const dispatch = useDispatch()
    const [videoTexture, setVideoTexture] = useState(null)
    const initTime = useRef(Date.now())

    // Fixed values instead of Leva controls
    const scale = [3.99, 7.99, 1];

    // Get textures from context with memoization
    const { mapTexture, blackTexture } = useMemo(() => {
        let mapTexture
        if (chapter === 1) {
            mapTexture = textures['/img/center/map/chapter_two/map_right.png']
        } else {
            mapTexture = allScenesCompleted
                ? textures['/img/center/map/chapter_one_night/map_right.png']
                : textures['/img/center/map/chapter_one/map_right.png']
        }
        const blackTexture = mode === 'splashscreen' ?
            textures['/img/splash/right.png'] : // Use splash texture in splashscreen mode
            chapter === 1
                ? textures['/img/center/map/chapter_two/map_right.png']
                : allScenesCompleted
                    ? textures['/img/center/map/chapter_one_night/map_right.png']
                    : textures['/img/center/map/chapter_one/map_right.png']
        return { mapTexture, blackTexture }
    }, [textures, mode, allScenesCompleted, chapter])


    // Mappa dei video per il pannello destro
    const videoMap = {
        sun: '/img/emotions/sun_right.mp4',
        lightning: '/img/emotions/lightning_right.mp4',
        boat: '/img/emotions/boat_right.mp4',
        star: '/img/emotions/star_right.mp4',
        fire: '/img/emotions/star_right.mp4',
    }

    // Initialize video texture
    useEffect(() => {
        if (mode === 'scene' && !videoTexture) {
            const video = document.createElement('video')
            const selectedVideo = videoMap[placedObject] || videoMap['sun']
            video.src = selectedVideo
            video.loop = true
            video.muted = true
            video.playsInline = true
            video.autoplay = false
            videoRef.current = video

            video.addEventListener('loadeddata', () => {
                const texture = new VideoTexture(video)
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                setVideoTexture(texture)

                setTimeout(() => {
                    video.play().then(() => {
                        video.addEventListener('ended', () => {
                            video.pause()
                        }, { once: true })
                    }).catch(error => {
                        console.error('[RightPanel] Error playing video:', error)
                    })
                }, 7000)
            })
        }
    }, [mode, videoTexture, placedObject])

    // Clean up video when returning to map mode
    useEffect(() => {
        if (mode === 'map' && videoRef.current) {
            console.log('[RightPanel] Cleaning up video - returning to map mode')
            videoRef.current.pause()
            videoRef.current.src = ''
            videoRef.current.load()
            setTimeout(() => {
                setVideoTexture(null)
            }, 1000)
        }
    }, [mode])

    // Effect to handle mesh loading
    useEffect(() => {
        if (rightPanelRef.current) {
            dispatch(setMeshLoaded({ panel: 'right', isLoaded: true }))
        }
        return () => {
            dispatch(setMeshLoaded({ panel: 'right', isLoaded: false }))
        }
    }, [dispatch])

    useFrame((state, delta) => {
        if (videoTexture) {
            videoTexture.needsUpdate = true
        }
    })

    // Don't render until essential textures are loaded and mesh is ready
    if (!essentialLoaded || !meshLoading.right) return null



    return (
        <group>
            <mesh ref={rightPanelRef} scale={scale}>
                <planeGeometry args={[0.57, 0.57]} />
                <BurnTransition
                    tmp_name="right"
                    uTextureMapA={mode === 'splashscreen' ? blackTexture : mapTexture}
                    uTextureMapB={blackTexture}
                    uTextureCinematic={videoTexture}
                />
            </mesh>
        </group>
    )
}