/**
 * Claude 3.7 Sonnet Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Anthropic's Claude 3.7 Sonnet model through the Puter API.
 */

const Claude37Model = {
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "An advanced model with improved performance for complex reasoning tasks, agentic coding, and detailed content generation.",
    maxTokens: 200000,
    defaultParams: {
        temperature: 0.7,
        top_p: 0.9
    },
    
    /**
     * Sends a message to the Claude 3.7 Sonnet model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelOptions = {
                ...options,
                model: 'claude-3-7-sonnet'
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            
            // Handle response format based on the documentation
            return response.message?.content?.[0]?.text || response;
        } catch (error) {
            console.error("Error sending message to Claude 3.7 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Claude 3.7 Sonnet model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            // Set streaming and model options
            const streamOptions = {
                ...options,
                model: 'claude-3-7-sonnet',
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
            console.error("Error streaming message from Claude 3.7 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the Claude 3.7 Sonnet model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "Explain quantum computing in simple terms", useStreaming = false) {
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
export default Claude37Model;
