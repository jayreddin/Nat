/**
 * OpenAI o3-mini Integration (via OpenRouter)
 * 
 * This file contains the functions and configurations for communicating
 * with OpenAI's o3-mini model through the Puter API via OpenRouter.
 */

const O3MiniModel = {
    name: "OpenAI o3-mini",
    provider: "OpenAI (via OpenRouter)",
    description: "Efficient and capable model for general-purpose text generation and assistance.",
    maxTokens: 4096,
    defaultParams: {
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    },
    
    /**
     * Sends a message to the OpenAI o3-mini model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelOptions = {
                ...options,
                model: 'openrouter:openai/o3-mini'
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.message?.content || response;
        } catch (error) {
            console.error("Error sending message to o3-mini:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the OpenAI o3-mini model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const streamOptions = {
                ...options,
                model: 'openrouter:openai/o3-mini',
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from o3-mini:", error);
            throw error;
        }
    },
    
    /**
     * Creates an interactive content generator with o3-mini
     * @param {string} contentType - Type of content to generate (e.g., 'recipe', 'study', 'business', 'data')
     * @param {Object} params - Parameters specific to the content type
     * @returns {Promise<string>} - The generated content
     */
    async createContentGenerator(contentType, params = {}) {
        let prompt = '';
        
        switch (contentType.toLowerCase()) {
            case 'recipe':
                const { ingredients, dietary, mealType } = params;
                const dietaryRestriction = dietary ? `The recipe must be ${dietary}.` : "";
                const mealTypeReq = mealType ? `This should be a ${mealType} recipe.` : "";
                
                prompt = `Create a recipe using these ingredients: ${ingredients}.
${dietaryRestriction}
${mealTypeReq}
Format the recipe with a title, ingredients list with measurements, and clear step-by-step instructions.`;
                break;
                
            case 'study':
                const { subject, level, question } = params;
                prompt = `I'm studying ${subject} at a ${level} level. ${question}
                
Please explain this concept thoroughly but clearly. Use analogies where helpful.`;
                break;
                
            case 'business':
                const { businessType, industry, details, tone } = params;
                prompt = `Generate ${businessType} for the ${industry} industry with a ${tone} tone.

Include the following key points/details:
${details}

Make sure the content is professional, well-structured, and ready to use.`;
                break;
                
            case 'data':
                const { data, analysisOptions, context } = params;
                const options = analysisOptions.map(option => '- ' + option).join('\n');
                
                prompt = `Analyze the following data:

${data}

${context ? 'Additional context: ' + context + '\n\n' : ''}

Please perform the following analysis:
${options}

Provide your analysis in a clear, structured format with headings for each section.`;
                break;
                
            default:
                prompt = message;
        }
        
        try {
            let fullResponse = '';
            await this.streamMessage(prompt, (chunk) => {
                fullResponse += chunk;
            });
            return fullResponse;
        } catch (error) {
            console.error("Error in content generator:", error);
            throw error;
        }
    },
    
    /**
     * Example usage of the OpenAI o3-mini model
     * @param {string} message - Message to send
     * @param {boolean} useStreaming - Whether to use streaming
     * @returns {Promise<string|void>} - The complete response if not streaming
     */
    async example(message = "Explain how electric cars work in simple terms", useStreaming = false) {
        if (useStreaming) {
            // Example with streaming
            console.log("=== o3-mini Streaming Response ===");
            let fullResponse = '';
            await this.streamMessage(message, (chunk) => {
                fullResponse += chunk;
                console.log("Received chunk:", chunk);
            });
            return fullResponse;
        } else {
            // Example without streaming
            console.log("=== o3-mini Response ===");
            const response = await this.sendMessage(message);
            console.log("Full response:", response);
            return response;
        }
    },
    
    /**
     * Demo Recipe Generator using o3-mini
     * @param {string} ingredients - List of ingredients
     * @param {string} dietary - Dietary restriction (e.g., 'vegetarian', 'vegan')
     * @param {string} mealType - Type of meal (e.g., 'breakfast', 'dinner')
     * @returns {Promise<string>} - Generated recipe
     */
    async generateRecipe(ingredients, dietary = '', mealType = '') {
        return this.createContentGenerator('recipe', {
            ingredients,
            dietary,
            mealType
        });
    },
    
    /**
     * Demo Study Assistant using o3-mini
     * @param {string} subject - Study subject
     * @param {string} level - Study level
     * @param {string} question - Question to answer
     * @returns {Promise<string>} - Educational explanation
     */
    async generateStudyExplanation(subject, level, question) {
        return this.createContentGenerator('study', {
            subject,
            level,
            question
        });
    },
    
    /**
     * Demo Business Content Generator using o3-mini
     * @param {string} businessType - Type of business content
     * @param {string} industry - Industry sector
     * @param {string} details - Content details
     * @param {string} tone - Tone of the content
     * @returns {Promise<string>} - Generated business content
     */
    async generateBusinessContent(businessType, industry, details, tone = 'formal') {
        return this.createContentGenerator('business', {
            businessType,
            industry,
            details,
            tone
        });
    }
};

// Export the model
export default O3MiniModel;
