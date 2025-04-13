/**
 * Grok Integration
 * 
 * This file contains the functions and configurations for communicating
 * with X AI's Grok models through the Puter API.
 */

const GrokModel = {
    name: "Grok",
    provider: "X AI",
    description: "A witty and engaging AI model with a unique personality and strong creative capabilities.",
    maxTokens: 16384,
    defaultParams: {
        temperature: 0.7,
        top_p: 1
    },
    
    // Map model names to API model names
    modelMap: {
        'grok-beta': 'grok-beta',
        'grok-3-beta': 'x-ai/grok-3-beta'
    },
    
    /**
     * Get the correct API model name
     * @param {string} modelName - The UI model name
     * @returns {string} - The API model name
     */
    getApiModelName(modelName) {
        return this.modelMap[modelName] || modelName;
    },
    
    /**
     * Sends a message to the Grok model
     * @param {string|Array} message - The user message or conversation history
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelName = options.model || 'grok-3-beta';
            const apiModelName = this.getApiModelName(modelName);
            
            const modelOptions = {
                ...options,
                model: apiModelName
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.message?.content || response;
        } catch (error) {
            console.error("Error sending message to Grok:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Grok model
     * @param {string|Array} message - The user message or conversation history
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const modelName = options.model || 'grok-3-beta';
            const apiModelName = this.getApiModelName(modelName);
            
            const streamOptions = {
                ...options,
                model: apiModelName,
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from Grok:", error);
            throw error;
        }
    },
    
    /**
     * Creates a conversation manager for multi-turn conversations with Grok
     * @returns {Object} - Conversation manager with methods for interaction
     */
    createConversationManager() {
        let conversationHistory = [];
        
        return {
            /**
             * Add a message to the conversation history
             * @param {string} content - Message content
             * @param {string} role - Message role ('user' or 'assistant')
             */
            addMessage: (content, role = 'user') => {
                conversationHistory.push({
                    role: role,
                    content: content
                });
            },
            
            /**
             * Get the current conversation history
             * @returns {Array} - Conversation history
             */
            getHistory: () => {
                return [...conversationHistory];
            },
            
            /**
             * Clear the conversation history
             */
            clearHistory: () => {
                conversationHistory = [];
            },
            
            /**
             * Send a message and add both the message and response to history
             * @param {string} message - User message
             * @param {Object} options - Additional options for the request
             * @returns {Promise<string>} - Grok's response
             */
            sendMessage: async (message, options = {}) => {
                // Add user message to history
                this.addMessage(message, 'user');
                
                // Get response from Grok
                const response = await this.sendMessage(conversationHistory, options);
                
                // Add Grok's response to history
                const responseContent = typeof response === 'string' 
                    ? response 
                    : response.message?.content || response;
                
                this.addMessage(responseContent, 'assistant');
                
                return responseContent;
            },
            
            /**
             * Stream a message and add both the message and response to history
             * @param {string} message - User message
             * @param {function} onChunk - Callback for each response chunk
             * @param {Object} options - Additional options for the request
             * @returns {Promise<string>} - Complete response
             */
            streamMessage: async (message, onChunk, options = {}) => {
                // Add user message to history
                this.addMessage(message, 'user');
                
                let fullResponse = '';
                
                // Stream response from Grok
                await this.streamMessage(
                    conversationHistory, 
                    (chunk) => {
                        fullResponse += chunk;
                        if (onChunk && typeof onChunk === 'function') {
                            onChunk(chunk);
                        }
                    },
                    options
                );
                
                // Add Grok's response to history
                this.addMessage(fullResponse, 'assistant');
                
                return fullResponse;
            }
        };
    },
    
    /**
     * Creates a chat interface for Grok
     * @param {Object} options - Options for the chat interface
     * @param {HTMLElement} options.messagesContainer - Container for messages
     * @param {HTMLElement} options.inputElement - Input element for user messages
     * @param {Object} options.styling - Optional styling configurations
     * @returns {Object} - Chat interface methods
     */
    createChatInterface(options = {}) {
        const {
            messagesContainer,
            inputElement,
            styling = {
                userColor: '#0066cc',
                assistantColor: '#009933',
                userLabel: 'You',
                assistantLabel: 'Grok'
            }
        } = options;
        
        if (!messagesContainer || !inputElement) {
            throw new Error('Must provide messagesContainer and inputElement');
        }
        
        // Create conversation manager
        const conversationManager = this.createConversationManager();
        
        // Add a message to the chat UI
        const addMessageToUI = (message, isUser) => {
            const messageDiv = document.createElement('div');
            messageDiv.style.marginBottom = '15px';
            
            const label = isUser ? styling.userLabel : styling.assistantLabel;
            const color = isUser ? styling.userColor : styling.assistantColor;
            
            messageDiv.innerHTML = `
                <strong style="color: ${color};">${label}:</strong><br>
                <span>${isUser ? message : ''}</span>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return messageDiv.querySelector('span');
        };
        
        // Handle asking a question
        const askQuestion = async () => {
            const question = inputElement.value.trim();
            if (!question) return;
            
            // Add user question to UI
            addMessageToUI(question, true);
            inputElement.value = '';
            
            // Add empty assistant response to UI
            const responseSpan = addMessageToUI('', false);
            
            // Stream response
            await conversationManager.streamMessage(
                question,
                (chunk) => {
                    responseSpan.innerHTML += chunk;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            );
        };
        
        // Add event listener for Enter key
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                askQuestion();
            }
        });
        
        // Return interface methods
        return {
            askQuestion,
            addGreeting: (greeting = "Hi there! I'm Grok, your witty AI assistant. I'm here to help you with anything you'd like to know about. What's on your mind?") => {
                const greetingDiv = document.createElement('div');
                greetingDiv.style.marginBottom = '15px';
                greetingDiv.innerHTML = `
                    <strong style="color: ${styling.assistantColor};">${styling.assistantLabel}:</strong><br>
                    ${greeting}
                `;
                messagesContainer.appendChild(greetingDiv);
            },
            clearChat: () => {
                messagesContainer.innerHTML = '';
                conversationManager.clearHistory();
            },
            getConversationManager: () => conversationManager
        };
    },
    
    /**
     * Creates a creative writing generator
     * @param {Object} options - Creative writing options
     * @param {function} onProgress - Callback for generation progress
     * @returns {Promise<string>} - Generated creative content
     */
    async generateCreativeContent(options = {}, onProgress) {
        const {
            type = 'story',
            genre = 'sci-fi',
            theme = 'adventure',
            setting = 'space station',
            characters = 2,
            length = 'short',
            tone = 'witty'
        } = options;
        
        const prompt = `
Write a ${length} ${type} with the following parameters:
- Genre: ${genre}
- Theme: ${theme}
- Setting: ${setting}
- Characters: ${characters}

Make it ${tone}, engaging, and memorable. Include some clever dialogue and unexpected twists.`;
        
        if (onProgress && typeof onProgress === 'function') {
            let fullResponse = '';
            await this.streamMessage(prompt, (chunk) => {
                fullResponse += chunk;
                onProgress(chunk, fullResponse);
            });
            return fullResponse;
        } else {
            return this.sendMessage(prompt);
        }
    },
    
    /**
     * Example usage of the Grok model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "Explain quantum computing in a witty and engaging way.", useStreaming = false) {
        if (useStreaming) {
            // Example with streaming
            console.log("=== Grok Streaming Response ===");
            let fullResponse = '';
            await this.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                console.log("Received chunk:", chunk);
            });
            return fullResponse;
        } else {
            // Example without streaming
            console.log("=== Grok Response ===");
            const response = await this.sendMessage(message);
            console.log("Full response:", response);
            return response;
        }
    }
};

// Export the model
export default GrokModel;
