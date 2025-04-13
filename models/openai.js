/**
 * OpenAI GPT-4o Integration
 * 
 * This file contains the functions and configurations for communicating
 * with OpenAI's GPT-4o model through the Puter API.
 */

const OpenAIModel = {
    name: "GPT-4o",
    provider: "OpenAI",
    description: "GPT-4o is OpenAI's most advanced multimodal model, capable of processing both text and images.",
    maxTokens: 8192,
    defaultParams: {
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    },
    
    /**
     * Sends a message to the OpenAI GPT-4o model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<string>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const response = await puter.ai.chat(message, options);
            return response;
        } catch (error) {
            console.error("Error sending message to GPT-4o:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the OpenAI GPT-4o model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            // Set streaming to true
            const streamOptions = {
                ...options,
                stream: true
            };
            
            // Get streaming response
            const response = await puter.ai.chat(message, streamOptions);
            
            // Process each chunk
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from GPT-4o:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the OpenAI GPT-4o model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "What are the benefits of exercise?", useStreaming = false) {
        if (useStreaming) {
            // Example with streaming
            let fullResponse = '';
            await this.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                console.log("Received chunk:", chunk);
            });
            return fullResponse;
        } else {
            // Example without streaming
            const response = await this.sendMessage(message);
            console.log("Full response:", response);
            return response;
        }
    }
};

// Export the model
export default OpenAIModel;
