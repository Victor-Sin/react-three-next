import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useTextures } from '@/contexts/Texturecontext'
import { useSelector } from 'react-redux'
// import { BurnTransitionMaterial } from './BurnTransitionMaterial'
import { BurnTransition } from './BurnTransitionMaterial'


const texturePaths = [
    '/img/center/lake.png',
    '/img/center/temple.png',
    '/img/center/map/chapter_one/map_centera.png',
    '/img/center/mountain.png',
]

export const Scene = ({ images, current = 0, last = 1, animationType, onAnimationEnd, progressBar, useBurnTransition, scale = [1, 1, 1] }) => {
    const mesh = useRef(null)
    const { textures, isLoaded } = useTextures()
    const [currentTextureIndex, setCurrentTextureIndex] = useState(1) // Start with map texture (index 1)
    const { size } = useThree()
    const { mode } = useSelector(state => state.central)

    if (!isLoaded) return null

    return (
        <mesh ref={mesh} scale={scale}>
            <planeGeometry args={[1, 1]} />
            <BurnTransition
                tmp_name="central"
                uTextureMapA={textures[texturePaths[currentTextureIndex]]}
                uTextureMapB={textures[texturePaths[currentTextureIndex + 1]]}
                uTextureCinematic={textures[texturePaths[currentTextureIndex + 2]]}
            />
            {progressBar}
        </mesh>
    )
}