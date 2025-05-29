'use client'
import { extend } from '@react-three/fiber'
import { useRef } from 'react'


// extend({ TryptiqueMaterial, BurnTransitionMaterial })

export const LeftPanel = (props) => {
    const leftPanelRef = useRef()


    return (
        <group>
            <mesh ref={leftPanelRef}>
                <planeGeometry args={[0.57, 0.57]} />
                <meshBasicMaterial color="#000000" opacity={0.5} transparent />
            </mesh>
        </group>
    )
}