'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import * as THREE from 'three'

export default function Scene({ ...props }) {
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas {...props}
      onCreated={(state) => {
        // state.gl.outputColorSpace = THREE.SRGBColorSpace
        // state.gl.toneMapping = THREE.AgXToneMapping
        state.gl.outputEncoding = THREE.SRGBEncoding
      }}
    >
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}
