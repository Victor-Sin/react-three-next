'use client'

import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import { placeObject, resetScene, nextChapter, setMode } from '@/store/slices/centralSlice'
import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react'
import { Scene } from './elements/scene'
import { gsap } from 'gsap'

// Sample story data - replace with your actual data structure
const storyData = {
    sun: { /* story content for sun */ },
    bridge: { /* story content for bridge */ },
    fire: { /* story content for fire */ }
}

const objectList = ['sun', 'bridge', 'fire']

export const Central = React.memo((props) => {
    const { viewport, size } = useThree()
    const dispatch = useDispatch()
    const { isStoryActive, storySegment, placedObject, currentImage, lastImage, placedObjects, chapter } = useSelector(state => state.central)
    const allPlaced = useMemo(() => objectList.every(obj => placedObjects?.includes(obj)), [placedObjects])
    const [showTransition, setShowTransition] = React.useState(false)
    const [showPlaceholders, setShowPlaceholders] = useState(false)
    const initTime = useRef(Date.now())
    const autoReturnTimer = useRef(null)
    const placeholderRefs = useRef({
        sun: null,
        bridge: null,
        fire: null
    })
    const [refsReady, setRefsReady] = useState(false)
    const aspect = 3000 / 2000;
    const baseHeight = viewport.height;
    const baseWidth = baseHeight * aspect;
    const defaultScale = [baseWidth, baseHeight, 1];

    console.log('[Central] Component initialized at', Date.now() - initTime.current, 'ms')

    // Check if all refs are ready
    useEffect(() => {
        if (showPlaceholders &&
            placeholderRefs.current.sun &&
            placeholderRefs.current.bridge &&
            placeholderRefs.current.fire) {
            setRefsReady(true)
        }
    }, [showPlaceholders, placeholderRefs.current.sun, placeholderRefs.current.bridge, placeholderRefs.current.fire])

    // Effect to show placeholders after map is visible
    useEffect(() => {
        if (!isStoryActive && !showPlaceholders) {
            // Wait for map transition to complete (2.5s) plus a small delay
            const timer = setTimeout(() => {
                console.log('[Central] Starting placeholder animations at', Date.now() - initTime.current, 'ms')
                setShowPlaceholders(true)
            }, 3000) // 2.5s for map transition + 0.5s delay

            return () => clearTimeout(timer)
        }
    }, [isStoryActive, showPlaceholders])

    // Effect to handle animations when refs are ready
    useEffect(() => {
        if (refsReady) {
            console.log('[Central] Refs ready, starting animations at', Date.now() - initTime.current, 'ms')

            // Create a timeline for coordinated animations
            const tl = gsap.timeline()

            // Add animations to timeline with delays
            tl.to(placeholderRefs.current.sun.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                delay: 0.2
            })
                .to(placeholderRefs.current.sun.material, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.2
                })
                .to(placeholderRefs.current.bridge.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.2
                }, "-=0.6")
                .to(placeholderRefs.current.bridge.material, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.2
                }, "-=0.6")
                .to(placeholderRefs.current.fire.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.2
                }, "-=0.6")
                .to(placeholderRefs.current.fire.material, {
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.7)",
                    delay: 0.2
                }, "-=0.6")

            return () => {
                tl.kill()
            }
        }
    }, [refsReady])

    const handleSquareClick = useCallback((objectType) => (e) => {
        console.log('[Central] Square clicked at', Date.now() - initTime.current, 'ms')

        // Clear any existing auto-return timer
        if (autoReturnTimer.current) {
            clearTimeout(autoReturnTimer.current)
            autoReturnTimer.current = null
        }

        dispatch(placeObject(objectType))
        dispatch(setMode('scene'))

        // Auto return to map after 5 seconds
        autoReturnTimer.current = setTimeout(() => {
            console.log('[Central] Auto returning to map after 5 seconds')
            dispatch(resetScene())
            dispatch(setMode('map'))
            setShowPlaceholders(false)
            setRefsReady(false)
            autoReturnTimer.current = null
        }, 5000)
    }, [dispatch])

    const handleAnimationEnd = useCallback(() => {
        console.log('[Central] Animation ended at', Date.now() - initTime.current, 'ms')
        // Animate placeholders out
        if (refsReady) {
            const tl = gsap.timeline()
            tl.to([placeholderRefs.current.sun.scale, placeholderRefs.current.bridge.scale, placeholderRefs.current.fire.scale], {
                x: 0,
                y: 0,
                z: 0,
                duration: 1.5,
                ease: "ease.in"
            })
                .to([placeholderRefs.current.sun.material, placeholderRefs.current.bridge.material, placeholderRefs.current.fire.material], {
                    opacity: 0,
                    duration: 1.5,
                    ease: "ease.in",
                    onComplete: () => {
                        dispatch(resetScene())
                        dispatch(setMode('map'))
                        setShowPlaceholders(false)
                        setRefsReady(false)
                    }
                }, "-=1.5")
        }
    }, [dispatch, refsReady])

    const handleNextChapter = useCallback(() => {
        console.log('[Central] Starting next chapter transition at', Date.now() - initTime.current, 'ms')
        setShowTransition(true)
        // Use requestAnimationFrame for smoother transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                dispatch(nextChapter())
                setShowTransition(false)
                console.log('[Central] Next chapter transition completed at', Date.now() - initTime.current, 'ms')
            }, 2000)
        })
    }, [dispatch])

    const currentStory = useMemo(() => {
        console.log('[Central] Story data updated at', Date.now() - initTime.current, 'ms')
        return placedObject ? storyData[placedObject] : null
    }, [placedObject])

    const buttonStyle = useMemo(() => ({
        padding: '8px 24px',
        borderRadius: 20,
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        fontWeight: 'bold',
        fontSize: 16,
        cursor: 'pointer',
        boxShadow: '0 2px 8px #1976d288',
        transition: 'all 0.2s ease-in-out',
        ':hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px #1976d2aa'
        }
    }), [])

    useEffect(() => {
        console.log('[Central] Component mounted at', Date.now() - initTime.current, 'ms')
        return () => {
            console.log('[Central] Component unmounted at', Date.now() - initTime.current, 'ms')
            // Kill any ongoing animations when component unmounts
            gsap.killTweensOf(placeholderRefs.current)
            // Clear auto-return timer
            if (autoReturnTimer.current) {
                clearTimeout(autoReturnTimer.current)
                autoReturnTimer.current = null
            }
        }
    }, [])

    return (
        <group position={[0, 0, 0]}>
            <Scene
                scale={defaultScale}
                current={currentImage}
                last={lastImage}
                animationType={placedObject}
                onAnimationEnd={isStoryActive ? handleAnimationEnd : undefined}
            />
        </group>
    )
})

Central.displayName = 'Central'
