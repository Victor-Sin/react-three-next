'use client'

import { useRef, useState, useCallback, memo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Placeholder = memo(forwardRef(({ position = [0, 0, 0], onClick, color = '#ff0000', scale = 1, opacity = 1, texture = null, size = [0.3, 0.3] }, ref) => {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(false)
    const [clicked, setClicked] = useState(false)

    // Memoize event handlers
    const handleClick = useCallback((e) => {
        e.stopPropagation()
        setClicked(prev => !prev)
        onClick?.(e)
    }, [onClick])

    const handlePointerOver = useCallback((e) => {
        e.stopPropagation()
        setHovered(true)
    }, [])

    const handlePointerOut = useCallback((e) => {
        e.stopPropagation()
        setHovered(false)
    }, [])

    // Optimize animation with useFrame
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime()
            const hoverScale = 1 + Math.sin(time * 2) * 0.1
            meshRef.current.scale.set(scale * hoverScale, scale * hoverScale, scale * hoverScale)
        }
    })

    return (
        <mesh
            ref={ref}
            position={position}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            <planeGeometry args={[size[0], size[1], 32, 32]} />
            <meshStandardMaterial
                color={texture ? undefined : (hovered ? '#ff4444' : color)}
                map={texture || undefined}
                metalness={0.5}
                roughness={0.2}
                transparent
                opacity={hovered ? opacity * 0.9 : opacity}
            />
        </mesh>
    )
}))

Placeholder.displayName = 'Placeholder'

export { Placeholder } 