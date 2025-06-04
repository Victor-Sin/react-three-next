'use client'
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import * as THREE from 'three'

const TextureContext = createContext({})

export const useTextures = () => useContext(TextureContext)

// Priority groups for textures
const PRIORITY_GROUPS = {
    ESSENTIAL: 0, // Splash screen and basic UI
    CENTER_PANEL: 1, // Center panel textures (highest priority for panels)
    PANELS: 2,    // Left and right panel textures
    SCENE: 3      // Additional scene textures
}

export const TextureProvider = ({ children }) => {
    const [textures, setTextures] = useState({})
    const [isLoaded, setIsLoaded] = useState(false)
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [error, setError] = useState(null)
    const [essentialLoaded, setEssentialLoaded] = useState(false)
    const texturesRef = useRef(textures)

    // Update ref when textures change
    useEffect(() => {
        texturesRef.current = textures
    }, [textures])

    const cleanup = useCallback(() => {
        Object.values(texturesRef.current).forEach(texture => {
            if (texture instanceof THREE.Texture) {
                texture.dispose()
            }
        })
        setTextures({})
        setIsLoaded(false)
        setLoadingProgress(0)
        setEssentialLoaded(false)
    }, [])

    const loadTextureGroup = async (loader, texturePaths, priority) => {
        let loadedCount = 0
        const totalTextures = texturePaths.length

        const loadTexture = (path) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace
                        texture.anisotropy = 4
                        texture.minFilter = THREE.LinearFilter
                        texture.magFilter = THREE.LinearFilter
                        loadedCount++
                        setLoadingProgress((loadedCount / totalTextures) * 100)
                        resolve({ path, texture })
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture ${path}:`, error)
                        reject(error)
                    }
                )
            })
        }

        const results = await Promise.all(texturePaths.map(path => loadTexture(path)))
        const newTextures = {}
        results.forEach(({ path, texture }) => {
            newTextures[path] = texture
        })

        setTextures(prev => ({ ...prev, ...newTextures }))

        if (priority === PRIORITY_GROUPS.ESSENTIAL) {
            setEssentialLoaded(true)
        }
    }

    useEffect(() => {
        const loader = new THREE.TextureLoader()

        // Essential textures (no splash screen)
        const essentialTextures = [
            '/img/center/black.png'
        ]

        // Center panel textures (highest priority)
        const centerPanelTextures = [
            '/img/splash/left.png',
            '/img/splash/right.png',
            '/img/splash/center.png',
            '/img/center/map/chapter_one/map_centera.png',
            '/img/center/map/chapter_one/map_lefta.png',
            '/img/center/map/chapter_one/map_righta.png',
        ]

        // Other panel textures
        const panelTextures = [
            '/img/tryptique/moon/moon.png',
            '/img/tryptique/moon/moon_1.png',
            '/img/tryptique/moon/moon_2.png',
            '/img/tryptique/moon/moon_3.png',
            '/img/tryptique/sun/sun.png',
            '/img/tryptique/sun/sun_1.png',
            '/img/tryptique/sun/sun_2.png',
            '/img/tryptique/sun/sun_3.png'
        ]

        // Additional scene textures
        const sceneTextures = [
            '/img/center/lake.png',
            '/img/center/temple.png',
            '/img/center/mountain.png'
        ]

        const loadAllTextures = async () => {
            try {
                // Load essential textures first
                await loadTextureGroup(loader, essentialTextures, PRIORITY_GROUPS.ESSENTIAL)

                // Then load center panel textures
                await loadTextureGroup(loader, centerPanelTextures, PRIORITY_GROUPS.CENTER_PANEL)

                // Then load other panel textures
                await loadTextureGroup(loader, panelTextures, PRIORITY_GROUPS.PANELS)

                // Finally load additional scene textures
                await loadTextureGroup(loader, sceneTextures, PRIORITY_GROUPS.SCENE)

                setIsLoaded(true)
                setError(null)
            } catch (err) {
                setError(err)
                console.error('Error loading textures:', err)
            }
        }

        loadAllTextures()

        return () => {
            cleanup()
        }
    }, [cleanup])

    const value = {
        textures,
        isLoaded,
        essentialLoaded,
        loadingProgress,
        error,
        reload: () => {
            cleanup()
            setTextures({})
        }
    }

    return (
        <TextureContext.Provider value={value}>
            {children}
        </TextureContext.Provider>
    )
} 