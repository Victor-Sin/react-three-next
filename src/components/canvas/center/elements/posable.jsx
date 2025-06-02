import * as THREE from 'three'
import { useRef, useEffect, useState } from 'react'



export const Posable = ({ scale = [1, 1, 1] }) => {
    const mesh = useRef(null)
    const [cinematicTexture, setCinematicTexture] = useState(null)
    const scaleNew = [scale[0] * 1000 / 1500, scale[1] * 600 / 1000]
    const positionbase = [-scale[0] / 2 + scaleNew[0] / 2, -scale[1] / 2 + scaleNew[1] / 2, 0.0001]
    const position = [positionbase[0] + scale[0] * 267 / 1487, positionbase[1] + scale[1] * 139 / 989, 0.0001]


    return (
        <group>
            <mesh ref={mesh} position={position}>
                < planeGeometry args={scaleNew} />
                <meshBasicMaterial color="blue" opacity={0.5} transparent />
            </mesh>
        </group >

    )
}