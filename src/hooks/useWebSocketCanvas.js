import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook to capture and send canvas frames over WebSocket
 * @param {string} panelId - Identifier for this panel (left, center, right)
 * @param {number} fps - Target frames per second for sending updates
 */
export const useWebSocketCanvas = (panelId, fps = 30) => {
  const socket = useRef(null);
  const lastSent = useRef(0);
  const interval = 1000 / fps;
  const { gl, size, camera, scene } = useThree();
  const connected = useRef(false);
  const domRef = useRef(null); // Reference to the panel's DOM element
  const renderTarget = useRef(null);
  
  // Create a render target for capturing this panel's content
  useEffect(() => {
    if (!gl) return;
    
    // console.log(`Creating high-quality render target for ${panelId}`);
    
    // Use higher resolution for better quality
    const targetWidth = 1024; // Increased from 512
    const targetHeight = Math.round(targetWidth / (size.width / size.height));
    
    // Create a render target with appropriate settings
    renderTarget.current = new THREE.WebGLRenderTarget(targetWidth, targetHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      colorSpace: THREE.SRGBColorSpace,
      depthBuffer: true,
      stencilBuffer: false,
      anisotropy: 4 // Better texture quality
    });
    
    // console.log(`Created render target: ${targetWidth}x${targetHeight} for ${panelId}`);
    
    return () => {
      if (renderTarget.current) {
        renderTarget.current.dispose();
      }
    };
  }, [gl, size, panelId]);
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      // Create WebSocket connection
      socket.current = new WebSocket('ws://localhost:8080');
      
      socket.current.onopen = () => {
        // console.log(`WebSocket connected for ${panelId}`);
        connected.current = true;
        
        // Send panel info to help receiver set up proper dimensions
        socket.current.send(JSON.stringify({
          type: 'panelInfo',
          panelId,
          width: size.width,
          height: size.height,
          aspectRatio: size.width / size.height
        }));
      };
      
      socket.current.onclose = () => {
        // console.log(`WebSocket disconnected for ${panelId}`);
        connected.current = false;
      };
      
      socket.current.onerror = (error) => {
        // console.error(`WebSocket error for ${panelId}:`, error);
        connected.current = false;
      };
    } catch (error) {
      // console.error(`Error setting up WebSocket for ${panelId}:`, error);
    }
    
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [panelId, size]);
  
  // Find the DOM element for this panel
  useEffect(() => {
    // Find the associated DOM element based on panelId
    if (typeof window !== 'undefined') {
      // Wait a moment for React to render
      setTimeout(() => {
        // Try to find the panel element
        const findElement = () => {
          // Different strategies to find the panel
          const candidates = [
            document.querySelector(`#${panelId}-panel`),
            document.querySelector(`[data-panel="${panelId}"]`),
            document.querySelector(`.${panelId}-panel`)
          ];
          
          // Return the first non-null candidate
          return candidates.find(el => el !== null);
        };
        
        domRef.current = findElement();
        // console.log(`Panel ${panelId} DOM element:`, domRef.current);
      }, 500);
    }
  }, [panelId]);
  
  // Function to capture and send the current canvas frame
  const sendFrame = () => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      // console.log(`WebSocket not ready for ${panelId}`);
      return;
    }
    if (!connected.current) return;
    if (!gl || !gl.domElement || !renderTarget.current) return;
    if (!camera || !scene) return;
    
    const now = performance.now();
    if (now - lastSent.current < interval) return;
    lastSent.current = now;
    
    try {
      // Get original renderer state
      const originalRenderTarget = gl.getRenderTarget();
      const originalClearAlpha = gl.getClearAlpha();
      
      // Set up for rendering to our target
      gl.setRenderTarget(renderTarget.current);
      gl.setClearAlpha(1.0);
      gl.setClearColor(new THREE.Color('#000000'));
      gl.clear(true, true, true);
      
      // Render the scene to our target with higher quality settings
      gl.render(scene, camera);
      
      // Read pixels from the render target
      const width = renderTarget.current.width;
      const height = renderTarget.current.height;
      const buffer = new Uint8Array(width * height * 4);
      gl.readRenderTargetPixels(renderTarget.current, 0, 0, width, height, buffer);
      
      // Create a temporary canvas to convert the pixel data to an image
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d', { alpha: true });
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Put the pixels onto the canvas
      const imageData = tempContext.createImageData(width, height);
      const data = imageData.data;
      
      // Copy pixels from buffer to ImageData, ensuring proper color handling
      for (let i = 0; i < buffer.length; i += 4) {
        // Applica gamma correction per compensare la conversione da sRGB a linear
        // Questo dovrebbe correggere la luminosità delle immagini
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];
        
        data[i] = r;     // R
        data[i + 1] = g; // G
        data[i + 2] = b; // B
        data[i + 3] = a; // A
      }
      
      tempContext.putImageData(imageData, 0, 0);
      
      // Add panel identifiers
      if (panelId === 'left') {
        tempContext.fillStyle = "#FF0000"; // Red for left
      } else if (panelId === 'center') {
        tempContext.fillStyle = "#00FF00"; // Green for center
      } else {
        tempContext.fillStyle = "#0000FF"; // Blue for right
      }
      tempContext.fillRect(10, 10, 40, 40);
      
      // Draw panel ID text
      tempContext.fillStyle = "#FFFFFF";
      tempContext.font = "20px Arial";
      tempContext.fillText(panelId, 60, 30);
      
      // Convert to base64 and send with higher quality
      const imageData64 = tempCanvas.toDataURL('image/jpeg', 0.95); // Increased quality from 0.9 to 0.95
      
      // Restore original renderer state
      gl.setRenderTarget(originalRenderTarget);
      gl.setClearAlpha(originalClearAlpha);
      
      // Verify the data looks valid
      if (!imageData64 || !imageData64.startsWith('data:image')) {
        // console.error('Generated invalid image data');
        return;
      }
      
      // Send the data
      socket.current.send(JSON.stringify({
        type: 'frame',
        panelId,
        data: imageData64,
        width: width,
        height: height,
        aspectRatio: width / height,
        timestamp: now,
        quality: 'high'
      }));
      
      // console.log(`Sent high-quality ${panelId} frame: ${width}x${height}`);
    } catch (error) {
      // console.error('Error sending frame:', error);
    }
  };
  
  return { sendFrame };
}; 