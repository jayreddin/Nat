/**
 * OpenAI o1-mini Integration (via OpenRouter)
 * 
 * This file contains the functions and configurations for communicating
 * with OpenAI's o1-mini model through the Puter API via OpenRouter.
 */

const O1MiniModel = {
    name: "OpenAI o1-mini",
    provider: "OpenAI (via OpenRouter)",
    description: "Compact and efficient model with strong reasoning capabilities for logic, math, and decision-making tasks.",
    maxTokens: 4096,
    defaultParams: {
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    },
    
    /**
     * Sends a message to the OpenAI o1-mini model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelOptions = {
                ...options,
                model: 'openrouter:openai/o1-mini'
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.message?.content || response;
        } catch (error) {
            console.error("Error sending message to o1-mini:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the OpenAI o1-mini model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const streamOptions = {
                ...options,
                model: 'openrouter:openai/o1-mini',
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from o1-mini:", error);
            throw error;
        }
    },
    
    /**
     * Creates an interactive reasoning task with o1-mini
     * @param {string} reasoningType - Type of reasoning task (e.g., 'logic', 'math', 'learning', 'decision')
     * @param {Object} params - Parameters specific to the reasoning type
     * @returns {Promise<string>} - The generated reasoning output
     */
    async createReasoningTask(reasoningType, params = {}) {
        let prompt = '';
        
        switch (reasoningType.toLowerCase()) {
            case 'logic':
                const { puzzle } = params;
                prompt = `Solve this logic puzzle step by step: ${puzzle}`;
                break;
                
            case 'math':
                const { problem } = params;
                prompt = `Calculate the following mathematical problem. Show your work step by step:
${problem}

Break down your approach clearly, showing each step of the calculation.`;
                break;
                
            case 'learning':
                const { topic, question } = params;
                prompt = `I'm studying ${topic} and have the following question: ${question}. 
Please provide a clear, educational explanation appropriate for a student.`;
                break;
                
            case 'decision':
                const { scenario } = params;
                prompt = `
Generate a decision tree for the following scenario: "${scenario}"

Format the decision tree with the following:
1. State the core decision as the main node
2. Identify 2-3 primary branches (options)
3. For each option, list:
   - Key considerations
   - Potential outcomes
   - Secondary decisions that might arise
4. Include a brief analysis of the trade-offs for each major branch

Present the decision tree in a structured, easy-to-follow format.`;
                break;
                
            default:
                prompt = params.prompt || '';
        }
        
        try {
            let fullResponse = '';
            await this.streamMessage(prompt, (chunk) => {
                fullResponse += chunk;
            });
            return fullResponse;
        } catch (error) {
            console.error("Error in reasoning task:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the OpenAI o1-mini model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "Explain the basics of artificial intelligence", useStreaming = false) {
        if (useStreaming) {
            // Example with streaming
            console.log("=== o1-mini Streaming Response ===");
            let fullResponse = '';
            await this.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                console.log("Received chunk:", chunk);
            });
            return fullResponse;
        } else {
            // Example without streaming
            console.log("=== o1-mini Response ===");
            const response = await this.sendMessage(message);
            console.log("Full response:", response);
            return response;
        }
    },
    
    /**
     * Solve a logic puzzle using o1-mini's reasoning
     * @param {string} puzzle - The logic puzzle to solve
     * @returns {Promise<string>} - Step-by-step solution
     */
    async solveLogicPuzzle(puzzle) {
        return this.createReasoningTask('logic', { puzzle });
    },
    
    /**
     * Solve a mathematical problem using o1-mini's reasoning
     * @param {string} problem - The math problem to solve
     * @returns {Promise<string>} - Step-by-step solution
     */
    async solveMathProblem(problem) {
        return this.createReasoningTask('math', { problem });
    },
    
    /**
     * Generate an educational explanation using o1-mini
     * @param {string} topic - The academic subject
     * @param {string} question - The specific question about the topic
     * @returns {Promise<string>} - Educational explanation
     */
    async createEducationalExplanation(topic, question) {
        return this.createReasoningTask('learning', { topic, question });
    },
    
    /**
     * Generate a decision tree for a scenario
     * @param {string} scenario - The decision-making scenario
     * @returns {Promise<string>} - Structured decision tree
     */
    async generateDecisionTree(scenario) {
        return this.createReasoningTask('decision', { scenario });
    }
};

// Export the model
export default O1MiniModel;
