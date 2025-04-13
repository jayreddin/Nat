/**
 * Llama Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Meta's Llama models through the Puter API.
 */

const LlamaModels = {
    // Common metadata
    provider: "Meta",
    defaultParams: {
        temperature: 0.7,
        top_p: 1
    },
    
    // Available Llama models
    models: {
        // Llama 4 Series
        "llama-4-maverick": {
            id: "meta-llama/llama-4-maverick",
            name: "Llama 4 Maverick",
            description: "Meta's advanced Llama 4 Maverick model with strong general-purpose capabilities.",
            maxTokens: 128000
        },
        
        // Llama 3.3 Series
        "llama-3.3-70b": {
            id: "meta-llama/llama-3.3-70b-instruct",
            name: "Llama 3.3 70B",
            description: "Powerful 70B parameter model for complex tasks requiring deep reasoning.",
            maxTokens: 32768
        },
        
        // Llama 3.1 Series
        "llama-3.1-8b": {
            id: "meta-llama/llama-3.1-8b-instruct",
            name: "Llama 3.1 8B",
            description: "Efficient 8B parameter model for faster responses to simpler queries.",
            maxTokens: 8192
        },
        
        // Specialized Models
        "llama-guard": {
            id: "meta-llama/llama-guard-3-8b",
            name: "Llama Guard",
            description: "Specialized model for content moderation and safety checks.",
            maxTokens: 8192
        }
    },
    
    /**
     * Get model information by key
     * @param {string} modelKey - The model key (e.g., "llama-4-maverick")
     * @returns {object} - Model information or default if not found
     */
    getModelInfo(modelKey) {
        return this.models[modelKey] || this.models["llama-4-maverick"];
    },
    
    /**
     * Get model ID by key
     * @param {string} modelKey - The model key
     * @returns {string} - The full model ID for API calls
     */
    getModelId(modelKey) {
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
     * Sends a message to a Llama model
     * @param {string|Array} message - The user message or conversation history
     * @param {string} modelKey - The model key (e.g., "llama-4-maverick")
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, modelKey = "llama-4-maverick", options = {}) {
        try {
            const modelId = this.getModelId(modelKey);
            
            const modelOptions = {
                ...options,
                model: modelId
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.message?.content || response;
        } catch (error) {
            console.error(`Error sending message to ${modelKey}:`, error);
            throw error;
        }
    },
    
    /**
     * Streams a response from a Llama model
     * @param {string|Array} message - The user message or conversation history
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {string} modelKey - The model key (e.g., "llama-4-maverick")
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, modelKey = "llama-4-maverick", options = {}) {
        try {
            const modelId = this.getModelId(modelKey);
            
            const streamOptions = {
                ...options,
                model: modelId,
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error(`Error streaming message from ${modelKey}:`, error);
            throw error;
        }
    },
    
    /**
     * Creates a moderation check using Llama Guard
     * @param {string} content - Content to check for safety/moderation
     * @returns {Promise<object>} - Moderation result
     */
    async moderateContent(content) {
        const prompt = `Is this message harmful or unsafe: '${content}'`;
        return this.sendMessage(prompt, "llama-guard");
    },
    
    /**
     * Compares responses from multiple Llama models
     * @param {string} prompt - Prompt to send to all models
     * @param {Array} modelKeys - Array of model keys to compare
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<object>} - Object with responses from each model
     */
    async compareModels(prompt, modelKeys = ["llama-4-maverick", "llama-3.3-70b", "llama-3.1-8b"], useStreaming = false) {
        const results = {};
        
        for (const modelKey of modelKeys) {
            const modelInfo = this.getModelInfo(modelKey);
            console.log(`\n=== ${modelInfo.name} Response ===`);
            
            if (useStreaming) {
                let streamedResponse = '';
                await this.streamMessage(prompt, (chunk) => {
                    streamedResponse += chunk;
                    console.log(`${modelKey} chunk:`, chunk);
                }, modelKey);
                results[modelKey] = streamedResponse;
            } else {
                const response = await this.sendMessage(prompt, modelKey);
                console.log(response);
                results[modelKey] = response;
            }
        }
        
        return results;
    },
    
    /**
     * Creates a multi-model interface where users can switch between models
     * @param {Object} options - Interface options
     * @param {HTMLElement} options.messagesContainer - Container for messages
     * @param {HTMLElement} options.inputElement - Input element for user messages
     * @param {HTMLElement} options.modelSelector - Select element for model selection
     * @returns {Object} - Interface methods
     */
    createMultiModelInterface(options = {}) {
        const { messagesContainer, inputElement, modelSelector } = options;
        
        if (!messagesContainer || !inputElement) {
            throw new Error('Must provide messagesContainer and inputElement');
        }
        
        // Populate model selector if provided
        if (modelSelector) {
            // Clear existing options
            modelSelector.innerHTML = '';
            
            // Add options for each model
            Object.entries(this.models).forEach(([key, model]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = model.name;
                modelSelector.appendChild(option);
            });
        }
        
        // Add a message to the chat UI
        const addMessageToUI = (sender, text) => {
            const messageDiv = document.createElement('div');
            messageDiv.style.marginBottom = '15px';
            
            const isUser = sender === 'You';
            const color = isUser ? '#0066cc' : '#009933';
            
            messageDiv.innerHTML = `
                <strong style="color: ${color};">${sender}:</strong><br>
                <span>${text}</span>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return messageDiv.querySelector('span');
        };
        
        // Handle sending a message
        const sendMessage = async () => {
            const message = inputElement.value.trim();
            if (!message) return;
            
            // Get selected model key
            const modelKey = modelSelector ? modelSelector.value : 'llama-4-maverick';
            const modelInfo = this.getModelInfo(modelKey);
            
            // Add user message to UI
            addMessageToUI('You', message);
            inputElement.value = '';
            
            // Add initial AI message with model name
            const responseSpan = addMessageToUI(`${modelInfo.name}`, '');
            
            // Show typing indicator
            const typingDots = document.createElement('span');
            typingDots.className = 'typing-indicator';
            typingDots.innerHTML = '. . .';
            responseSpan.appendChild(typingDots);
            
            try {
                // Stream the response
                let fullResponse = '';
                await this.streamMessage(message, (chunk) => {
                    if (fullResponse.length === 0) {
                        // Clear typing indicator on first chunk
                        responseSpan.innerHTML = '';
                    }
                    fullResponse += chunk;
                    responseSpan.innerHTML = fullResponse;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, modelKey);
            } catch (error) {
                responseSpan.innerHTML = `Error: ${error.message}`;
                console.error('Chat error:', error);
            }
        };
        
        // Add event listener for Enter key
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Return interface methods
        return {
            sendMessage,
            clearChat: () => {
                messagesContainer.innerHTML = '';
            },
            addInfo: (text) => {
                const infoDiv = document.createElement('div');
                infoDiv.style.margin = '10px 0';
                infoDiv.style.padding = '10px';
                infoDiv.style.backgroundColor = '#f5f5f5';
                infoDiv.style.borderRadius = '5px';
                infoDiv.innerHTML = text;
                messagesContainer.appendChild(infoDiv);
            }
        };
    },
    
    /**
     * Example usage of the various Llama models
     * @param {string} message - Message to send
     * @returns {Promise<object>} - Results from different models
     */
    async example(message = "Explain how machine learning works to a beginner") {
        console.log("=== Comparing Llama Model Responses ===");
        
        // Define the different models to compare
        const modelsToCompare = ["llama-4-maverick", "llama-3.1-8b"];
        
        // Get responses from each model
        const responses = await this.compareModels(message, modelsToCompare, false);
        
        // Return the results
        return responses;
    }
};

// Export the model
export default LlamaModels;
