/**
 * Mistral Large Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Mistral's Large model through the Puter API.
 */

const MistralLargeModel = {
    name: "Mistral Large",
    provider: "Mistral AI",
    description: "Mistral Large is an advanced language model with strong capabilities for a wide range of text generation tasks.",
    maxTokens: 32768,
    defaultParams: {
        temperature: 0.7,
        top_p: 1
    },
    
    /**
     * Sends a message to the Mistral Large model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelOptions = {
                ...options,
                model: 'mistral-large-latest'
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.text || response;
        } catch (error) {
            console.error("Error sending message to Mistral Large:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Mistral Large model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const streamOptions = {
                ...options,
                model: 'mistral-large-latest',
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from Mistral Large:", error);
            throw error;
        }
    },
    
    /**
     * Creates a chat interface for Mistral Large
     * @param {Object} options - Options for the chat interface
     * @param {HTMLElement} options.messagesContainer - Element where messages will be displayed
     * @param {HTMLElement} options.inputElement - Element for user input
     * @param {Function} options.onSend - Function to run before sending (can be used for validation)
     * @param {Function} options.onResponse - Function to run after receiving response
     * @returns {Object} - Chat interface methods
     */
    createChatInterface(options = {}) {
        const {
            messagesContainer,
            inputElement,
            onSend = () => true,
            onResponse = () => {}
        } = options;
        
        if (!messagesContainer || !inputElement) {
            throw new Error('Must provide messagesContainer and inputElement');
        }
        
        // Add a message to the chat
        const addMessage = (role, text) => {
            const messageElement = document.createElement('p');
            const roleElement = document.createElement('strong');
            roleElement.textContent = role === 'user' ? 'You: ' : 'AI: ';
            
            messageElement.appendChild(roleElement);
            
            if (role === 'user') {
                messageElement.appendChild(document.createTextNode(text));
            } else {
                const responseSpan = document.createElement('span');
                responseSpan.id = `ai-response-${Date.now()}`;
                responseSpan.textContent = text || '';
                messageElement.appendChild(responseSpan);
            }
            
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return role === 'assistant' ? messageElement.querySelector('span') : null;
        };
        
        // Handle sending a message
        const sendMessage = async () => {
            const message = inputElement.value.trim();
            if (!message) return;
            
            // Run pre-send callback
            if (onSend(message) === false) {
                return;
            }
            
            // Add user message to chat
            addMessage('user', message);
            inputElement.value = '';
            
            // Add AI response placeholder
            const responseElement = addMessage('assistant', '');
            
            try {
                // Stream the response
                await this.streamMessage(message, (chunk) => {
                    responseElement.textContent += chunk;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                });
                
                // Run post-response callback
                onResponse(responseElement.textContent);
            } catch (error) {
                responseElement.textContent = `Error: ${error.message}`;
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
            addMessage,
            clearChat: () => {
                messagesContainer.innerHTML = '';
            }
        };
    },
    
    /**
     * Example usage of the Mistral Large model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "What are the key differences between classical and quantum computing?", useStreaming = false) {
        if (useStreaming) {
            // Example with streaming
            console.log("=== Mistral Large Streaming Response ===");
            let fullResponse = '';
            await this.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                console.log("Received chunk:", chunk);
            });
            return fullResponse;
        } else {
            // Example without streaming
            console.log("=== Mistral Large Response ===");
            const response = await this.sendMessage(message);
            console.log("Full response:", response);
            return response;
        }
    }
};

// Export the model
export default MistralLargeModel;
