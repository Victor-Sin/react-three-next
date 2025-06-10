'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import React, { useEffect, useState, useRef } from 'react'
import { Scene } from './elements/scene'
import { Posable } from './elements/posable'
import GPGPU from '@/hooks/gpgpu'
import { useTextures } from '@/contexts/Texturecontext'

export const Central = React.memo((props) => {
    const { viewport, gl } = useThree()
    const dispatch = useDispatch()
    const { isStoryActive, placedObject, currentImage, lastImage, mode, allScenesCompleted, completedScenes, chapter } = useSelector(state => state.central)
    const initTime = useRef(Date.now())
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
                <Posable
                    scale={defaultScale}
                />
            </Scene>
        </group>
    )
})

Central.displayName = 'Central'
