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
  chapter: 0,
  mode: 'map',
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
      state.transition = 'fade'
      state.lastImage = state.currentImage
//      state.currentImage = imageIndexMap[action.payload] ?? 0
    },
    resetScene: (state) => {
      state.isStoryActive = false
      state.storySegment = null
      state.placedObject = null
      state.sunReaction = null
      state.moonReaction = null
      state.transition = null
      state.lastImage = 0
      state.currentImage = 0
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
  setTransition,
  setSideTransition,
  setReactions,
  resetProgress,
  nextChapter,
  setMode,
  setMeshLoaded
} = centralSlice.actions

export default centralSlice.reducer 