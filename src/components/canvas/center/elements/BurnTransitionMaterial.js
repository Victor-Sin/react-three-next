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



/**
 * Matériau shader personnalisé pour créer des effets de transition de type "brûlure"
 * entre différentes textures (cartes et cinématiques)
 */
export const BurnTransitionMaterial = shaderMaterial(
  {
    // === TEXTURES ===
    uTextureMapA: new THREE.Texture(),      // Première texture de carte
    uTextureMapB: new THREE.Texture(),      // Deuxième texture de carte
    uTextureCinematic: new THREE.Texture(), // Texture cinématique pour les transitions
    uTextureNoise: new THREE.Texture(),     // Texture de bruit pour les effets aléatoires
    uTextureSplatting: new THREE.Texture(), // Texture de splatting pour les effets de peinture

    // === PARAMÈTRES DE CONTRÔLE ===
    uSide: false,                           // Booléen pour différencier les panneaux latéraux du central
    uTime: 0.0,                            // Temps écoulé pour les animations
    uProgressMap: 1.,                      // Progression de la transition entre cartes (0-1)
    uProgressCinematic: 0.0,               // Progression de la transition cinématique (0-1)
    uResolution: new THREE.Vector2(1, 1),  // Résolution de l'écran
    uEdge: 0.05,                           // Paramètre pour les bords de transition
  },
  
  // === VERTEX SHADER ===
  // Shader simple qui passe les coordonnées UV et transforme les positions
  `
    varying vec2 vUv;
    void main() {
      vUv = uv; // Transmet les coordonnées UV au fragment shader
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  // === FRAGMENT SHADER ===
  // Shader principal qui gère le mélange des textures et les effets visuels
  `
    // Déclaration des uniformes (variables globales)
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
    uniform bool uSide;

    /**
     * Calcule la progression de transition pour les cartes
     * avec un effet oscillant basé sur la distance au centre
     */
    float getDiffMap(vec2 uv) {
      float diff = distance(uv, vec2(0.5, 0.5)); // Distance au centre
      diff = abs(sin(uTime)*diff);                // Effet oscillant
      return uProgressMap;
    }

    /**
     * Calcule la progression de transition pour les cinématiques
     * avec un effet oscillant simple
     */
    float getDiffCinematic(vec2 uv) {
      float diff = abs(sin(uTime*2.)); // Oscillation double vitesse
      return uProgressCinematic;
    }

    /**
     * Fonction utilitaire pour faire une rotation 2D
     */
    vec2 rotate(vec2 v, float a) {
      float s = sin(a);
      float c = cos(a);
      mat2 m = mat2(c, s, -s, c);
      return m * v;
    }

    void main() {
      vec2 uv = vUv;
      vec2 uvCinematic = vUv;

      // === ÉCHANTILLONNAGE DES TEXTURES ===
      vec4 colorCinematic = texture2D(uTextureCinematic, uvCinematic);
      vec4 colorNoise = texture2D(uTextureNoise, uv);
      vec4 splatting = texture2D(uTextureSplatting, uv);
      
      vec2 uvMapA = uv;
      vec4 colorMapA = texture2D(uTextureMapA, uvMapA);
      vec4 colorMapB = texture2D(uTextureMapB, uvMapA);

      float bwA = ( colorMapA.r + colorMapA.g + colorMapA.b ) / 3.;
      float bwB = ( colorMapB.r + colorMapB.g + colorMapB.b ) / 3.;
      float bwCinematic = ( colorCinematic.r + colorCinematic.g + colorCinematic.b ) / 3.;

      // === MÉLANGE DES CARTES ===
      // Interpole entre les deux cartes selon la progression
      vec4 map = mix(colorMapA, colorMapB, getDiffMap(uv));

      // === CALCUL DE L'EFFET DE DÉFORMATION ===
      // Crée un effet de déformation parabolique basé sur les coordonnées UV
      vec2 tmp = vec2(vUv.x, (1.- vUv.y - .5) * pow(vUv.x,2.) * .5);
      float strength = colorNoise.g * tmp.y;

      // === MÉLANGE FINAL ===
      // Interpole entre la carte et la cinématique
      // vec4 final = mix(colorMapA, colorCinematic, uProgressCinematic * uv.x * bwA);
      vec4 final = vec4(0.,0.,0.,1.);
      if( uProgressCinematic < .5 ) {
        // on map le pourcentage de 0 a .5 > 0 a 1
        float percent = uProgressCinematic * 2.;
        float b = mix( 0., 1., step( percent, bwA ) );
        // float b = mix( 0., 1., smoothstep(percent - 0.05, percent + 0.05, bwA));
        final = colorMapA * b;
        // final = vec4( vec3( b ), 1.);
      } else {
       // On map le pourcentage de .5 a 1 > 0 a .5 > 0 a 1, et on l'inverse
        float percent = 1. - (uProgressCinematic - .5) * 2.;
        // float b = step(percent, bwCinematic);
        float b = mix(0.0, 1.0, step(percent, bwCinematic));
        // float b = mix(0.0, 1.0, smoothstep(percent - 0.05, percent + 0.05, bwCinematic));
        final = colorCinematic * b;
      }
      
      // === EFFET DE SPLATTING (uniquement pour le panneau central) ===
      if(!uSide) {
        float strengthSplatting = splatting.b * splatting.a * strength * 1.5;
        float strengthSplattingA = step(strengthSplatting, 0.65);
        float strengthSplattingB = step(strengthSplatting, 1.) - strengthSplattingA;

        final.rgb = final.rgb -  strengthSplatting * 10.;
        final.rgb = final.rgb +  strengthSplatting * vec3(0.561,0.451,0.255);
      }

      // gl_FragColor = vec4( vec3( bwA ), 1.);
      gl_FragColor = final;
      // gl_FragColor = vec4( sin( uv.x * 10. ), 0., 0., 1.);
    }
  `
)

// Étend les matériaux Three.js avec notre matériau personnalisé
extend({ BurnTransitionMaterial })

/**
 * Animation de transition d'entrée
 */
const handleTransitionAnimationIn = ({ materialRef, dispatch, currentTransition, setTransitionAction, isMap = true }) => {
  // Prevent triggering if already transitioning or completed
  if (currentTransition.isTransitioning || currentTransition.completed) return;
  
  dispatch(setTransitionAction({ 
    isTransitioning: true, 
    shouldTransition: false,
    completed: false,
    ...currentTransition 
  }))
  
  if (isMap) {
    GSAP.to(materialRef.current, {
      uProgressMap: 1,
      duration: 3,
      ease: 'ease.inOut',
      onComplete: () => {
        dispatch(setTransitionAction({ 
          isTransitioning: false, 
          shouldTransition: false,
          completed: true,
          ...currentTransition 
        }))
      }
    })
  } else {
    GSAP.to(materialRef.current, {
      uProgressCinematic: 1,
      duration: 3,
      ease: 'ease.inOut',
      onComplete: () => {
        dispatch(setTransitionAction({ 
          isTransitioning: false, 
          shouldTransition: false,
          completed: true,
          ...currentTransition 
        }))
      }
    })
  }
}

/**
 * Animation de transition de sortie
 */
const handleTransitionAnimationOut = ({ materialRef, dispatch, currentTransition, setTransitionAction, isMap = true }) => {
  // Prevent triggering if already transitioning
  if (currentTransition.isTransitioning) return;
  
  dispatch(setTransitionAction({ 
    isTransitioning: true, 
    shouldTransition: true,
    completed: false,
    ...currentTransition 
  }))
  
  if (isMap) {
    GSAP.to(materialRef.current, {
      uProgressMap: 0,
      duration: 1,
      ease: 'ease.inOut',
      onComplete: () => {
        dispatch(setTransitionAction({ 
          isTransitioning: false, 
          shouldTransition: false,
          completed: true,
          ...currentTransition 
        }))
      }
    })
  } else {
    GSAP.to(materialRef.current, {
      uProgressCinematic: 0,
      duration: 1,
      ease: 'ease.inOut',
      onComplete: () => {
        dispatch(setTransitionAction({ 
          isTransitioning: false, 
          shouldTransition: false,
          completed: true,
          ...currentTransition 
        }))
      }
    })
  }
}

/**
 * Composant React qui gère les transitions de brûlure entre textures
 * @param {string} tmp_name - Nom du composant (utilisé pour identifier les panneaux)
 * @param {THREE.Texture} uTextureMapA - Première texture de carte
 * @param {THREE.Texture} uTextureMapB - Deuxième texture de carte  
 * @param {THREE.Texture} uTextureCinematic - Texture cinématique
 */
export const BurnTransition = ({ tmp_name, uTextureMapA, uTextureMapB, uTextureCinematic }) => {

  // === REFS ET STATE ===
  const isLaunchedRef = useRef(false)  // Évite les déclenchements multiples
  const { gl } = useThree()            // Contexte WebGL de Three.js
  const materialRef = useRef(null)     // Référence au matériau shader
  const [name, setName] = useState(tmp_name)
  const dispatch = useDispatch();
  
  // === SÉLECTEURS REDUX ===
  // Récupère l'état des transitions depuis le store Redux
  const transition = useSelector(state => state.central.transitions);
  const sideTransition = useSelector(state => state.central.sideTransitions);
  const mode = useSelector(state => state.central.mode);
  
  // === CHARGEMENT DES TEXTURES ===
  const mapTexture = useTexture('/img/center/map/chapter_one/textureSplatting.png')
  
  // === STATE GPGPU ===
  const [gpgpu, setGPGPU] = useState(null)

  // === LOGIQUE DE DÉTERMINATION DU TYPE DE PANNEAU ===
  // Détermine si c'est un panneau latéral ou central
  const isSidePanel = tmp_name !== 'central'
  const currentTransition = isSidePanel ? sideTransition : transition
  const setTransitionAction = isSidePanel ? setSideTransition : setTransition

  // === EFFET PRINCIPAL ===
  useEffect(() => {
    const gpgpu = new GPGPU(gl)
    setGPGPU(gpgpu)

    if (isLaunchedRef.current) {
      // Only trigger animations if not already transitioning
      if (!currentTransition.isTransitioning) {
        if (currentTransition.shouldTransition && !currentTransition.completed) {
          handleTransitionAnimationOut({
            materialRef,
            dispatch,
            currentTransition,
            setTransitionAction,
            isMap: mode === 'map'
          })
        } else if (!currentTransition.completed) {
          handleTransitionAnimationIn({
            materialRef,
            dispatch,
            currentTransition,
            setTransitionAction,
            isMap: mode === 'map'
          })
        }
      }
    }
    isLaunchedRef.current = true

    // Cleanup function
    return () => {
      if (gpgpu) {
        gpgpu.dispose()
      }
    }
  }, [
    currentTransition.shouldTransition,
    currentTransition.completed,
    gl,
    mode,
    tmp_name,
    dispatch,
    setTransitionAction,
    uTextureCinematic
  ])

  // === BOUCLE DE RENDU ===
  // Met à jour le temps à chaque frame pour les animations shader
  useFrame(({ clock }) => {
    materialRef.current.uTime = clock.getElapsedTime()
  })

  // === RENDU DU COMPOSANT ===
  return (
    <burnTransitionMaterial 
      ref={materialRef} 
      uTextureSplatting={mapTexture}           // Texture de splatting
      uSide={isSidePanel}                      // Flag pour panneau latéral
      uTextureNoise={gpgpu && gpgpu.getTexture()} // Texture de bruit générée par GPGPU
      uTextureMapA={uTextureMapA}              // Première carte
      uTextureMapB={uTextureMapB}              // Deuxième carte
      uTextureCinematic={uTextureCinematic}    // Texture cinématique
      name={name}                              // Nom du matériau
    />
  )
}
