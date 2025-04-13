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
        top_p: 1
    },
    
    // DeepSeek Chat (V3) implementation
    Chat: {
        name: "DeepSeek Chat",
        modelId: "deepseek-chat",
        description: "DeepSeek Chat (V3) is a general-purpose language model for everyday use.",
        
        /**
         * Sends a message to DeepSeek Chat
         * @param {string} message - The user message to send to the model
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The model's response
         */
        async sendMessage(message, options = {}) {
            try {
                const modelOptions = {
                    ...options,
                    model: 'deepseek-chat'
                };
                
                const response = await puter.ai.chat(message, modelOptions);
                return response.message?.content || response;
            } catch (error) {
                console.error("Error sending message to DeepSeek Chat:", error);
                throw error;
            }
        },
        
        /**
         * Streams a response from DeepSeek Chat
         * @param {string} message - The user message to send to the model
         * @param {function} onChunk - Callback function for each chunk of the response
         * @param {Object} options - Additional options for the request
         * @returns {Promise<void>}
         */
        async streamMessage(message, onChunk, options = {}) {
            try {
                const streamOptions = {
                    ...options,
                    model: 'deepseek-chat',
                    stream: true
                };
                
                const response = await puter.ai.chat(message, streamOptions);
                
                for await (const part of response) {
                    if (onChunk && typeof onChunk === 'function') {
                        onChunk(part?.text || '');
                    }
                }
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
         * @param {string} message - The user message to send to the model
         * @param {Object} options - Additional options for the request
         * @returns {Promise<object>} - The model's response
         */
        async sendMessage(message, options = {}) {
            try {
                const modelOptions = {
                    ...options,
                    model: 'deepseek-reasoner'
                };
                
                const response = await puter.ai.chat(message, modelOptions);
                return response.message?.content || response;
            } catch (error) {
                console.error("Error sending message to DeepSeek Reasoner:", error);
                throw error;
            }
        },
        
        /**
         * Streams a response from DeepSeek Reasoner
         * @param {string} message - The user message to send to the model
         * @param {function} onChunk - Callback function for each chunk of the response
         * @param {Object} options - Additional options for the request
         * @returns {Promise<void>}
         */
        async streamMessage(message, onChunk, options = {}) {
            try {
                const streamOptions = {
                    ...options,
                    model: 'deepseek-reasoner',
                    stream: true
                };
                
                const response = await puter.ai.chat(message, streamOptions);
                
                for await (const part of response) {
                    if (onChunk && typeof onChunk === 'function') {
                        onChunk(part?.text || '');
                    }
                }
            } catch (error) {
                console.error("Error streaming message from DeepSeek Reasoner:", error);
                throw error;
            }
        }
    },
    
    /**
     * Example usage demonstrating both DeepSeek models
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
            await this.Chat.streamMessage(message, (chunk) => {
                chatResponse += chunk;
                console.log("Chat chunk:", chunk);
            });
            results.chat = chatResponse;
            
            console.log("\n=== DeepSeek Reasoner Response (Streaming) ===");
            let reasonerResponse = '';
            await this.Reasoner.streamMessage(message, (chunk) => {
                reasonerResponse += chunk;
                console.log("Reasoner chunk:", chunk);
            });
            results.reasoner = reasonerResponse;
        } else {
            // Example without streaming
            console.log("=== DeepSeek Chat Response ===");
            const chatResponse = await this.Chat.sendMessage(message);
            console.log(chatResponse);
            results.chat = chatResponse;
            
            console.log("\n=== DeepSeek Reasoner Response ===");
            const reasonerResponse = await this.Reasoner.sendMessage(message);
            console.log(reasonerResponse);
            results.reasoner = reasonerResponse;
        }
        
        return results;
    }
};

// Export the models
export default DeepSeekModels;
