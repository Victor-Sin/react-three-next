'use client'

import { useThree } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import { placeObject, setMode, nextChapter } from '@/store/slices/centralSlice'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Scene } from './elements/scene'
import { Placeholder } from './elements/Placeholder'
import { gsap } from 'gsap'

export const Central = React.memo((props) => {
    const { viewport } = useThree()
    const dispatch = useDispatch()
    const { isStoryActive, placedObject, currentImage, lastImage, mode, allScenesCompleted, completedScenes } = useSelector(state => state.central)
    const [showPlaceholders, setShowPlaceholders] = useState(false)
    const initTime = useRef(Date.now())
    const placeholderRefs = useRef({
        sun: null,
        bridge: null,
        fire: null
    })
    const [refsReady, setRefsReady] = useState(false)
    const [showChapterTransition, setShowChapterTransition] = useState(false)
    const aspect = 3000 / 2000;
    const baseHeight = viewport.height;
    const baseWidth = baseHeight * aspect;
    const defaultScale = [baseWidth, baseHeight, 1];

    console.log('[Central] Component initialized at', Date.now() - initTime.current, 'ms')
    console.log('[Central] Completed scenes:', completedScenes, 'All completed:', allScenesCompleted)

    // Check if all visible refs are ready
    useEffect(() => {
        if (showPlaceholders && !showChapterTransition) {
            const visiblePlaceholders = ['sun', 'bridge', 'fire'].filter(
                scene => !completedScenes.includes(scene)
            )

            const allVisibleRefsReady = visiblePlaceholders.every(
                scene => placeholderRefs.current[scene]
            )

            if (allVisibleRefsReady && visiblePlaceholders.length > 0) {
                setRefsReady(true)
            }
        }
    }, [showPlaceholders, showChapterTransition, completedScenes])

    // Effect to show placeholders after map is visible
    useEffect(() => {
        if (!isStoryActive && mode === 'map') {
            // Reset placeholders when returning to map mode
            if (showPlaceholders) {
                setShowPlaceholders(false)
                setRefsReady(false)
            }

            // Wait for map transition to complete plus a small delay
            const timer = setTimeout(() => {
                console.log('[Central] Starting placeholder animations at', Date.now() - initTime.current, 'ms')
                setShowPlaceholders(true)
            }, 1500) // Reduced delay for faster response

            return () => clearTimeout(timer)
        } else if (mode === 'scene' && showPlaceholders) {
            // Hide placeholders immediately when entering scene mode
            setShowPlaceholders(false)
            setRefsReady(false)
        }
    }, [isStoryActive, mode])

    // Handle chapter progression when all scenes are completed
    useEffect(() => {
        if (allScenesCompleted && !showChapterTransition) {
            console.log('[Central] All scenes completed! Starting chapter transition...')
            setShowChapterTransition(true)
            setShowPlaceholders(false)
            setRefsReady(false)

            // Wait a moment then trigger next chapter
            setTimeout(() => {
                dispatch(nextChapter())
                setShowChapterTransition(false)
                console.log('[Central] Chapter transition completed')
            }, 3000) // 3 second transition
        }
    }, [allScenesCompleted, showChapterTransition, dispatch])

    // Effect to handle animations when refs are ready
    useEffect(() => {
        if (refsReady && !showChapterTransition) {
            console.log('[Central] Refs ready, starting animations at', Date.now() - initTime.current, 'ms')

            // Create a timeline for coordinated animations
            const tl = gsap.timeline()

            // Get visible placeholders
            const visiblePlaceholders = ['sun', 'bridge', 'fire'].filter(
                scene => !completedScenes.includes(scene)
            )

            // Add animations for each visible placeholder
            visiblePlaceholders.forEach((scene, index) => {
                const ref = placeholderRefs.current[scene]
                if (ref) {
                    const delay = index * 0.2
                    tl.to(ref.scale, {
                        x: 1,
                        y: 1,
                        z: 1,
                        duration: 0.8,
                        ease: "back.out(1.7)",
                        delay: delay
                    }, index === 0 ? 0.2 : "-=0.6")
                        .to(ref.material, {
                            opacity: 1,
                            duration: 0.8,
                            ease: "back.out(1.7)",
                            delay: delay
                        }, index === 0 ? 0.2 : "-=0.6")
                }
            })

            return () => {
                tl.kill()
            }
        }
    }, [refsReady, showChapterTransition, completedScenes])

    const handleSquareClick = useCallback((objectType) => (e) => {
        console.log('[Central] Square clicked at', Date.now() - initTime.current, 'ms')

        dispatch(placeObject(objectType))
        dispatch(setMode('scene'))

        // Note: No auto-return timer - the video will handle returning to map when it ends
    }, [dispatch])

    useEffect(() => {
        console.log('[Central] Component mounted at', Date.now() - initTime.current, 'ms')
        return () => {
            console.log('[Central] Component unmounted at', Date.now() - initTime.current, 'ms')
            // Kill any ongoing animations when component unmounts
            gsap.killTweensOf(placeholderRefs.current)
        }
    }, [])

    return (
        <group position={[0, 0, 0]}>
            <Scene
                scale={defaultScale}
                current={currentImage}
                last={lastImage}
                animationType={placedObject}
            />
            {showChapterTransition && (
                <mesh position={[0, 0, 1]}>
                    <planeGeometry args={[4, 2]} />
                    <meshBasicMaterial color="#000000" opacity={0.8} transparent />
                </mesh>
            )}
            {!isStoryActive && showPlaceholders && !showChapterTransition && (
                <>
                    {!completedScenes.includes('sun') && (
                        <Placeholder
                            ref={el => placeholderRefs.current.sun = el}
                            position={[-1, 0, 2]}
                            onClick={handleSquareClick('sun')}
                            color="#ff6b6b"
                            scale={0}
                            opacity={0}
                        />
                    )}
                    {!completedScenes.includes('bridge') && (
                        <Placeholder
                            ref={el => placeholderRefs.current.bridge = el}
                            position={[0, -1, 2]}
                            onClick={handleSquareClick('bridge')}
                            color="#ff6b6b"
                            scale={0}
                            opacity={0}
                        />
                    )}
                    {!completedScenes.includes('fire') && (
                        <Placeholder
                            ref={el => placeholderRefs.current.fire = el}
                            position={[1, 0, 2]}
                            onClick={handleSquareClick('fire')}
                            color="#ff6b6b"
                            scale={0}
                            opacity={0}
                        />
                    )}
                </>
            )}
        </group>
    )
})

Central.displayName = 'Central'
