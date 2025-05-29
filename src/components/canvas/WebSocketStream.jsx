'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useWebSocketCanvas } from '@/hooks/useWebSocketCanvas'

export const WebSocketStream = ({ panelId, fps = 15 }) => {
    const { sendFrame } = useWebSocketCanvas(panelId, fps)
    const frameCount = useRef(0)
    const lastFpsLog = useRef(Date.now())
    const isActive = useRef(true) // Flag to track if streaming is active

    // Log FPS every 2 seconds for debugging
    useEffect(() => {
        // console.log(`❗ WebSocketStream initialized for ${panelId} at ${fps} FPS`)

        const interval = setInterval(() => {
            const now = Date.now()
            const elapsed = (now - lastFpsLog.current) / 1000
            if (elapsed > 0) {
                // console.log(`⚡ ${panelId} Stream: ${Math.round(frameCount.current / elapsed)} FPS`)
                frameCount.current = 0
                lastFpsLog.current = now
            }
        }, 2000)

        // Immediately send a test frame
        setTimeout(() => {
            // console.log(`⚡ Sending initial test frame for ${panelId}...`)
            try {
                sendFrame()
            } catch (error) {
                // console.error(`❌ Error sending initial test frame for ${panelId}:`, error)
            }
        }, 1000)

        // Mark the parent element with attributes to help with identification
        try {
            // First try to find the container by traversing up from a canvas element
            setTimeout(() => {
                const canvases = document.querySelectorAll('canvas');
                canvases.forEach(canvas => {
                    // Try to find the closest parent that matches the expected panel structure
                    let parent = canvas.parentElement;
                    while (parent && !parent.classList.contains('w-1/5') && !parent.classList.contains('w-3/5')) {
                        parent = parent.parentElement;
                    }

                    // If we found a potential panel container
                    if (parent) {
                        // Check if this looks like our panel based on width class
                        const isLeftOrRight = parent.classList.contains('w-1/5');
                        const isCenter = parent.classList.contains('w-3/5');

                        if ((panelId === 'left' && isLeftOrRight && parent.classList.contains('bg-blue-300')) ||
                            (panelId === 'center' && isCenter) ||
                            (panelId === 'right' && isLeftOrRight && parent.classList.contains('bg-red-300'))) {

                            // Mark this element for easier identification
                            parent.setAttribute('data-panel', panelId);
                            parent.classList.add(`${panelId}-panel`);
                            // console.log(`Found and marked ${panelId} panel:`, parent);
                        }
                    }
                });
            }, 200); // Small delay to ensure the DOM is ready
        } catch (error) {
            // console.error(`Error identifying panel elements:`, error);
        }

        return () => {
            // console.log(`🛑 WebSocketStream for ${panelId} being cleaned up`)
            clearInterval(interval)
            isActive.current = false
        }
    }, [panelId, fps, sendFrame])

    // Send frames during the render loop
    useFrame(() => {
        if (!isActive.current) return

        try {
            sendFrame()
            frameCount.current++
        } catch (error) {
            // console.error(`❌ Error in WebSocketStream for ${panelId}:`, error)
        }
    })

    return null
} 