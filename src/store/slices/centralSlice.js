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
  mode: 'map',
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
      state.mode = 'scene'
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
      const requiredScenes = ['sun', 'bridge', 'fire']
      const allCompleted = requiredScenes.every(scene => 
        state.completedScenes.includes(scene)
      )
      
      if (allCompleted && !state.allScenesCompleted) {
        state.allScenesCompleted = true
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
    },
    setMode: (state, action) => {
      state.mode = action.payload
    },
    setMeshLoaded: (state, action) => {
      const { panel, isLoaded } = action.payload
      if (panel in state.meshLoading) {
        state.meshLoading[panel] = isLoaded
      }
    }
  }
})

export const {
  placeObject,
  resetScene,
  completeScene,
  setTransition,
  setSideTransition,
  setReactions,
  resetProgress,
  nextChapter,
  setMode,
  setMeshLoaded
} = centralSlice.actions

export default centralSlice.reducer 