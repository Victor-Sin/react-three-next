'use client'

import { configureStore } from '@reduxjs/toolkit'
import centralReducer from './slices/centralSlice'

export const store = configureStore({
  reducer: {
    central: centralReducer,
    // Add other slices here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}) 