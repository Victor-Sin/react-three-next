import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useState, useEffect, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useDispatch, useSelector } from 'react-redux'
import { setTransition, setSideTransition } from '@/store/slices/centralSlice'
import { gsap as GSAP } from 'gsap';
import { useTexture } from '@react-three/drei'
import GPGPU from '@/hooks/gpgpu'
import img from '../../../../../public/img/center/map/chapter_one/map_lefta.png'

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
    uTextureNoise: new THREE.Texture(),
    uTextureSplatting: new THREE.Texture(),
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
    uniform sampler2D uTextureNoise;
    uniform sampler2D uTextureSplatting;

    float getDiffMap(vec2 uv) {
      float diff = distance(uv, vec2(0.5, 0.5));
      diff = abs(sin(uTime)*diff);
      return uProgressMap;
    }

    float getDiffCinematic(vec2 uv) {
      float diff = abs(sin(uTime*2.));
      return uProgressCinematic;
    }

    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, s, -s, c);
      return m * v;
    }


    void main() {
      vec2 uv = vUv;
      vec2 uvCinematic = vUv;


      vec4 colorCinematic = texture2D(uTextureCinematic, uvCinematic);
      vec4 colorNoise = texture2D(uTextureNoise, uv);
      vec4 splatting = texture2D(uTextureSplatting, uv);
      vec2 uvMapA = uv;

      if(splatting.r == 0. && splatting.g == 1. && splatting.a >0.) {
       uvMapA.xy += sin(uTime)*0.05*colorNoise.r;
      }

      vec4 colorMapA = texture2D(uTextureMapA, uvMapA);
      vec4 colorMapB = texture2D(uTextureMapB, uvMapA);
      vec4 map = mix(colorMapA, colorMapB, getDiffMap(uv));

      vec2 tmp = vec2(vUv.x, (1.- vUv.y - .5) * pow(vUv.x,2.) * .5);
      float strength = colorNoise.g * tmp.y ;



      vec4 final = mix(map, colorCinematic, getDiffCinematic(uvCinematic));
      float strengthSplatting = splatting.b * splatting.a * strength * 50.;
      float strengthSplattingA = step(strengthSplatting, 0.65);
      float strengthSplattingB = step(strengthSplatting, 1.) - strengthSplattingA;

      final.rgb = final.rgb -  strengthSplattingB + strengthSplattingB * vec3(0.569,0.412,0.192);

      gl_FragColor = final;
      

    }
  `
)

extend({ BurnTransitionMaterial })


export const BurnTransition = ({ tmp_name, uTextureMapA, uTextureMapB, uTextureCinematic }) => {

  const isLaunchedRef = useRef(false)
  const { gl } = useThree()
  const materialRef = useRef(null)
  const [name, setName] = useState(tmp_name)
  const dispatch = useDispatch();
  const transition = useSelector(state => state.central.transitions);
  const sideTransition = useSelector(state => state.central.sideTransitions);
  const mode = useSelector(state => state.central.mode);
  console.log(img, 'img')
  const mapTexture = useTexture('/img/center/map/chapter_one/textureSplatting.png')
  console.log(mapTexture, 'mapTexture')
  const [gpgpu, setGPGPU] = useState(null)




  // Determine if this is a side panel or central panel
  const isSidePanel = tmp_name !== 'central'
  const currentTransition = isSidePanel ? sideTransition : transition
  const setTransitionAction = isSidePanel ? setSideTransition : setTransition

  useEffect(() => {
    const gpgpu = new GPGPU(gl)
    setGPGPU(gpgpu)


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
    dispatch(setTransitionAction({ isTransitioning: true, ...currentTransition }))
    if (isMap) {
      GSAP.to(materialRef.current, {
        uProgressMap: 1,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({ isTransitioning: false, shouldTransition: false, ...currentTransition }))
        }
      })
    } else {
      GSAP.to(materialRef.current, {
        uProgressCinematic: 1,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({ isTransitioning: false, shouldTransition: false, ...currentTransition }))
        }
      })
    }
  }

  function transitionAnimationOut(isMap = true) {
    dispatch(setTransitionAction({ isTransitioning: true, ...currentTransition }))
    if (isMap) {
      GSAP.to(materialRef.current, {
        uProgressMap: 0,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({ isTransitioning: false, ...currentTransition }))
        }
      })
    } else {
      GSAP.to(materialRef.current, {
        uProgressCinematic: 0,
        duration: 1,
        ease: 'ease.inOut',
        onComplete: () => {
          dispatch(setTransitionAction({ isTransitioning: false, shouldTransition: false, ...currentTransition }))
        }
      })
    }
  }

  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  return (
    <burnTransitionMaterial ref={materialRef} uTextureSplatting={mapTexture} uTextureNoise={gpgpu && gpgpu.getTexture()} uTextureMapA={uTextureMapA} uTextureMapB={uTextureMapB} uTextureCinematic={uTextureCinematic} name={name} />
  )
}