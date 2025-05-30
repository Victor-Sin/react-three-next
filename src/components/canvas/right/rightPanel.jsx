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
    const { viewport, size } = useThree()
    const { storySegment, isStoryActive, mode, meshLoading } = useSelector(state => state.central)
    const { textures, isLoaded, essentialLoaded } = useTextures()
    const dispatch = useDispatch()
    const [videoTexture, setVideoTexture] = useState(null)
    const [isVideoReady, setIsVideoReady] = useState(false)
    const initTime = useRef(Date.now())

    // Use a fixed aspect ratio for the right panel (1040/2000)
    const aspect = 1040 / 2000;
    const baseHeight = viewport.height;
    const baseWidth = baseHeight * aspect;
    const defaultScale = [baseWidth, baseHeight, 1];

    // Fixed values instead of Leva controls
    const scale = [3.99, 7.99, 1];

    // Get textures from context with memoization
    const { mapTexture, blackTexture } = useMemo(() => {
        console.log('[RightPanel] Initializing textures at', Date.now() - initTime.current, 'ms')
        const mapTexture = textures['/img/center/map/chapter_one/map_righta.png']
        const blackTexture = textures['/img/center/map/chapter_one/map_righta.png']
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
                setIsVideoReady(true)
            })

            video.play().then(() => {
                console.log('[RightPanel] Video started playing')
            }).catch(error => {
                console.error('[RightPanel] Error playing video:', error)
            })
        }
    }, [mode, videoTexture])

    // Cleanup video
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.src = ''
                videoRef.current.load()
            }
        }
    }, [])

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
                    uTextureCinematic={videoTexture}
                />
            </mesh>
        </group>
    )
}