/**
 * Codestral Integration
 * 
 * This file contains the functions and configurations for communicating
 * with Anthropic's Codestral model through the Puter API.
 */

const CodestralModel = {
    name: "Codestral",
    provider: "Anthropic",
    description: "Specialized model for code generation, explanation, review, debugging, and testing.",
    maxTokens: 32768,
    defaultParams: {
        temperature: 0.7,
        top_p: 1
    },
    
    /**
     * Sends a message to the Codestral model
     * @param {string} message - The user message to send to the model
     * @param {Object} options - Additional options for the request
     * @returns {Promise<object>} - The model's response
     */
    async sendMessage(message, options = {}) {
        try {
            const modelOptions = {
                ...options,
                model: 'codestral-latest'
            };
            
            const response = await puter.ai.chat(message, modelOptions);
            return response.text || response;
        } catch (error) {
            console.error("Error sending message to Codestral:", error);
            throw error;
        }
    },
    
    /**
     * Streams a response from the Codestral model
     * @param {string} message - The user message to send to the model
     * @param {function} onChunk - Callback function for each chunk of the response
     * @param {Object} options - Additional options for the request
     * @returns {Promise<void>}
     */
    async streamMessage(message, onChunk, options = {}) {
        try {
            const streamOptions = {
                ...options,
                model: 'codestral-latest',
                stream: true
            };
            
            const response = await puter.ai.chat(message, streamOptions);
            
            for await (const part of response) {
                if (onChunk && typeof onChunk === 'function') {
                    onChunk(part?.text || '');
                }
            }
        } catch (error) {
            console.error("Error streaming message from Codestral:", error);
            throw error;
        }
    },
    
    /**
     * Generates code based on the provided description
     * @param {string} description - Description of the code to generate
     * @param {string} language - Programming language (optional)
     * @returns {Promise<string>} - Generated code
     */
    async generateCode(description, language = '') {
        const languageSpec = language ? ` in ${language}` : '';
        const prompt = `Write code${languageSpec} for the following:
${description}`;
        
        return this.sendMessage(prompt);
    },
    
    /**
     * Explains the provided code
     * @param {string} code - Code to explain
     * @param {string} language - Programming language (optional)
     * @returns {Promise<string>} - Code explanation
     */
    async explainCode(code, language = '') {
        const languageSpec = language ? ` ${language}` : '';
        const prompt = `Explain this${languageSpec} code:

\`\`\`
${code}
\`\`\``;
        
        return this.sendMessage(prompt);
    },
    
    /**
     * Reviews the provided code and provides feedback
     * @param {string} code - Code to review
     * @param {Object} options - Review options
     * @param {boolean} options.checkBugs - Check for bugs/issues
     * @param {boolean} options.suggestImprovements - Suggest improvements
     * @param {boolean} options.checkBestPractices - Check best practices
     * @returns {Promise<string>} - Code review
     */
    async reviewCode(code, options = {}) {
        const {
            checkBugs = true,
            suggestImprovements = true,
            checkBestPractices = true
        } = options;
        
        let reviewItems = [];
        if (checkBugs) reviewItems.push('Potential issues or bugs');
        if (suggestImprovements) reviewItems.push('Suggestions for improvement');
        if (checkBestPractices) reviewItems.push('Best practices that could be applied');
        
        const reviewPoints = reviewItems.map((item, i) => `${i + 2}. ${item}`).join('\n');
        
        const prompt = `
Please review this code and provide:
1. A brief explanation of what the code does
${reviewPoints}

Here's the code:

\`\`\`
${code}
\`\`\``;
        
        return this.sendMessage(prompt);
    },
    
    /**
     * Debugs the provided code with optional error message
     * @param {string} code - Code to debug
     * @param {string} errorMessage - Error message (optional)
     * @returns {Promise<string>} - Debugging help
     */
    async debugCode(code, errorMessage = '') {
        const errorPart = errorMessage 
            ? `Here is the error message:\n\n${errorMessage}\n\n` 
            : '';
        
        const prompt = `
Please help debug this code. ${errorMessage ? 'Here is the error message:' : ''}

${errorPart}Here's the code:

\`\`\`
${code}
\`\`\`

Please provide:
1. Identification of the issue(s)
2. Explanation of what's causing the problem
3. Suggested fix with corrected code
4. Tips to prevent similar issues in the future`;
        
        return this.sendMessage(prompt);
    },
    
    /**
     * Generates tests for the provided code
     * @param {string} code - Code to generate tests for
     * @param {string} framework - Testing framework (e.g., 'Jest', 'Mocha')
     * @returns {Promise<string>} - Generated tests
     */
    async generateTests(code, framework = 'Jest') {
        const prompt = `Generate ${framework} test cases for this code:

\`\`\`
${code}
\`\`\`

Please create comprehensive tests that cover:
1. Normal use cases
2. Edge cases
3. Error handling`;
        
        return this.sendMessage(prompt);
    },
    
    /**
     * Creates a code review interface
     * @param {Object} options - Interface options
     * @param {HTMLElement} options.codeInput - Element for code input
     * @param {HTMLElement} options.resultDisplay - Element to display results
     * @returns {Object} - Review interface methods
     */
    createReviewInterface(options = {}) {
        const { codeInput, resultDisplay } = options;
        
        if (!codeInput || !resultDisplay) {
            throw new Error('Must provide codeInput and resultDisplay elements');
        }
        
        const reviewCode = async (reviewOptions = {}) => {
            const code = codeInput.value.trim();
            if (!code) return;
            
            resultDisplay.innerHTML = 'Analyzing code...';
            
            try {
                let fullResponse = '';
                await this.streamMessage(
                    this.createReviewPrompt(code, reviewOptions), 
                    (chunk) => {
                        fullResponse += chunk;
                        resultDisplay.innerHTML = fullResponse;
                    }
                );
            } catch (error) {
                resultDisplay.innerHTML = `Error analyzing code: ${error.message}`;
            }
        };
        
        return {
            reviewCode,
            explainCode: async () => {
                const code = codeInput.value.trim();
                if (!code) return;
                
                resultDisplay.innerHTML = 'Explaining code...';
                
                try {
                    let fullResponse = '';
                    await this.streamMessage(
                        `Explain this code:\n\n\`\`\`\n${code}\n\`\`\``, 
                        (chunk) => {
                            fullResponse += chunk;
                            resultDisplay.innerHTML = fullResponse;
                        }
                    );
                } catch (error) {
                    resultDisplay.innerHTML = `Error explaining code: ${error.message}`;
                }
            },
            generateTests: async (framework = 'Jest') => {
                const code = codeInput.value.trim();
                if (!code) return;
                
                resultDisplay.innerHTML = `Generating ${framework} tests...`;
                
                try {
                    let fullResponse = '';
                    await this.streamMessage(
                        `Generate ${framework} test cases for this code:\n\n\`\`\`\n${code}\n\`\`\``, 
                        (chunk) => {
                            fullResponse += chunk;
                            resultDisplay.innerHTML = fullResponse;
                        }
                    );
                } catch (error) {
                    resultDisplay.innerHTML = `Error generating tests: ${error.message}`;
                }
            }
        };
    },
    
    /**
     * Creates a debugging interface
     * @param {Object} options - Interface options
     * @param {HTMLElement} options.codeInput - Element for code input
     * @param {HTMLElement} options.errorInput - Element for error input (optional)
     * @param {HTMLElement} options.resultDisplay - Element to display results
     * @returns {Object} - Debugging interface methods
     */
    createDebugInterface(options = {}) {
        const { codeInput, errorInput, resultDisplay } = options;
        
        if (!codeInput || !resultDisplay) {
            throw new Error('Must provide codeInput and resultDisplay elements');
        }
        
        const debugCode = async () => {
            const code = codeInput.value.trim();
            if (!code) return;
            
            const error = errorInput ? errorInput.value.trim() : '';
            
            resultDisplay.innerHTML = 'Analyzing...';
            
            try {
                let fullResponse = '';
                await this.streamMessage(
                    this.createDebugPrompt(code, error), 
                    (chunk) => {
                        fullResponse += chunk;
                        resultDisplay.innerHTML = fullResponse;
                    }
                );
            } catch (error) {
                resultDisplay.innerHTML = `Error debugging code: ${error.message}`;
            }
        };
        
        return { debugCode };
    },
    
    /**
     * Helper method to create review prompt
     * @private
     */
    createReviewPrompt(code, options = {}) {
        const {
            checkBugs = true,
            suggestImprovements = true,
            checkBestPractices = true
        } = options;
        
        let reviewItems = [];
        if (checkBugs) reviewItems.push('Potential issues or bugs');
        if (suggestImprovements) reviewItems.push('Suggestions for improvement');
        if (checkBestPractices) reviewItems.push('Best practices that could be applied');
        
        const reviewPoints = reviewItems.map((item, i) => `${i + 2}. ${item}`).join('\n');
        
        return `
Please review this code and provide:
1. A brief explanation of what the code does
${reviewPoints}

Here's the code:

\`\`\`
${code}
\`\`\``;
    },
    
    /**
     * Helper method to create debug prompt
     * @private
     */
    createDebugPrompt(code, errorMessage = '') {
        const errorPart = errorMessage 
            ? `Here is the error message:\n\n${errorMessage}\n\n` 
            : '';
        
        return `
Please help debug this code. ${errorMessage ? 'Here is the error message:' : ''}

${errorPart}Here's the code:

\`\`\`
${code}
\`\`\`

Please provide:
1. Identification of the issue(s)
2. Explanation of what's causing the problem
3. Suggested fix with corrected code
4. Tips to prevent similar issues in the future`;
    },
    
    /**
     * Example usage of the Codestral model
     * @param {string} codeDescription - Description for code generation
     * @returns {Promise<string>} - Generated code
     */
    async example(codeDescription = "Write a React component for a todo list item with a checkbox and delete button") {
        console.log("=== Codestral Code Generation Example ===");
        const response = await this.generateCode(codeDescription);
        console.log(response);
        return response;
    }
};

// Export the model
export default CodestralModel;
