/**
 * Claude 3 Sonnet Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Anthropic's Claude 3 Sonnet model through the Puter API.
 */

const Claude3SonnetModel = {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Claude 3 Sonnet balances intelligence and speed, offering powerful reasoning capabilities with faster response times than Opus.",
    maxTokens: 200000,
    defaultParams: {
        temperature: 0.7,
        top_p: 0.9
    },
    
    /**
     * Format messages for the Claude API
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
        console.warn('Unknown message format for Claude:', message);
        return [{
            role: 'user',
            content: String(message) || 'Hello'
        }];
    },
    
    /**
     * Sends a message to the Claude 3 Sonnet model
     * @param {string|object|array} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const formattedMessages = this.formatMessages(message);
            
            const modelOptions = {
                ...this.defaultParams,
                ...options,
                model: 'claude-3-sonnet'
            };
            
            console.log("Sending Claude 3 Sonnet request with options:", modelOptions);
            console.log("Messages:", formattedMessages);
            
            const response = await puter.ai.chat({
                messages: formattedMessages,
                ...modelOptions
            });
            
            console.log("Claude 3 Sonnet response:", response);
            
            // If we got an error response, format it properly
            if (response && response.error) {
                throw new Error(response.error.message || "Error from Claude 3 Sonnet API");
            }
            
            // Handle different response formats
            if (response.message?.content?.[0]?.text) {
                return response.message.content[0].text;
            } else if (response.content) {
                return response.content;
            } else if (typeof response === 'string') {
                return response;
            } else {
                console.warn("Unexpected Claude 3 Sonnet response format:", response);
                return String(response);
            }
        } catch (error) {
            console.error("Error sending message to Claude 3 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Claude 3 Sonnet model
     * @param {string|object|array} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const formattedMessages = this.formatMessages(message);
            
            // Set streaming and model options
            const streamOptions = {
                ...this.defaultParams,
                ...options,
                model: 'claude-3-sonnet',
                stream: true
            };
            
            console.log("Streaming Claude 3 Sonnet request with options:", streamOptions);
            console.log("Messages:", formattedMessages);
            
            // Get streaming response
            const response = await puter.ai.chat({
                messages: formattedMessages,
                ...streamOptions
            });
            
            let fullResponse = '';
            
            // Process each chunk
            for await (const part of response) {
                console.log("Claude 3 Sonnet streaming part:", part);
                
                // Extract text from various possible formats
                let chunkText = '';
                if (part?.text) {
                    chunkText = part.text;
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
            console.error("Error streaming message from Claude 3 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the Claude 3 Sonnet model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "Explain how machine learning algorithms work", useStreaming = false) {
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
export default Claude3SonnetModel; 