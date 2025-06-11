'use client'

import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { resetAudioFlags } from '@/store/slices/centralSlice'

export default function AudioManager() {
    const dispatch = useDispatch()
    const {
        shouldPlaySplash,
        shouldPlayGood,
        shouldPlayTuto,
        ambientPlaying,
        playGood2
    } = useSelector(state => state.central.audio)

    // Refs pour les éléments audio
    const splashAudioRef = useRef(null)
    const goodAudioRef = useRef(null)
    const good2AudioRef = useRef(null)
    const tutoAudioRef = useRef(null)
    const ambientAudioRef = useRef(null)

    // Effet pour jouer splash.mp3
    useEffect(() => {
        if (shouldPlaySplash && splashAudioRef.current) {
            splashAudioRef.current.currentTime = 0
            splashAudioRef.current.volume = 0.7
            splashAudioRef.current.play().catch(console.error)
            dispatch(resetAudioFlags())
        }
    }, [shouldPlaySplash, dispatch])

    // Effet pour jouer good.mp3 ou good2.mp3
    useEffect(() => {
        if (shouldPlayGood) {
            const audioRef = playGood2 ? good2AudioRef.current : goodAudioRef.current
            if (audioRef) {
                audioRef.currentTime = 0
                audioRef.volume = 0.6
                audioRef.play().catch(console.error)
                dispatch(resetAudioFlags())
            }
        }
    }, [shouldPlayGood, playGood2, dispatch])

    // Effet pour jouer tuto.mp3
    useEffect(() => {
        if (shouldPlayTuto && tutoAudioRef.current) {
            tutoAudioRef.current.currentTime = 0
            tutoAudioRef.current.volume = 0.8
            tutoAudioRef.current.play().catch(console.error)
            dispatch(resetAudioFlags())
        }
    }, [shouldPlayTuto, dispatch])

    // Effet pour gérer l'ambient sound
    useEffect(() => {
        if (ambientAudioRef.current) {
            ambientAudioRef.current.volume = 0.3 // Volume plus faible pour l'ambient

            if (ambientPlaying) {
                // Si l'audio est déjà en cours de lecture, on ne fait rien
                if (ambientAudioRef.current.paused) {
                    // Sinon on le démarre
                    ambientAudioRef.current.play().catch(error => {
                        console.error('Error playing ambient sound:', error)
                    })
                }
            } else {
                // Si on doit arrêter l'audio
                if (!ambientAudioRef.current.paused) {
                    ambientAudioRef.current.pause()
                }
            }
        }
    }, [ambientPlaying])

    return (
        <>
            <audio
                ref={splashAudioRef}
                preload="auto"
            >
                <source src="/sound/splash.mp3" type="audio/mpeg" />
            </audio>

            <audio
                ref={goodAudioRef}
                preload="auto"
            >
                <source src="/sound/good.mp3" type="audio/mpeg" />
            </audio>

            <audio
                ref={good2AudioRef}
                preload="auto"
            >
                <source src="/sound/good2.mp3" type="audio/mpeg" />
            </audio>

            <audio
                ref={tutoAudioRef}
                preload="auto"
            >
                <source src="/sound/tuto.mp3" type="audio/mpeg" />
            </audio>

            <audio
                ref={ambientAudioRef}
                preload="auto"
                loop
            >
                <source src="/sound/ambient.mp3" type="audio/mpeg" />
            </audio>
        </>
    )
} 