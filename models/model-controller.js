/**
 * Model Controller
 * 
 * This file manages model-specific functionality and loading
 * model scripts dynamically based on the selected model.
 */

class ModelController {
    constructor() {
        this.loadedModels = {};
        this.activeModel = null;
        this.streamingEnabled = false;
        this.streamingCapableModels = [
            'gpt-4o', 'gpt-4o-mini', 'o1-mini', 'o3-mini',
            'claude-3-5-sonnet', 'claude-3-7-sonnet',
            'gemini-2.0-flash', 'gemini-pro', 'gemini-pro-1.5',
            'gemini-2.5-pro-exp-03-25:free', 'gemini-2.0-flash-thinking-exp:free',
            'meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout',
            'mistral-large-latest', 'pixtral-large-latest', 'codestral-latest',
            'x-ai/grok-3-beta', 'grok-beta'
        ];
    }

    /**
     * Check if a model supports streaming
     * @param {string} modelName - Name of the model to check
     * @returns {boolean} - Whether the model supports streaming
     */
    supportsStreaming(modelName) {
        return this.streamingCapableModels.includes(modelName);
    }

    /**
     * Get the correct module name for a given model
     * @param {string} modelName - Name of the model
     * @returns {string} - Module name to load
     */
    getModuleNameForModel(modelName) {
        // Map model names to their respective module files
        if (modelName.includes('gpt-4o') || modelName.includes('gpt-')) {
            return 'openai';
        } else if (modelName.includes('o1-mini')) {
            return 'o1-mini';
        } else if (modelName.includes('o3-mini')) {
            return 'o3-mini';
        } else if (modelName.includes('claude-3-5')) {
            return 'claude-3.5';
        } else if (modelName.includes('claude-3-7')) {
            return 'claude-3.7';
        } else if (modelName.includes('gemini')) {
            return 'gemini';
        } else if (modelName.includes('llama')) {
            return 'llama';
        } else if (modelName.includes('grok')) {
            return 'grok';
        } else if (modelName.includes('mistral-large')) {
            return 'mistral-large';
        } else if (modelName.includes('codestral')) {
            return 'codestral';
        } else if (modelName.includes('deepseek')) {
            return 'deepseek';
        }
        
        // Default to openai if no match
        return 'openai';
    }

    /**
     * Load a model module dynamically
     * @param {string} modelName - Name of the model to load
     * @returns {Promise<Object>} - The loaded model module
     */
    async loadModelModule(modelName) {
        try {
            const moduleName = this.getModuleNameForModel(modelName);
            
            // Check if already loaded
            if (this.loadedModels[moduleName]) {
                return this.loadedModels[moduleName];
            }
            
            // Dynamically import module
            const module = await import(`./models/${moduleName}.js`);
            this.loadedModels[moduleName] = module.default;
            
            console.log(`Loaded model module: ${moduleName}`);
            return module.default;
        } catch (error) {
            console.error(`Error loading model module for ${modelName}:`, error);
            return null;
        }
    }

    /**
     * Set the active model and load its module if needed
     * @param {string} modelName - Name of the model to set active
     * @returns {Promise<boolean>} - Success state
     */
    async setActiveModel(modelName) {
        try {
            this.activeModel = modelName;
            await this.loadModelModule(modelName);
            return true;
        } catch (error) {
            console.error(`Error setting active model ${modelName}:`, error);
            return false;
        }
    }

    /**
     * Toggle streaming mode
     * @returns {boolean} - New streaming state
     */
    toggleStreaming() {
        this.streamingEnabled = !this.streamingEnabled;
        return this.streamingEnabled;
    }

    /**
     * Get streaming state
     * @returns {boolean} - Current streaming state
     */
    isStreamingEnabled() {
        return this.streamingEnabled;
    }
}

// Create a global instance
const modelController = new ModelController();

export default modelController; 