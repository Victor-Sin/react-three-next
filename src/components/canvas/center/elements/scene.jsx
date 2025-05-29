import * as THREE from 'three'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useTextures } from '@/contexts/TextureContext'
// import { BurnTransitionMaterial } from './BurnTransitionMaterial'
import { BurnTransition } from './BurnTransitionMaterial'


const texturePaths = [
    '/img/center/lake.png',
    '/img/center/map/chapter_one/map_centera.png',
    '/img/center/temple.png',
    '/img/center/mountain.png',
]

export const Scene = ({ images, current = 0, last = 1, animationType, onAnimationEnd, progressBar, useBurnTransition, scale = [1, 1, 1] }) => {
    const mesh = useRef(null)
    const { textures, isLoaded } = useTextures()
    const [currentTextureIndex, setCurrentTextureIndex] = useState(0)
    const { size } = useThree()


    return (
        <mesh scale={scale}>
            <planeGeometry args={[1, 1]} />
            <BurnTransition
                tmp_name="central"
                ref={mesh}
                uTextureMapA={textures[texturePaths[currentTextureIndex]]}
                uTextureMapB={textures[texturePaths[currentTextureIndex + 1]]}
                uTextureCinematic={textures[texturePaths[currentTextureIndex + 2]]}
            />
            {progressBar}
            <meshBasicMaterial color="#000000" opacity={0.5} transparent />
        </mesh>
    )
}