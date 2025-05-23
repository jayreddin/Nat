/**
 * Google Gemini Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Google's Gemini models through the Puter API.
 */

const GeminiModels = {
    // Common metadata
    provider: "Google",
    defaultParams: {
        temperature: 0.7,
        top_p: 0.95
    },
    
    // Available Gemini models
    models: {
        // Gemini 2.5 Series
        "gemini-2.5-pro": {
            id: "google/gemini-2.5-pro-exp-03-25:free",
            name: "Gemini 2.5 Pro",
            description: "Google's most advanced model with multimodal capabilities and enhanced reasoning.",
            maxTokens: 32768
        },
        
        // Gemini 2.0 Series
        "gemini-2.0-flash": {
            id: "google/gemini-2.0-flash-lite-001",
            name: "Gemini 2.0 Flash",
            description: "A fast and efficient model for everyday tasks with good performance.",
            maxTokens: 16384
        },
        "gemini-2.0-flash-001": {
            id: "google/gemini-2.0-flash-001",
            name: "Gemini 2.0 Flash",
            description: "Alternative version of Gemini 2.0 Flash.",
            maxTokens: 16384
        },
        "gemini-2.0-pro": {
            id: "google/gemini-2.0-pro-exp-02-05:free",
            name: "Gemini 2.0 Pro",
            description: "Advanced Gemini 2.0 model with strong reasoning and content generation.",
            maxTokens: 32768
        },
        "gemini-2.0-flash-thinking": {
            id: "google/gemini-2.0-flash-thinking-exp:free",
            name: "Gemini 2.0 Flash Thinking",
            description: "Experimental Gemini 2.0 model optimized for reasoning tasks.",
            maxTokens: 16384
        },
        "gemini-2.0-flash-thinking-1219": {
            id: "google/gemini-2.0-flash-thinking-exp-1219:free",
            name: "Gemini 2.0 Flash Thinking 1219",
            description: "Experimental Gemini 2.0 thinking model (version 1219).",
            maxTokens: 16384
        },
        "gemini-2.0-flash-exp": {
            id: "google/gemini-2.0-flash-exp:free",
            name: "Gemini 2.0 Flash Experimental",
            description: "Experimental version of Gemini 2.0 Flash.",
            maxTokens: 16384
        },
        
        // Gemini 1.5 Series
        "gemini-1.5-flash-8b": {
            id: "google/gemini-flash-1.5-8b",
            name: "Gemini 1.5 Flash 8B",
            description: "Efficient 8B parameter version of Gemini 1.5 Flash.",
            maxTokens: 8192
        },
        "gemini-1.5-flash-8b-exp": {
            id: "google/gemini-flash-1.5-8b-exp",
            name: "Gemini 1.5 Flash 8B Experimental",
            description: "Experimental version of Gemini 1.5 Flash 8B.",
            maxTokens: 8192
        },
        "gemini-1.5-flash": {
            id: "google/gemini-flash-1.5",
            name: "Gemini 1.5 Flash",
            description: "Fast and efficient Gemini 1.5 model.",
            maxTokens: 16384
        },
        "gemini-1.5-pro": {
            id: "google/gemini-pro-1.5",
            name: "Gemini 1.5 Pro",
            description: "Full-featured Gemini 1.5 model with strong capabilities.",
            maxTokens: 32768
        },
        
        // Gemini 1.0 Series
        "gemini-pro": {
            id: "google/gemini-pro",
            name: "Gemini Pro",
            description: "Original Gemini Pro model.",
            maxTokens: 8192
        }
    },
    
    /**
     * Format messages for the Gemini API
     * @param {string|object|array} message - Input message in various formats
     * @returns {array} - Properly formatted messages array
     */
    formatMessages(message) {
        // If already an array of messages, return as is
        if (Array.isArray(message)) {
            return message;
        }
        
        // If it's an object with role/content, wrap in array
        if (message && typeof message === 'object' && message.role && message.content) {
            return [message];
        }
        
        // If it's a string, create a user message
        if (typeof message === 'string') {
            return [{
                role: 'user',
                content: message
            }];
        }
        
        // Default fallback
        console.warn('Unknown message format for Gemini:', message);
        return [{
            role: 'user',
            content: String(message) || 'Hello'
        }];
    },
    
    /**
     * Get model information by key
     * @param {string} modelKey - The model key (e.g., "gemini-2.5-pro")
     * @returns {object} - Model information or default if not found
     */
    getModelInfo(modelKey) {
        // Handle exact model ID match
        if (modelKey.includes('/')) {
            for (const [key, model] of Object.entries(this.models)) {
                if (model.id === modelKey) {
                    return model;
                }
            }
        }
        
        // Handle key-based lookup
        if (this.models[modelKey]) {
            return this.models[modelKey];
        }
        
        // Default fallback - find the closest match
        const modelKeys = Object.keys(this.models);
        for (const key of modelKeys) {
            if (modelKey.includes(key) || key.includes(modelKey)) {
                return this.models[key];
            }
        }
        
        // Ultimate fallback
        console.warn(`Model key not found: ${modelKey}, using default`);
        return this.models["gemini-2.5-pro"];
    },
    
    /**
     * Get model ID by key
     * @param {string} modelKey - The model key
     * @returns {string} - The full model ID for API calls
     */
    getModelId(modelKey) {
        // If it already includes a provider prefix, it might be a full ID
        if (modelKey.includes('/')) {
            return modelKey;
        }
        
        const modelInfo = this.getModelInfo(modelKey);
        return modelInfo.id;
    },
    
    /**
     * Get all available models as an array
     * @returns {Array} - Array of model objects with id, name, and description
     */
    getAvailableModels() {
        return Object.values(this.models).map(model => ({
            id: model.id,
            name: model.name,
            description: model.description,
            provider: this.provider
        }));
    },
    
    /**
     * Sends a message to a Gemini model
     * @param {string|object|array} message - The user message to send to the model
     * @param {string} modelKey - The model key (e.g., "gemini-2.5-pro")
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, modelKey = "gemini-2.5-pro", options = {}) {
        try {
            const modelId = this.getModelId(modelKey);
            const formattedMessages = this.formatMessages(message);
            
            const modelOptions = {
                ...this.defaultParams,
                ...options,
                model: modelId
            };
            
            console.log(`Sending message to Gemini model ${modelKey} (${modelId})`);
            console.log("Messages:", formattedMessages);
            console.log("Options:", modelOptions);
            
            const response = await puter.ai.chat(formattedMessages, modelOptions);
            
            console.log(`Response from Gemini ${modelKey}:`, response);
            
            // Handle error responses
            if (response && response.error) {
                console.error(`Error from Gemini ${modelKey}:`, response.error);
                throw response;
            }
            
            // Extract content from different possible response formats
            if (response.message?.content?.[0]?.text) {
                return response.message.content[0].text;
            } else if (response.message?.content) {
                return response.message.content;
            } else if (response.content) {
                return response.content;
            } else if (typeof response === 'string') {
                return response;
            } else {
                console.warn(`Unexpected response format from ${modelKey}:`, response);
                return String(response || '');
            }
        } catch (error) {
            console.error(`Error sending message to ${modelKey}:`, error);
            throw error;
        }
    },
    
    /**
     * Streams a response from a Gemini model
     * @param {string|object|array} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {string} modelKey - The model key (e.g., "gemini-2.5-pro")
     * @param {Object} options - Additional options for the request
     * @returns {Promise<string>} - The complete streamed response
     */
    async streamMessage(message, onChunk, modelKey = "gemini-2.5-pro", options = {}) {
        try {
            const modelId = this.getModelId(modelKey);
            const formattedMessages = this.formatMessages(message);
            
            const streamOptions = {
                ...this.defaultParams,
                ...options,
                model: modelId,
                stream: true
            };
            
            console.log(`Streaming from Gemini model ${modelKey} (${modelId})`);
            console.log("Messages:", formattedMessages);
            console.log("Options:", streamOptions);
            
            const response = await puter.ai.chat(formattedMessages, streamOptions);
            
            let fullResponse = '';
            
            for await (const part of response) {
                console.log(`Gemini ${modelKey} streaming part:`, part);
                
                // Extract text based on various possible formats
                let chunkText = '';
                if (part?.text) {
                    chunkText = part.text;
                } else if (part?.delta?.text) {
                    chunkText = part.delta.text;
                } else if (part?.message?.content?.[0]?.text) {
                    chunkText = part.message.content[0].text;
                } else if (part?.content) {
                    chunkText = part.content;
                } else if (typeof part === 'string') {
                    chunkText = part;
                }
                
                if (chunkText) {
                    fullResponse += chunkText;
                    if (onChunk && typeof onChunk === 'function') {
                        onChunk(chunkText, fullResponse);
                    }
                }
            }
            
            return fullResponse;
        } catch (error) {
            console.error(`Error streaming message from ${modelKey}:`, error);
            throw error;
        }
    },
    
    /**
     * Example usage comparing different Gemini models
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<object>} - Responses from different models
     */
    async example(message = "Tell me something interesting about quantum mechanics", useStreaming = false) {
        const results = {};
        const modelsToCompare = ["gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];
        
        for (const modelKey of modelsToCompare) {
            const modelInfo = this.getModelInfo(modelKey);
            console.log(`\n=== ${modelInfo.name} Response ===`);
            
            if (useStreaming) {
                let streamedResponse = '';
                await this.streamMessage(message, (chunk) => {
                    streamedResponse += chunk;
                    console.log(`${modelKey} chunk:`, chunk);
                }, modelKey);
                results[modelKey] = streamedResponse;
            } else {
                const response = await this.sendMessage(message, modelKey);
                console.log(response);
                results[modelKey] = response;
            }
        }
        
        return results;
    }
};

// Export the model
export default GeminiModels;

// Also register globally for use in script.js
window.GeminiModels = GeminiModels;
