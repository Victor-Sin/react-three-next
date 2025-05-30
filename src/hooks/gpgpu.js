import {GPUComputationRenderer} from "three/examples/jsm/misc/GPUComputationRenderer";
import * as THREE from "three";
import frag from "./frag.glsl"

export default class GPGPU {
    renderer;
    gpgpuRenderer;
    variableNoise;
    texture;
    isInitialized = false;
    static instance;

    constructor(renderer) {
        if (GPGPU.instance) {
            return GPGPU.instance;
        }

        GPGPU.instance = this;
        
        if (!renderer) {
            console.error('GPGPU: Renderer is required');
            return;
        }

        this.renderer = renderer;
        
        // Initialize asynchronously to ensure renderer is ready
        this.init();
    }

    async init() {
        try {
            // Wait for next frame to ensure renderer is fully initialized
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            this.createGPGPURenderer();
            this.createDataTextures();
            this.createVariable();
            this.setRendererDependencies();
            this.initiateRenderer();
            
            this.isInitialized = true;
            console.log('GPGPU initialized successfully');
        } catch (error) {
            console.error('GPGPU initialization failed:', error);
        }
    }

    createGPGPURenderer() {
        if (!this.renderer) {
            throw new Error('Renderer not available');
        }
        
        this.gpgpuRenderer = new GPUComputationRenderer(
            512, // Reduced size for better performance
            512,
            this.renderer
        );
        console.log('GPGPU Renderer created:', this.gpgpuRenderer);
    }

    createDataTextures() {
        if (!this.gpgpuRenderer) {
            throw new Error('GPGPU Renderer not initialized');
        }
        this.texture = this.gpgpuRenderer.createTexture();
    }

    createVariable() {
        if (!this.gpgpuRenderer || !this.texture) {
            throw new Error('GPGPU Renderer or texture not initialized');
        }
        
        this.variableNoise = this.gpgpuRenderer.addVariable('noiseTexture', frag, this.texture);
        this.variableNoise.material.uniforms.uTime = new THREE.Uniform(0);
    }

    setRendererDependencies() {
        if (!this.gpgpuRenderer || !this.variableNoise) {
            throw new Error('GPGPU components not initialized');
        }
        this.gpgpuRenderer.setVariableDependencies(this.variableNoise, [this.variableNoise]);
    }

    initiateRenderer() {
        if (!this.gpgpuRenderer) {
            throw new Error('GPGPU Renderer not initialized');
        }
        
        // Check if renderer has required capabilities
        if (!this.renderer.capabilities) {
            throw new Error('Renderer capabilities not available');
        }
        
        const error = this.gpgpuRenderer.init();
        if (error !== null) {
            throw new Error('GPGPU initialization error: ' + error);
        }
    }

    getTexture() {
        if (!this.isInitialized || !this.gpgpuRenderer || !this.variableNoise) {
            return null;
        }
        return this.gpgpuRenderer.getCurrentRenderTarget(this.variableNoise).texture;
    }

    render(delta) {
        if (!this.isInitialized || !this.variableNoise || !this.gpgpuRenderer) {
            return;
        }

        try {
            this.variableNoise.material.uniforms.uTime.value += delta;
            this.gpgpuRenderer.compute();
        } catch (error) {
            console.error('GPGPU render error:', error);
        }
    }

    dispose() {
        if (this.gpgpuRenderer) {
            // Clean up GPGPU resources
            this.gpgpuRenderer = null;
        }
        if (this.texture) {
            this.texture.dispose();
            this.texture = null;
        }
        this.isInitialized = false;
        GPGPU.instance = null;
    }
}
