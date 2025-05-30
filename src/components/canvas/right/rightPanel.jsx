'use client'

import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { BurnTransition } from '../center/elements/BurnTransitionMaterial'
import { useTextures } from '@/contexts/Texturecontext'
import { setMeshLoaded } from '@/store/slices/centralSlice'
import { VideoTexture } from 'three'

export const RightPanel = (props) => {
    const rightPanelRef = useRef()
    const videoRef = useRef()
    const { viewport } = useThree()
    const { mode, meshLoading } = useSelector(state => state.central)
    const { textures, isLoaded, essentialLoaded } = useTextures()
    const dispatch = useDispatch()
    const [videoTexture, setVideoTexture] = useState(null)
    const initTime = useRef(Date.now())

    // Fixed values instead of Leva controls
    const scale = [3.99, 7.99, 1];

    // Get textures from context with memoization
    const { mapTexture, blackTexture } = useMemo(() => {
        console.log('[RightPanel] Initializing textures at', Date.now() - initTime.current, 'ms')
        const mapTexture = textures['/img/center/map/chapter_one/map_righta.png']
        const blackTexture = textures['/img/center/map/chapter_one/map_righta.png'] // Use same texture for both
        return { mapTexture, blackTexture }
    }, [textures])

    // Initialize video texture
    useEffect(() => {
        if (mode === 'scene' && !videoTexture) {
            console.log('[RightPanel] Initializing video texture')
            const video = document.createElement('video')
            video.src = '/img/emotions/moon_wtf.mp4'
            video.loop = true
            video.muted = true
            video.playsInline = true
            video.autoplay = true
            videoRef.current = video

            video.addEventListener('loadeddata', () => {
                console.log('[RightPanel] Video loaded')
                const texture = new VideoTexture(video)
                texture.minFilter = THREE.LinearFilter
                texture.magFilter = THREE.LinearFilter
                setVideoTexture(texture)
            })

            video.play().then(() => {
                console.log('[RightPanel] Video started playing')
            }).catch(error => {
                console.error('[RightPanel] Error playing video:', error)
            })
        }
    }, [mode, videoTexture])

    // Clean up video when returning to map mode
    useEffect(() => {
        if (mode === 'map' && videoRef.current) {
            console.log('[RightPanel] Cleaning up video - returning to map mode')
            videoRef.current.pause()
            videoRef.current.src = ''
            videoRef.current.load()
            // Don't immediately set to null, let the transition complete first
            setTimeout(() => {
                setVideoTexture(null)
            }, 100)
        }
    }, [mode])

    // Effect to handle mesh loading
    useEffect(() => {
        console.log('[RightPanel] Mesh loading effect triggered at', Date.now() - initTime.current, 'ms')
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

    // Show loading state for panel textures
    if (!isLoaded) {
        return (
            <group>
                <mesh scale={scale}>
                    <planeGeometry args={[0.57, 0.57]} />
                    <meshBasicMaterial color="#000000" opacity={0.5} transparent />
                </mesh>
            </group>
        )
    }

    return (
        <group>
            <mesh ref={rightPanelRef} scale={scale}>
                <planeGeometry args={[0.57, 0.57]} />
                <BurnTransition
                    tmp_name="right"
                    uTextureMapA={mapTexture}
                    uTextureMapB={blackTexture}
                    uTextureCinematic={videoTexture || mapTexture}
                />
            </mesh>
        </group>
    )
}