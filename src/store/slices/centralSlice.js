'use client'

import { createSlice } from '@reduxjs/toolkit'
// import { imageIndexMap } from '../storyData'

const initialState = {
  isStoryActive: false,
  storySegment: null,
  placedObject: null,
  currentImage: 0,
  lastImage: 0,
  placedObjects: [],
  completedScenes: [],
  chapter: 0,
  mode: 'splashscreen',
  allScenesCompleted: false,
  transitions: {
    isTransitioning: false,
    shouldTransition: false,
    name: "central",
    type: 'burn'
  },
  sideTransitions: {
    isTransitioning: false,
    shouldTransition: false,
    name: "side",
    type: 'burn'
  },
  sunReaction: null,
  moonReaction: null,
  meshLoading: {
    left: false,
    center: false,
    right: false
  },
  audio: {
    shouldPlaySplash: false,
    shouldPlayGood: false,
    shouldPlayTuto: false,
    ambientPlaying: false,
    hasPlayedAmbientOnce: false,
    playGood2: false
  }
}

const centralSlice = createSlice({
  name: 'central',
  initialState,
  reducers: {
    placeObject: (state, action) => {
      state.placedObject = action.payload
      state.placedObjects = [...state.placedObjects, action.payload]
      state.isStoryActive = true
      state.storySegment = `${action.payload}_story`
      state.sunReaction = 'neutral'
      state.moonReaction = 'neutral'
      state.lastImage = state.currentImage
//      state.currentImage = imageIndexMap[action.payload] ?? 0
    },
    resetScene: (state) => {
      state.isStoryActive = false
      state.storySegment = null
      state.placedObject = null
      state.sunReaction = null
      state.moonReaction = null
      state.lastImage = 0
      state.currentImage = 0
      state.mode = 'map'
    },
    completeScene: (state, action) => {
      const sceneType = action.payload
      if (!state.completedScenes.includes(sceneType)) {
        state.completedScenes.push(sceneType)
      }
      
      // Check if all three scenes are completed
      const requiredScenes = ['sun', 'lightning', 'boat']
      const allCompleted = requiredScenes.every(scene => 
        state.completedScenes.includes(scene)
      )
      
      if (allCompleted && !state.allScenesCompleted) {
        state.allScenesCompleted = true
      }
    },
    startTransition: (state) => {
      // Set transition state for all panels
      state.transitions = {
        isTransitioning: true,
        shouldTransition: true,
        name: "central",
        type: 'burn'
      }
      state.sideTransitions = {
        isTransitioning: true,
        shouldTransition: true,
        name: "side",
        type: 'burn'
      }
    },
    completeTransition: (state) => {
      // Reset transition state for all panels
      state.transitions = {
        isTransitioning: false,
        shouldTransition: false,
        name: "central",
        type: 'burn'
      }
      state.sideTransitions = {
        isTransitioning: false,
        shouldTransition: false,
        name: "side",
        type: 'burn'
      }
    },
    setTransition: (state, action) => {
      state.transitions = {
        ...state.transitions,
        ...action.payload
      }
    },
    setSideTransition: (state, action) => {
      state.sideTransitions = {
        ...state.sideTransitions,
        ...action.payload
      }
    },
    setReactions: (state, action) => {
      const { sun, moon } = action.payload
      if (sun) state.sunReaction = sun
      if (moon) state.moonReaction = moon
    },
    resetProgress: (state) => {
      state.placedObjects = []
    },
    nextChapter: (state) => {
      state.chapter += 1
      state.placedObjects = []
      state.completedScenes = []
      state.allScenesCompleted = false
      state.currentImage = 0
      state.lastImage = 0
      state.mode = 'map'
      state.isStoryActive = false
      state.storySegment = null
      state.placedObject = null
      state.sunReaction = null
      state.moonReaction = null
    },
    setMode: (state, action) => {
      const previousMode = state.mode
      state.mode = action.payload
      
      // Gestion audio basée sur les changements de mode
      if (action.payload === 'map') {
        // Jouer tuto.mp3 chaque fois qu'on va en mode map
        state.audio.shouldPlayTuto = true
        
        // Gérer l'ambient sound
        if (!state.audio.hasPlayedAmbientOnce) {
          // Première fois en mode map - démarrer l'ambient
          state.audio.ambientPlaying = true
          state.audio.hasPlayedAmbientOnce = true
        } else if (previousMode === 'scene') {
          // Retour du mode scene vers map - reprendre l'ambient
          state.audio.ambientPlaying = true
        }
      } else if (action.payload === 'scene' && previousMode === 'map') {
        // Passage de map vers scene - pauser l'ambient
        state.audio.ambientPlaying = false
      }
    },
    setMeshLoaded: (state, action) => {
      const { panel, isLoaded } = action.payload
      if (panel in state.meshLoading) {
        state.meshLoading[panel] = isLoaded
      }
    },
    playSplashSound: (state) => {
      state.audio.shouldPlaySplash = true
    },
    playGoodSound: (state) => {
      state.audio.shouldPlayGood = true
      state.audio.playGood2 = !state.audio.playGood2
    },
    playTutoSound: (state) => {
      state.audio.shouldPlayTuto = true
    },
    playAmbientSound: (state) => {
      state.audio.ambientPlaying = true
      state.audio.hasPlayedAmbientOnce = true
    },
    pauseAmbientSound: (state) => {
      state.audio.ambientPlaying = false
    },
    resetAudioFlags: (state) => {
      state.audio.shouldPlaySplash = false
      state.audio.shouldPlayGood = false
      state.audio.shouldPlayTuto = false
    }
  }
})

export const {
  placeObject,
  resetScene,
  completeScene,
  startTransition,
  completeTransition,
  setTransition,
  setSideTransition,
  setReactions,
  resetProgress,
  nextChapter,
  setMode,
  setMeshLoaded,
  playSplashSound,
  playGoodSound,
  playTutoSound,
  playAmbientSound,
  pauseAmbientSound,
  resetAudioFlags
} = centralSlice.actions

export default centralSlice.reducer 