/**
 * Claude 3.5 Sonnet Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Anthropic's Claude 3.5 Sonnet model through the Puter API.
 */

const Claude35Model = {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "A good general-purpose model for most applications.",
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
     * Sends a message to the Claude 3.5 Sonnet model
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
                model: 'claude-3-5-sonnet'
            };
            
            console.log("Sending Claude 3.5 request with options:", modelOptions);
            console.log("Messages:", formattedMessages);
            
            const response = await puter.ai.chat({
                messages: formattedMessages,
                ...modelOptions
            });
            
            console.log("Claude 3.5 response:", response);
            
            // If we got an error response, format it properly
            if (response && response.error) {
                throw new Error(response.error.message || "Error from Claude 3.5 API");
            }
            
            // Properly extract the text content from various response formats
            let textContent = '';
            
            // Handle Claude's specific content format (array of content blocks)
            if (response.message?.content && Array.isArray(response.message.content)) {
                // Extract text from content blocks
                for (const block of response.message.content) {
                    if (block.type === 'text' && block.text) {
                        textContent += block.text;
                    }
                }
            } else if (response.message?.content?.[0]?.text) {
                // Direct access to first text block
                textContent = response.message.content[0].text;
            } else if (response.content && typeof response.content === 'string') {
                // Simple content string
                textContent = response.content;
            } else if (typeof response === 'string') {
                // Response is already a string
                textContent = response;
            } else {
                // Fallback: try to get something usable
                console.warn("Unexpected Claude 3.5 response format:", response);
                
                try {
                    // If it's JSON-like, stringify it for debugging
                    if (typeof response === 'object' && response !== null) {
                        textContent = "Received unexpected response format. Raw data: " + 
                            JSON.stringify(response, null, 2);
                    } else {
                        textContent = String(response);
                    }
                } catch (e) {
                    textContent = "Error parsing response: " + e.message;
                }
            }
            
            return textContent;
        } catch (error) {
            console.error("Error sending message to Claude 3.5 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Claude 3.5 Sonnet model
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
                model: 'claude-3-5-sonnet',
                stream: true
            };
            
            console.log("Streaming Claude 3.5 request with options:", streamOptions);
            console.log("Messages:", formattedMessages);
            
            // Get streaming response
            const response = await puter.ai.chat({
                messages: formattedMessages,
                ...streamOptions
            });
            
            let fullResponse = '';
            
            // Process each chunk
            for await (const part of response) {
                console.log("Claude 3.5 streaming part:", part);
                
                // Extract text from various possible formats
                let chunkText = '';
                
                // Handle Claude's content format (array of content blocks)
                if (part.message?.content && Array.isArray(part.message.content)) {
                    // Extract text from content blocks
                    for (const block of part.message.content) {
                        if (block.type === 'text' && block.text) {
                            chunkText += block.text;
                        }
                    }
                } else if (part.message?.content?.[0]?.text) {
                    chunkText = part.message.content[0].text;
                } else if (part.delta?.text) {
                    // Handle delta updates in streaming
                    chunkText = part.delta.text;
                } else if (part.delta?.content && Array.isArray(part.delta.content)) {
                    // Extract from delta content blocks
                    for (const block of part.delta.content) {
                        if (block.type === 'text' && block.text) {
                            chunkText += block.text;
                        }
                    }
                } else if (part?.text) {
                    chunkText = part.text;
                } else if (part?.content && typeof part.content === 'string') {
                    chunkText = part.content;
                } else if (typeof part === 'string') {
                    chunkText = part;
                }
                
                if (chunkText) {
                    console.log("Extracted chunk text:", chunkText);
                    fullResponse += chunkText;
                    if (onChunk && typeof onChunk === 'function') {
                        onChunk(chunkText, fullResponse);
                    }
                } else {
                    console.warn("Could not extract text from streaming part:", part);
                }
            }
            
            return fullResponse;
        } catch (error) {
            console.error("Error streaming message from Claude 3.5 Sonnet:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the Claude 3.5 Sonnet model
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
export default Claude35Model;
