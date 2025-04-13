/**
 * DeepSeek Integration
 * 
 * This file contains the functions and configurations for communicating
 * with DeepSeek models (Chat V3 and Reasoner R1) through the Puter API.
 */

const DeepSeekModels = {
    // Common metadata
    provider: "DeepSeek",
    maxTokens: 8192,
    defaultParams: {
        temperature: 0.7,
        top_p: 1,
        show_thinking: true  // Enable reasoning by default
    },
    
    /**
     * Get model instance by ID
     * @param {string} modelId - ID of the model to retrieve
     * @returns {object} - The model instance or null if not found
     */
    getModelById(modelId) {
        if (modelId === 'deepseek-chat') {
            return this.Chat;
        } else if (modelId === 'deepseek-reasoner') {
            return this.Reasoner;
        }
        
        console.warn(`Unknown DeepSeek model ID: ${modelId}, fallback to DeepSeek Chat`);
        return this.Chat; // Default fallback
    },
    
    // Format messages for API
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
        console.warn('Unknown message format:', message);
        return [{
            role: 'user',
            content: String(message) || 'Hello'
        }];
    },
    
    // DeepSeek Chat (V3) implementation
    Chat: {
        name: "DeepSeek Chat",
        modelId: "deepseek-chat",
        description: "DeepSeek Chat (V3) is a general-purpose language model for everyday use.",
        
        /**
         * Sends a message to DeepSeek Chat
         * @param {string|object|array} message - The user message to send to the model
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The model's response
         */
        async sendMessage(message, options = {}) {
            try {
                // Format message correctly
                const formattedMessages = DeepSeekModels.formatMessages(message);
                
                const modelOptions = {
                    ...DeepSeekModels.defaultParams,
                    ...options,
                    model: 'deepseek-chat'
                };
                
                console.log("Sending DeepSeek Chat request with options:", modelOptions);
                console.log("Messages:", formattedMessages);
                
                // Correct format for puter.ai.chat call - pass messages array as a parameter
                const response = await puter.ai.chat(formattedMessages, {
                    ...modelOptions
                });
                
                console.log("DeepSeek Chat response:", response);
                
                // If we got an error response, format it properly
                if (response && response.error) {
                    throw new Error(response.error.message || "Error from DeepSeek Chat API");
                }
                
                return {
                    message: { content: response.content || response },
                    thinking: response.thinking || ""
                };
            } catch (error) {
                console.error("Error sending message to DeepSeek Chat:", error);
                throw error;
            }
        },
        
        /**
         * Streams a response from DeepSeek Chat
         * @param {string|object|array} message - The user message to send to the model
         * @param {function} onChunk - Callback function for each chunk of the response
         * @param {function} onThinking - Callback for reasoning process chunks
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The complete response
         */
        async streamMessage(message, onChunk, onThinking, options = {}) {
            try {
                // Format message correctly
                const formattedMessages = DeepSeekModels.formatMessages(message);
                
                const streamOptions = {
                    ...DeepSeekModels.defaultParams,
                    ...options,
                    model: 'deepseek-chat',
                    stream: true
                };
                
                console.log("Streaming DeepSeek Chat request with options:", streamOptions);
                console.log("Messages:", formattedMessages);
                
                // Correct format for puter.ai.chat call - pass messages array as a parameter
                const response = await puter.ai.chat(formattedMessages, {
                    ...streamOptions
                });
                
                let fullResponse = '';
                let fullThinking = '';
                
                for await (const part of response) {
                    console.log("DeepSeek Chat streaming part:", part);
                    
                    // Handle response chunk
                    if (part?.text) {
                        fullResponse += part.text;
                        if (onChunk && typeof onChunk === 'function') {
                            onChunk(part.text, fullResponse);
                        }
                    }
                    
                    // Handle thinking/reasoning chunk
                    if (part?.thinking) {
                        fullThinking += part.thinking;
                        if (onThinking && typeof onThinking === 'function') {
                            onThinking(part.thinking, fullThinking);
                        }
                    }
                }
                
                return {
                    message: { content: fullResponse },
                    thinking: fullThinking
                };
            } catch (error) {
                console.error("Error streaming message from DeepSeek Chat:", error);
                throw error;
            }
        }
    },
    
    // DeepSeek Reasoner (R1) implementation
    Reasoner: {
        name: "DeepSeek Reasoner",
        modelId: "deepseek-reasoner",
        description: "DeepSeek Reasoner (R1) specializes in complex problem-solving and step-by-step analysis.",
        
        /**
         * Sends a message to DeepSeek Reasoner
         * @param {string|object|array} message - The user message to send to the model
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The model's response
         */
        async sendMessage(message, options = {}) {
            try {
                // Format message correctly
                const formattedMessages = DeepSeekModels.formatMessages(message);
                
                const modelOptions = {
                    ...DeepSeekModels.defaultParams,
                    ...options,
                    model: 'deepseek-reasoner'
                };
                
                console.log("Sending DeepSeek Reasoner request with options:", modelOptions);
                console.log("Messages:", formattedMessages);
                
                // Correct format for puter.ai.chat call - pass messages array as a parameter
                const response = await puter.ai.chat(formattedMessages, {
                    ...modelOptions
                });
                
                console.log("DeepSeek Reasoner response:", response);
                
                // If we got an error response, format it properly
                if (response && response.error) {
                    throw new Error(response.error.message || "Error from DeepSeek Reasoner API");
                }
                
                return {
                    message: { content: response.content || response },
                    thinking: response.thinking || ""
                };
            } catch (error) {
                console.error("Error sending message to DeepSeek Reasoner:", error);
                throw error;
            }
        },
        
        /**
         * Streams a response from DeepSeek Reasoner
         * @param {string|object|array} message - The user message to send to the model
         * @param {function} onChunk - Callback function for each chunk of the response
         * @param {function} onThinking - Callback for reasoning process chunks
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The complete response
         */
        async streamMessage(message, onChunk, onThinking, options = {}) {
            try {
                // Format message correctly
                const formattedMessages = DeepSeekModels.formatMessages(message);
                
                const streamOptions = {
                    ...DeepSeekModels.defaultParams,
                    ...options,
                    model: 'deepseek-reasoner',
                    stream: true
                };
                
                console.log("Streaming DeepSeek Reasoner request with options:", streamOptions);
                console.log("Messages:", formattedMessages);
                
                // Correct format for puter.ai.chat call - pass messages array as a parameter
                const response = await puter.ai.chat(formattedMessages, {
                    ...streamOptions
                });
                
                let fullResponse = '';
                let fullThinking = '';
                
                for await (const part of response) {
                    console.log("DeepSeek Reasoner streaming part:", part);
                    
                    // Handle response chunk
                    if (part?.text) {
                        fullResponse += part.text;
                        if (onChunk && typeof onChunk === 'function') {
                            onChunk(part.text, fullResponse);
                        }
                    }
                    
                    // Handle thinking/reasoning chunk
                    if (part?.thinking) {
                        fullThinking += part.thinking;
                        if (onThinking && typeof onThinking === 'function') {
                            onThinking(part.thinking, fullThinking);
                        }
                    }
                }
                
                return {
                    message: { content: fullResponse },
                    thinking: fullThinking
                };
            } catch (error) {
                console.error("Error streaming message from DeepSeek Reasoner:", error);
                throw error;
            }
        }
    },

    // Check if a model ID is a DeepSeek model
    isDeepSeekModel(modelId) {
        return modelId && modelId.includes('deepseek');
    },
    
    /**
     * Example usage demonstrating both DeepSeek models with reasoning process
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<object>} - The responses from both models
     */
    async example(message = "Explain quantum entanglement in simple terms", useStreaming = false) {
        const results = {};
        
        if (useStreaming) {
            // Example with streaming for both models
            console.log("=== DeepSeek Chat Response (Streaming) ===");
            let chatResponse = '';
            let chatThinking = '';
            
            const chatResult = await this.Chat.streamMessage(
                message, 
                (chunk) => {
                    chatResponse += chunk;
                    console.log("Chat chunk:", chunk);
                },
                (thinking) => {
                    chatThinking += thinking;
                    console.log("Chat thinking:", thinking);
                }
            );
            
            results.chat = {
                response: chatResponse,
                thinking: chatThinking
            };
            
            console.log("\n=== DeepSeek Reasoner Response (Streaming) ===");
            let reasonerResponse = '';
            let reasonerThinking = '';
            
            const reasonerResult = await this.Reasoner.streamMessage(
                message, 
                (chunk) => {
                    reasonerResponse += chunk;
                    console.log("Reasoner chunk:", chunk);
                },
                (thinking) => {
                    reasonerThinking += thinking;
                    console.log("Reasoner thinking:", thinking);
                }
            );
            
            results.reasoner = {
                response: reasonerResponse,
                thinking: reasonerThinking
            };
        } else {
            // Example without streaming
            console.log("=== DeepSeek Chat Response ===");
            const chatResponse = await this.Chat.sendMessage(message);
            console.log("Response:", chatResponse.message?.content);
            console.log("Thinking:", chatResponse.thinking);
            results.chat = {
                response: chatResponse.message?.content,
                thinking: chatResponse.thinking
            };
            
            console.log("\n=== DeepSeek Reasoner Response ===");
            const reasonerResponse = await this.Reasoner.sendMessage(message);
            console.log("Response:", reasonerResponse.message?.content);
            console.log("Thinking:", reasonerResponse.thinking);
            results.reasoner = {
                response: reasonerResponse.message?.content,
                thinking: reasonerResponse.thinking
            };
        }
        
        return results;
    }
};

// Export the models
export default DeepSeekModels;

// Also register globally for use in script.js
window.DeepSeekModels = DeepSeekModels;
