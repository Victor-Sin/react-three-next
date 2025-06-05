import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useTextures } from '@/contexts/TextureContext'

const DEFAULT_FALLBACK = '/img/center/black.png'

export const useTextureLoader = (texturePath, options = {}) => {
    const { textures, isLoaded, error: contextError } = useTextures()
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [texture, setTexture] = useState(null)

    const {
        fallback = DEFAULT_FALLBACK,
        anisotropy = 4,
        colorSpace = THREE.SRGBColorSpace,
        onLoad,
        onError
    } = options

    const loadTexture = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            // First try to get from context
            if (isLoaded && textures[texturePath]) {
                setTexture(textures[texturePath])
                onLoad?.(textures[texturePath])
                return
            }

            // If not in context, load directly
            const loader = new THREE.TextureLoader()
            const loadedTexture = await new Promise((resolve, reject) => {
                loader.load(
                    texturePath,
                    (texture) => {
                        texture.outputColorSpace = colorSpace
                        texture.anisotropy = anisotropy
                        resolve(texture)
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading texture ${texturePath}:`, error)
                        reject(error)
                    }
                )
            })

            setTexture(loadedTexture)
            onLoad?.(loadedTexture)
        } catch (err) {
            console.error(`Failed to load texture ${texturePath}:`, err)
            setError(err)

            // Try to load fallback
            if (fallback && fallback !== texturePath) {
                try {
                    const fallbackTexture = await new Promise((resolve, reject) => {
                        loader.load(
                            fallback,
                            (texture) => {
                                texture.outputColorSpace = colorSpace
                                texture.anisotropy = anisotropy
                                resolve(texture)
                            },
                            undefined,
                            (error) => reject(error)
                        )
                    })
                    setTexture(fallbackTexture)
                    onLoad?.(fallbackTexture)
                } catch (fallbackErr) {
                    console.error('Failed to load fallback texture:', fallbackErr)
                    onError?.(fallbackErr)
                }
            } else {
                onError?.(err)
            }
        } finally {
            setIsLoading(false)
        }
    }, [texturePath, fallback, isLoaded, textures, colorSpace, anisotropy, onLoad, onError])

    useEffect(() => {
        loadTexture()

        return () => {
            if (texture && !textures[texturePath]) {
                texture.dispose()
            }
        }
    }, [loadTexture, texture, texturePath, textures])

    return {
        texture,
        isLoading,
        error: error || contextError
    }
} 