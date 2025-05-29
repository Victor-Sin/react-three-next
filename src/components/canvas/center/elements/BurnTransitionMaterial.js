import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useEffect, useRef } from 'react'
import { extend,useFrame } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import { setTransition, setSideTransition } from '@/store/slices/centralSlice'
import { gsap as GSAP } from 'gsap';

export const BurnTransitionMaterial = shaderMaterial(
  {
    uTextureMapA: new THREE.Texture(),
    uTextureMapB: new THREE.Texture(),
    uTextureCinematic: new THREE.Texture(), // Spash -> 

    uTime: 0.0,
    uProgressMap: 1.,
    uProgressCinematic: 0.0,
    uResolution: new THREE.Vector2(1, 1),
    uEdge: 0.05,
  },
  // vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // fragment shader
  `
    uniform sampler2D uTextureMapA;
    uniform sampler2D uTextureMapB;
    uniform sampler2D uTextureCinematic;
    uniform float uTime;
    uniform float uProgressMap;
    uniform float uProgressCinematic;
    uniform vec2 uResolution;
    uniform float uEdge;
    varying vec2 vUv;

    float getDiffMap(vec2 uv) { 
      float diff = distance(uv, vec2(0.5, 0.5));
      diff = abs(sin(uTime)*diff);
      return uProgressMap;
    }

    float getDiffCinematic(vec2 uv) { 
      float diff = abs(sin(uTime*2.));
      return uProgressCinematic;
    }


    void main() {
      vec2 uv = vUv;
      vec2 uvCinematic = vUv;

      vec4 colorMapA = texture2D(uTextureMapA, uv);
      vec4 colorMapB = texture2D(uTextureMapB, uv);
      vec4 colorCinematic = texture2D(uTextureCinematic, uvCinematic);

      vec4 map = mix(colorMapA, colorMapB, getDiffMap(uv));

      vec4 final = mix(map, colorCinematic, getDiffCinematic(uvCinematic));

      gl_FragColor = vec4(final.rgb, 1.0);
      
    }
  `
)

extend({ BurnTransitionMaterial }) 


export const BurnTransition = ({ tmp_name, uTextureMapA, uTextureMapB, uTextureCinematic}) => {

  const isLaunchedRef = useRef(false)
  const materialRef = useRef(null)
  const [name, setName] = useState(tmp_name)
  const dispatch = useDispatch();
  const transition = useSelector(state => state.central.transitions);
  const sideTransition = useSelector(state => state.central.sideTransitions);
  const mode = useSelector(state => state.central.mode);

  // Determine if this is a side panel or central panel
  const isSidePanel = tmp_name !== 'central'
  const currentTransition = isSidePanel ? sideTransition : transition
  const setTransitionAction = isSidePanel ? setSideTransition : setTransition

  useEffect(() => {
    if (isLaunchedRef.current) {
      console.log(`[${tmp_name}] BurnTransition effect triggered`, { 
        currentTransition, 
        mode, 
        uTextureCinematic: !!uTextureCinematic 
      })

      if (!currentTransition.isTransitioning) {
        transitionAnimationIn(mode === 'map')
      }
      if (currentTransition.shouldTransition) {
        transitionAnimationOut(mode === 'map')
      }
    }
    isLaunchedRef.current = true
  }, [currentTransition.shouldTransition, mode, tmp_name])

  function transitionAnimationIn(isMap = true) {
    dispatch(setTransitionAction({isTransitioning: true, ...currentTransition}))
    if (isMap) {
      GSAP.to(materialRef.current, {
        uProgressMap: 1,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({isTransitioning: false, shouldTransition: false, ...currentTransition}))
        }
      })
    } else {
      GSAP.to(materialRef.current, {
        uProgressCinematic: 1,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({isTransitioning: false, shouldTransition: false, ...currentTransition}))
        }
      })
    }
  }

  function transitionAnimationOut(isMap = true) {
    dispatch(setTransitionAction({isTransitioning: true, ...currentTransition}))
    if (isMap) {
      GSAP.to(materialRef.current, {
        uProgressMap: 0,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({isTransitioning: false, ...currentTransition}))
        }
      })
    } else {
      GSAP.to(materialRef.current, {
        uProgressCinematic: 0,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({isTransitioning: false, shouldTransition: false, ...currentTransition}))
        }
      })
    }
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
      <burnTransitionMaterial ref={materialRef} uTextureMapA={uTextureMapA} uTextureMapB={uTextureMapB} uTextureCinematic={uTextureCinematic} name={name} />
  )
}