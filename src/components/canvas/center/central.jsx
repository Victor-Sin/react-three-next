'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import { placeObject, setMode, nextChapter } from '@/store/slices/centralSlice'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { Scene } from './elements/scene'
import { Posable } from './elements/posable'
import { Placeholder } from './elements/Placeholder'
import { gsap } from 'gsap'
import GPGPU from '@/hooks/gpgpu'
import { useTextures } from '@/contexts/Texturecontext'


export const Central = React.memo((props) => {
    const { viewport, gl } = useThree()
    const dispatch = useDispatch()
    const { isStoryActive, placedObject, currentImage, lastImage, mode, allScenesCompleted, completedScenes } = useSelector(state => state.central)
    const [showPlaceholders, setShowPlaceholders] = useState(false)
    const initTime = useRef(Date.now())
    const placeholderRefs = useRef({
        sun: null,
        lightning: null,
        boat: null,
        star: null
    })
    const [refsReady, setRefsReady] = useState(false)
    const [showChapterTransition, setShowChapterTransition] = useState(false)
    const [gpgpu, setGPGPU] = useState(null)
    const gpgpuRef = useRef(null)
    const { textures, isLoaded } = useTextures()

    const aspect = 3000 / 2000;
    const baseHeight = viewport.height;
    const baseWidth = baseHeight * aspect;
    const defaultScale = [baseWidth, baseHeight, 1];


    // Initialize GPGPU when renderer is available
    useEffect(() => {
        if (gl && !gpgpuRef.current) {
            try {
                const gpgpuInstance = new GPGPU(gl)
                gpgpuRef.current = gpgpuInstance
                setGPGPU(gpgpuInstance)
                console.log('GPGPU instance created successfully')
            } catch (error) {
                console.error('Failed to create GPGPU instance:', error)
            }
        }

        return () => {
            if (gpgpuRef.current) {
                gpgpuRef.current.dispose()
                gpgpuRef.current = null
                setGPGPU(null)
            }
        }
    }, [gl])

    // Check if all visible refs are ready
    useEffect(() => {
        if (showPlaceholders && !showChapterTransition) {
            const visiblePlaceholders = ['sun', 'lightning', 'boat'].filter(
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
            console.log('[Central] All scenes completed! Showing final star placeholder...')
            setShowPlaceholders(true)
            setRefsReady(true)
        }
    }, [allScenesCompleted, showChapterTransition, dispatch])

    // Effect to handle animations when refs are ready
    useEffect(() => {
        if (refsReady && !showChapterTransition) {
            console.log('[Central] Refs ready, starting animations at', Date.now() - initTime.current, 'ms')

            const tl = gsap.timeline()

            // Get visible placeholders including star if all scenes completed
            const visiblePlaceholders = allScenesCompleted
                ? ['star']
                : ['sun', 'lightning', 'boat'].filter(scene => !completedScenes.includes(scene))

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
    }, [refsReady, showChapterTransition, completedScenes, allScenesCompleted])

    const handleSquareClick = useCallback((objectType) => (e) => {

        dispatch(placeObject(objectType))
        dispatch(setMode('scene'))

        // Note: No auto-return timer - the video will handle returning to map when it ends
    }, [dispatch])

    const handleStarClick = useCallback(() => {
        // Use the same pattern as other placeholders
        dispatch(placeObject('star')) // Add 'star' as a new type of placeable object
        dispatch(setMode('scene'))

        // The video texture will handle the transition and chapter progression
        // through its own completion callback, just like other scenes
    }, [dispatch])

    useEffect(() => {
        return () => {
            // Kill any ongoing animations when component unmounts
            gsap.killTweensOf(placeholderRefs.current)
        }
    }, [])

    useFrame((state, delta) => {
        if (gpgpu && gpgpu.isInitialized) {
            gpgpu.render(delta)

        }
    });

    return (
        <group position={[0, 0, 0]}>
            <Scene
                scale={defaultScale}
                current={currentImage}
                last={lastImage}
                animationType={placedObject}
            >

                {/* <Posable
                    scale={defaultScale}
                /> */}
            </Scene>
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
                            position={[.8, .58, 2]}
                            onClick={handleSquareClick('sun')}
                            texture={textures['/img/object/sun.png']}
                            scale={0}
                            opacity={0}
                            size={[.2, .2]}
                        />
                    )}
                    {!completedScenes.includes('lightning') && (
                        <Placeholder
                            ref={el => placeholderRefs.current.lightning = el}
                            position={[-.2, .5, 2]}
                            onClick={handleSquareClick('lightning')}
                            texture={textures['/img/object/lightning.png']}
                            scale={0}
                            opacity={0}
                            size={[.2, .3]}
                        />
                    )}
                    {!completedScenes.includes('boat') && (
                        <Placeholder
                            ref={el => placeholderRefs.current.boat = el}
                            position={[1, -.8, 2]}
                            onClick={handleSquareClick('boat')}
                            texture={textures['/img/object/boat.png']}
                            scale={0}
                            opacity={0}
                            size={[.3, .3]}
                        />
                    )}
                    {allScenesCompleted && (
                        <Placeholder
                            ref={el => placeholderRefs.current.star = el}
                            position={[0, 0, 2]}
                            onClick={handleSquareClick('star')} // Use the same handler pattern
                            texture={textures['/img/object/star.png']}
                            color="#ffd700"
                            scale={0}
                            opacity={0}
                            size={[.5, .5]}
                        />
                    )}
                </>
            )}


        </group>
    )
})

Central.displayName = 'Central'
