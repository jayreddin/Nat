document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const addModelBtn = document.querySelector('.add-model-btn');
    const modelCards = document.querySelectorAll('.model-card');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');
    const signInBtn = document.querySelector('.sign-in');
    const userDropdown = document.querySelector('.user-dropdown');
    const signOutBtn = document.querySelector('.sign-out');
    const headerSignOutBtn = document.querySelector('.sign-out-btn');
    const usernameDisplay = document.querySelector('.username');
    const environmentDisplay = document.querySelector('.environment-type');
    const themeToggleBtn = document.querySelector('.theme-toggle-btn');
    const modelsGrid = document.querySelector('.models-grid');
    const chatContainer = document.querySelector('.chat-container');
    const messagesContainer = document.querySelector('.messages-container');
    
    // New button elements
    const newChatBtn = document.querySelector('.new-chat-btn');
    const historyBtn = document.querySelector('.history-btn');
    const imageBtn = document.querySelector('.image-btn');
    const ocrBtn = document.querySelector('.ocr-btn');
    const settingsBtn = document.querySelector('.settings-btn');
    
    // Model selection elements
    const modelSelectionOverlay = document.querySelector('.model-selection-overlay');
    const modelSelectionClose = document.querySelector('.model-selection-close');
    const modelItems = document.querySelectorAll('.model-item');
    const activeModelName = document.querySelector('.active-model-name');
    const activeModelDisplay = document.querySelector('.active-model-display');
    
    // Current active model
    let activeModel = 'gpt-4o-mini';
    let chatActive = false;
    
    // Track dropdown state
    let dropdownVisible = false;
    
    // Check for mobile view
    const isMobile = () => window.innerWidth <= 480;
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    function handleResize() {
        // Adjust UI based on screen size
        if (isMobile()) {
            // Mobile-specific adjustments if needed
        } else {
            // Desktop-specific adjustments if needed
        }
    }
    
    // Initialize with correct sizing
    handleResize();
    
    // Theme toggle functionality
    let darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Initialize theme based on localStorage
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggleBtn.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    // Toggle theme
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            darkMode = !darkMode;
            
            if (darkMode) {
                document.body.classList.add('dark-theme');
                themeToggleBtn.classList.add('dark-mode');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            } else {
                document.body.classList.remove('dark-theme');
                themeToggleBtn.classList.remove('dark-mode');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            }
            
            // Save preference to localStorage
            localStorage.setItem('darkMode', darkMode);
        });
    }
    
    // Set environment information
    if (environmentDisplay) {
        environmentDisplay.textContent = puter.env || 'web';
    }
    
    // Check if user is already signed in
    checkAuthStatus();
    
    // Add Puter auth functionality to sign-in button
    if (signInBtn) {
        signInBtn.addEventListener('click', async () => {
            if (!puter.auth.isSignedIn()) {
                try {
                    await puter.auth.signIn();
                    checkAuthStatus();
                } catch (error) {
                    console.error('Authentication failed:', error);
                }
            } else {
                // Toggle dropdown if already signed in
                toggleDropdown();
            }
        });
    }
    
    // Show model selection popup
    if (addModelBtn) {
        addModelBtn.addEventListener('click', () => {
            modelSelectionOverlay.style.display = 'block';
            setTimeout(() => {
                modelSelectionOverlay.style.opacity = '1';
            }, 10);
        });
    }
    
    // Close model selection popup
    if (modelSelectionClose) {
        modelSelectionClose.addEventListener('click', closeModelSelector);
    }
    
    // Close model selection when clicking outside
    modelSelectionOverlay.addEventListener('click', (e) => {
        if (e.target === modelSelectionOverlay) {
            closeModelSelector();
        }
    });
    
    // Model selection functionality
    modelItems.forEach(item => {
        item.addEventListener('click', () => {
            const modelName = item.getAttribute('data-model');
            const modelProvider = item.getAttribute('data-provider');
            
            // Update active model
            activeModel = modelName;
            
            // Update UI
            activeModelName.textContent = modelName;
            if (activeModelDisplay) {
                activeModelDisplay.textContent = modelName;
            }
            
            // Remove active class from all items
            modelItems.forEach(mi => mi.classList.remove('active'));
            
            // Add active class to selected item
            item.classList.add('active');
            
            // Close the selector
            closeModelSelector();
            
            console.log(`Selected model: ${modelName} (${modelProvider})`);
        });
    });
    
    // Function to close model selector
    function closeModelSelector() {
        modelSelectionOverlay.style.opacity = '0';
        setTimeout(() => {
            modelSelectionOverlay.style.display = 'none';
        }, 300);
    }
    
    // Function to format current time
    function formatTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Function to add a user message
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message');
        
        // Create message header with username and timestamp
        const headerElement = document.createElement('div');
        headerElement.classList.add('message-header');
        
        const senderElement = document.createElement('span');
        senderElement.classList.add('message-sender');
        senderElement.textContent = 'You';
        
        const timeElement = document.createElement('span');
        timeElement.classList.add('message-header-time');
        timeElement.textContent = formatTime();
        
        headerElement.appendChild(senderElement);
        headerElement.appendChild(timeElement);
        
        // Create message content
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.textContent = message;
        
        // Append elements to message
        messageElement.appendChild(headerElement);
        messageElement.appendChild(contentElement);
        
        // Add to messages container
        const messagesContainer = document.querySelector('.messages-container');
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Function to send a message to the selected model
    function sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (message) {
            // Add user message to the chat
            addUserMessage(message);
            
            // Clear input field
            messageInput.value = '';
            
            // Get the selected model
            const selectedModel = document.querySelector('.model.selected');
            const modelName = selectedModel ? selectedModel.textContent : 'Assistant';
            
            // Simulate a response (in a real app, this would be an API call)
            setTimeout(() => {
                // Create message element for assistant response
                const assistantMessage = document.createElement('div');
                assistantMessage.classList.add('message', 'assistant-message');
                
                // Create message header with model name and timestamp
                const headerElement = document.createElement('div');
                headerElement.classList.add('message-header');
                
                const senderElement = document.createElement('span');
                senderElement.classList.add('message-sender');
                senderElement.textContent = modelName;
                
                const timeElement = document.createElement('span');
                timeElement.classList.add('message-header-time');
                timeElement.textContent = formatTime();
                
                headerElement.appendChild(senderElement);
                headerElement.appendChild(timeElement);
                
                // Create message content
                const contentElement = document.createElement('div');
                contentElement.classList.add('message-content');
                contentElement.textContent = `This is a simulated response from ${modelName}.`;
                
                // Append elements to message
                assistantMessage.appendChild(headerElement);
                assistantMessage.appendChild(contentElement);
                
                // Add to messages container
                const messagesContainer = document.querySelector('.messages-container');
                messagesContainer.appendChild(assistantMessage);
                
                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }
    }
    
    // Message handling functions
    async function sendMessageToAI() {
        const message = messageInput.value.trim();
        if (!message) return;
        
        // Show chat and hide model cards if not already shown
        if (!chatActive) {
            showChat();
        }
        
        // Add user message to UI
        addUserMessage(message);
        
        // Clear input
        messageInput.value = '';
        
        // Add loading indicator
        const loadingMessageId = addLoadingMessage();
        
        // Create messages array for history if it doesn't exist yet
        let currentMessages = [];
        
        // Add user message to history
        currentMessages.push({
            sender: 'user',
            content: message,
            time: getFormattedTime(),
            timestamp: new Date().toISOString()
        });
        
        try {
            // Get AI response
            const response = await puter.ai.chat(message, {
                model: activeModel,
                stream: true
            });
            
            // Remove loading indicator
            removeLoadingMessage(loadingMessageId);
            
            // Create assistant message element
            const assistantMsgEl = document.createElement('div');
            assistantMsgEl.className = 'message assistant-message';
            
            // Add message header with model name and timestamp
            const headerEl = document.createElement('div');
            headerEl.className = 'message-header';
            
            const modelNameEl = document.createElement('span');
            modelNameEl.className = 'message-sender';
            modelNameEl.textContent = activeModel;
            headerEl.appendChild(modelNameEl);
            
            const msgTime = getFormattedTime();
            const headerTimeEl = document.createElement('span');
            headerTimeEl.className = 'message-header-time';
            headerTimeEl.textContent = msgTime;
            headerEl.appendChild(headerTimeEl);
            
            assistantMsgEl.appendChild(headerEl);
            
            const contentEl = document.createElement('div');
            contentEl.className = 'message-content';
            assistantMsgEl.appendChild(contentEl);
            
            // Add to messages
            messagesContainer.appendChild(assistantMsgEl);
            
            // Stream the response
            let fullResponse = '';
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    // Convert newlines to <p> tags
                    contentEl.innerHTML = formatMessageContent(fullResponse);
                    // Scroll to bottom
                    scrollToBottom();
                }
            }
            
            // Add assistant message to history
            currentMessages.push({
                sender: 'assistant',
                content: fullResponse,
                model: activeModel,
                time: msgTime,
                timestamp: new Date().toISOString()
            });
            
            // Save to chat history
            saveChatHistory({
                timestamp: new Date().toISOString(),
                firstMessage: message,
                messages: currentMessages
            });
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            removeLoadingMessage(loadingMessageId);
            
            // Add error message
            const errorMsgEl = document.createElement('div');
            errorMsgEl.className = 'message assistant-message error';
            errorMsgEl.innerHTML = `<div class="message-content"><p>Sorry, I encountered an error: ${error.message}</p></div>`;
            messagesContainer.appendChild(errorMsgEl);
        }
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    function addLoadingMessage() {
        const id = 'loading-' + Date.now();
        const loadingEl = document.createElement('div');
        loadingEl.className = 'message assistant-message';
        loadingEl.id = id;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-loading';
        contentEl.innerHTML = `
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        `;
        loadingEl.appendChild(contentEl);
        
        messagesContainer.appendChild(loadingEl);
        scrollToBottom();
        
        return id;
    }
    
    function removeLoadingMessage(id) {
        const loadingEl = document.getElementById(id);
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    function formatMessageContent(text) {
        // Convert newlines to paragraphs
        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line}</p>`)
            .join('');
    }
    
    function getFormattedTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function showChat() {
        chatActive = true;
        modelsGrid.style.display = 'none';
        chatContainer.style.display = 'flex';
        
        // Update welcome message with current model
        if (activeModelDisplay) {
            activeModelDisplay.textContent = activeModel;
        }
    }
    
    // Handle send button click
    if (sendBtn && messageInput) {
        sendBtn.addEventListener('click', sendMessageToAI);
    }
    
    // Handle Enter key in message input
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessageToAI();
            }
        });
    }
    
    // Handle sign out button click in dropdown
    if (signOutBtn) {
        signOutBtn.addEventListener('click', handleSignOut);
    }
    
    // Handle sign out button click in header
    if (headerSignOutBtn) {
        headerSignOutBtn.addEventListener('click', handleSignOut);
    }
    
    // Sign out handler function
    function handleSignOut() {
        puter.auth.signOut();
        checkAuthStatus();
        hideDropdown();
    }
    
    // Function to toggle dropdown visibility
    function toggleDropdown() {
        if (dropdownVisible) {
            hideDropdown();
        } else {
            showDropdown();
        }
    }
    
    // Function to show dropdown
    function showDropdown() {
        // Position the dropdown relative to the sign-in button
        const signInRect = signInBtn.getBoundingClientRect();
        userDropdown.style.top = (signInRect.bottom + window.scrollY) + 'px';
        userDropdown.style.right = (window.innerWidth - signInRect.right) + 'px';
        
        userDropdown.style.display = 'block';
        dropdownVisible = true;
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeDropdownOnClickOutside);
        }, 0);
    }
    
    // Function to hide dropdown
    function hideDropdown() {
        userDropdown.style.display = 'none';
        dropdownVisible = false;
        document.removeEventListener('click', closeDropdownOnClickOutside);
    }
    
    // Close dropdown when clicking outside
    function closeDropdownOnClickOutside(event) {
        if (!userDropdown.contains(event.target) && !signInBtn.contains(event.target)) {
            hideDropdown();
        }
    }
    
    // Function to check authentication status and update UI
    async function checkAuthStatus() {
        if (puter.auth.isSignedIn()) {
            try {
                const user = await puter.auth.getUser();
                signInBtn.textContent = user.username;
                signInBtn.classList.add('signed-in');
                
                // Show sign out button in header
                if (headerSignOutBtn) {
                    headerSignOutBtn.classList.add('visible');
                }
                
                // Update dropdown username
                if (usernameDisplay) {
                    usernameDisplay.textContent = user.username;
                }
                
                console.log('User info:', user);
            } catch (error) {
                console.error('Error getting user info:', error);
            }
        } else {
            signInBtn.textContent = 'Sign in';
            signInBtn.classList.remove('signed-in');
            
            // Hide sign out button in header
            if (headerSignOutBtn) {
                headerSignOutBtn.classList.remove('visible');
            }
            
            hideDropdown();
        }
    }
    
    // Add click effect to buttons
    const buttons = [addModelBtn, sendBtn];
    buttons.forEach(btn => {
        if (btn) {
            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'scale(0.98)';
            });
            
            btn.addEventListener('mouseup', () => {
                btn.style.transform = 'scale(1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        }
    });
    
    // Add hover effect to model cards
    modelCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            card.style.borderColor = '#aaa';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = 'none';
            card.style.borderColor = '#ddd';
        });
        
        card.addEventListener('click', () => {
            // Simple animation to show selection
            card.style.backgroundColor = '#f8f8f8';
            setTimeout(() => {
                card.style.backgroundColor = '#fff';
            }, 200);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd+K or Ctrl+K for add model popup
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            addModelBtn.click();
        }
        
        // Escape key to close model selection popup
        if (e.key === 'Escape') {
            if (modelSelectionOverlay.style.display === 'block') {
                closeModelSelector();
            }
        }
    });
    
    // Update the add model button text to remove shortcut
    if (addModelBtn) {
        // Remove the shortcut key span from the button
        const shortcutSpan = addModelBtn.querySelector('.shortcut-key');
        if (shortcutSpan) {
            shortcutSpan.remove();
        }
    }
    
    // Remove any existing welcome messages
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Remove shortcut key text from the "Add Model" button
    const addModelButton = document.querySelector('.add-model-button');
    if (addModelButton) {
        const shortcutSpan = addModelButton.querySelector('.shortcut');
        if (shortcutSpan) {
            shortcutSpan.remove();
        } else {
            // If there's no dedicated span, just remove the shortcut text
            addModelButton.textContent = "+ Add Model";
        }
    }
    
    // New button event handlers
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            // Set active state
            setActiveHeaderButton(newChatBtn);
            
            // Clear chat and start new conversation
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            // Show chat if not already visible
            showChat();
        });
    }
    
    // History button handler
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            setActiveHeaderButton(historyBtn);
            showPopup('history-popup-overlay');
            loadChatHistory();
        });
    }
    
    // Image button handler
    if (imageBtn) {
        imageBtn.addEventListener('click', () => {
            setActiveHeaderButton(imageBtn);
            showPopup('image-popup-overlay');
        });
    }
    
    // OCR button handler
    if (ocrBtn) {
        ocrBtn.addEventListener('click', () => {
            setActiveHeaderButton(ocrBtn);
            showPopup('ocr-popup-overlay');
        });
    }
    
    // Settings button handler
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            setActiveHeaderButton(settingsBtn);
            showPopup('settings-popup-overlay');
        });
    }
    
    // Function to show popup
    function showPopup(popupClass) {
        const popup = document.querySelector(`.${popupClass}`);
        if (popup) {
            popup.style.display = 'block';
            setTimeout(() => {
                popup.style.opacity = '1';
            }, 10);
            
            // Add close functionality
            const closeBtn = popup.querySelector('.popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closePopup(popupClass), { once: true });
            }
            
            // Close when clicking outside
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    closePopup(popupClass);
                }
            }, { once: true });
        }
    }
    
    // Function to close popup
    function closePopup(popupClass) {
        const popup = document.querySelector(`.${popupClass}`);
        if (popup) {
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300);
        }
    }
    
    // Helper function to set active header button
    function setActiveHeaderButton(activeButton) {
        const headerButtons = document.querySelectorAll('.header-btn');
        headerButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    // Set new chat as active by default
    if (newChatBtn) {
        setActiveHeaderButton(newChatBtn);
    }
    
    // Chat history management
    let chatHistory = [];
    
    // Load chat history from localStorage
    function loadChatHistory() {
        try {
            const savedHistory = localStorage.getItem('chatHistory');
            if (savedHistory) {
                chatHistory = JSON.parse(savedHistory);
            }
            displayChatHistory();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    // Save chat history to localStorage
    function saveChatHistory(historyItem) {
        try {
            // Add new history item
            chatHistory.unshift(historyItem);
            
            // Keep only last 20 chats
            if (chatHistory.length > 20) {
                chatHistory = chatHistory.slice(0, 20);
            }
            
            localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    // Display chat history in the popup
    function displayChatHistory() {
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            historyList.innerHTML = '';
            
            if (chatHistory.length === 0) {
                historyList.innerHTML = '<div class="empty-history">No chat history found</div>';
                return;
            }
            
            chatHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const time = document.createElement('div');
                time.className = 'history-item-time';
                time.textContent = new Date(item.timestamp).toLocaleString();
                
                const preview = document.createElement('div');
                preview.className = 'history-item-preview';
                preview.textContent = item.firstMessage || 'Chat session';
                
                historyItem.appendChild(time);
                historyItem.appendChild(preview);
                
                historyItem.addEventListener('click', () => {
                    loadChatFromHistory(item);
                    closePopup('history-popup-overlay');
                });
                
                historyList.appendChild(historyItem);
            });
        }
    }
    
    // Load a chat from history
    function loadChatFromHistory(historyItem) {
        if (messagesContainer && historyItem.messages) {
            messagesContainer.innerHTML = '';
            
            historyItem.messages.forEach(msg => {
                if (msg.sender === 'user') {
                    addUserMessage(msg.content);
                } else {
                    // Create assistant message element
                    const assistantMsgEl = document.createElement('div');
                    assistantMsgEl.className = 'message assistant-message';
                    
                    // Add message header with model name and timestamp
                    const headerEl = document.createElement('div');
                    headerEl.className = 'message-header';
                    
                    const modelNameEl = document.createElement('span');
                    modelNameEl.className = 'message-sender';
                    modelNameEl.textContent = msg.model || activeModel;
                    headerEl.appendChild(modelNameEl);
                    
                    const headerTimeEl = document.createElement('span');
                    headerTimeEl.className = 'message-header-time';
                    headerTimeEl.textContent = msg.time || getFormattedTime();
                    headerEl.appendChild(headerTimeEl);
                    
                    assistantMsgEl.appendChild(headerEl);
                    
                    const contentEl = document.createElement('div');
                    contentEl.className = 'message-content';
                    contentEl.innerHTML = formatMessageContent(msg.content);
                    assistantMsgEl.appendChild(contentEl);
                    
                    messagesContainer.appendChild(assistantMsgEl);
                }
            });
            
            showChat();
            scrollToBottom();
        }
    }
    
    // Image Generation
    const imagePrompt = document.getElementById('image-prompt');
    const imageGenBtn = document.querySelector('.image-gen-btn');
    const imageResult = document.getElementById('image-result');
    const imageAmount = document.getElementById('image-amount');
    const imageSize = document.getElementById('image-size');
    const imageStyle = document.getElementById('image-style');
    
    if (imageGenBtn) {
        imageGenBtn.addEventListener('click', async function() {
            const prompt = imagePrompt.value.trim();
            if (!prompt) {
                alert('Please enter a description for the image');
                return;
            }
            
            // Show loading state
            imageGenBtn.textContent = 'Generating...';
            imageGenBtn.disabled = true;
            
            try {
                // Generate image
                const imageElement = await puter.ai.txt2img(prompt);
                
                // Add to chat as a message
                const messageEl = document.createElement('div');
                messageEl.className = 'message assistant-message image-message';
                
                // Add message header
                const headerEl = document.createElement('div');
                headerEl.className = 'message-header';
                
                const modelNameEl = document.createElement('span');
                modelNameEl.className = 'message-sender';
                modelNameEl.textContent = 'Image Generator';
                headerEl.appendChild(modelNameEl);
                
                const headerTimeEl = document.createElement('span');
                headerTimeEl.className = 'message-header-time';
                headerTimeEl.textContent = getFormattedTime();
                headerEl.appendChild(headerTimeEl);
                
                messageEl.appendChild(headerEl);
                
                // Add content container
                const contentEl = document.createElement('div');
                contentEl.className = 'message-content';
                
                // Add prompt text
                const promptEl = document.createElement('p');
                promptEl.className = 'image-prompt-text';
                promptEl.textContent = `"${prompt}"`;
                contentEl.appendChild(promptEl);
                
                // Add image container
                const imageContainer = document.createElement('div');
                imageContainer.className = 'generated-image-container';
                
                // Clone the image
                const img = document.createElement('img');
                img.src = imageElement.src;
                img.className = 'generated-image thumbnail';
                
                // Make image clickable to expand
                img.addEventListener('click', function() {
                    showImageFullscreen(img.src, prompt);
                });
                
                imageContainer.appendChild(img);
                
                // Add save button
                const saveBtn = document.createElement('button');
                saveBtn.className = 'save-image-btn';
                saveBtn.innerHTML = '<i class="fa-solid fa-download"></i> Save Image';
                saveBtn.addEventListener('click', function() {
                    downloadImage(img.src, 'generated-image.png');
                });
                imageContainer.appendChild(saveBtn);
                
                contentEl.appendChild(imageContainer);
                messageEl.appendChild(contentEl);
                
                // Add to chat
                messagesContainer.appendChild(messageEl);
                scrollToBottom();
                
                // Close the popup
                closePopup('image-popup-overlay');
                
                // Show chat if not already visible
                showChat();
                
            } catch (error) {
                console.error('Image generation error:', error);
                alert('Error generating image: ' + error.message);
            } finally {
                // Reset button
                imageGenBtn.textContent = 'Generate';
                imageGenBtn.disabled = false;
            }
        });
    }
    
    // Function to download image
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // OCR Functionality
    const ocrImageInput = document.getElementById('ocr-image-input');
    const ocrPreview = document.getElementById('ocr-preview');
    const ocrProcessBtn = document.querySelector('.ocr-process-btn');
    const ocrResult = document.getElementById('ocr-result');
    const ocrLanguage = document.getElementById('ocr-language');
    const ocrMode = document.getElementById('ocr-mode');
    
    if (ocrImageInput) {
        ocrImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Show preview container
                const previewContainer = document.querySelector('.ocr-preview-container');
                if (previewContainer) {
                    previewContainer.style.display = 'block';
                }
                
                // Hide result container
                const resultContainer = document.querySelector('.ocr-result-container');
                if (resultContainer) {
                    resultContainer.style.display = 'none';
                }
                
                // Show image preview
                ocrPreview.src = URL.createObjectURL(file);
            }
        });
    }
    
    if (ocrProcessBtn) {
        ocrProcessBtn.addEventListener('click', async function() {
            const file = ocrImageInput.files[0];
            if (!file) {
                alert('Please select an image first');
                return;
            }
            
            // Show loading state
            ocrProcessBtn.textContent = 'Processing...';
            ocrProcessBtn.disabled = true;
            
            try {
                // Convert file to data URL
                const dataUrl = await fileToDataURL(file);
                
                // Process with OCR
                const text = await puter.ai.img2txt(dataUrl);
                
                // Create message element for the OCR result
                const messageEl = document.createElement('div');
                messageEl.className = 'message assistant-message ocr-message';
                
                // Add message header
                const headerEl = document.createElement('div');
                headerEl.className = 'message-header';
                
                const modelNameEl = document.createElement('span');
                modelNameEl.className = 'message-sender';
                modelNameEl.textContent = 'OCR';
                headerEl.appendChild(modelNameEl);
                
                const headerTimeEl = document.createElement('span');
                headerTimeEl.className = 'message-header-time';
                headerTimeEl.textContent = getFormattedTime();
                headerEl.appendChild(headerTimeEl);
                
                messageEl.appendChild(headerEl);
                
                // Add content container
                const contentEl = document.createElement('div');
                contentEl.className = 'message-content';
                
                // Add image and text container
                const ocrContainer = document.createElement('div');
                ocrContainer.className = 'ocr-result-message';
                
                // Add thumbnail of the image
                const imgThumb = document.createElement('img');
                imgThumb.src = dataUrl;
                imgThumb.className = 'ocr-thumb';
                
                // Make image clickable to expand
                imgThumb.addEventListener('click', function() {
                    showImageFullscreen(dataUrl, `Scanned image: ${file.name}`);
                });
                
                ocrContainer.appendChild(imgThumb);
                
                // Add text results
                const textResult = document.createElement('div');
                textResult.className = 'ocr-text-result';
                
                // Add expand/collapse functionality
                const previewText = text.length > 150 ? text.substring(0, 150) + '...' : text;
                textResult.textContent = previewText || 'No text found in image';
                
                // Add click indicator
                const clickIndicator = document.createElement('div');
                clickIndicator.className = 'click-indicator';
                clickIndicator.innerHTML = '<i class="fa-solid fa-expand"></i> Click to view full text';
                textResult.appendChild(clickIndicator);
                
                // Make the text expandable
                textResult.addEventListener('click', function() {
                    showTextPopup(text, file.name);
                });
                
                ocrContainer.appendChild(textResult);
                
                contentEl.appendChild(ocrContainer);
                messageEl.appendChild(contentEl);
                
                // Add to chat
                messagesContainer.appendChild(messageEl);
                scrollToBottom();
                
                // Close the popup
                closePopup('ocr-popup-overlay');
                
                // Show chat if not already visible
                showChat();
                
            } catch (error) {
                console.error('OCR error:', error);
                alert('Error processing image: ' + error.message);
            } finally {
                // Reset button
                ocrProcessBtn.textContent = 'Extract Text';
                ocrProcessBtn.disabled = false;
            }
        });
    }
    
    // Function to show text popup for OCR results
    function showTextPopup(text, filename) {
        // Create popup overlay
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay text-popup-overlay';
        popupOverlay.style.display = 'block';
        popupOverlay.style.opacity = '1';
        
        // Create popup container
        const popupContainer = document.createElement('div');
        popupContainer.className = 'popup-container';
        
        // Create header
        const popupHeader = document.createElement('div');
        popupHeader.className = 'popup-header';
        
        const popupTitle = document.createElement('h3');
        popupTitle.textContent = 'Extracted Text from ' + filename;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'popup-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            closeTextPopup(popupOverlay);
        });
        
        popupHeader.appendChild(popupTitle);
        popupHeader.appendChild(closeBtn);
        
        // Create content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        
        const textArea = document.createElement('textarea');
        textArea.className = 'extracted-text-area';
        textArea.value = text;
        textArea.readOnly = true;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'process-btn';
        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Text';
        copyBtn.addEventListener('click', function() {
            textArea.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Text';
            }, 2000);
        });
        
        popupContent.appendChild(textArea);
        popupContent.appendChild(copyBtn);
        
        // Assemble popup
        popupContainer.appendChild(popupHeader);
        popupContainer.appendChild(popupContent);
        popupOverlay.appendChild(popupContainer);
        
        // Add to body
        document.body.appendChild(popupOverlay);
        
        // Close when clicking outside
        popupOverlay.addEventListener('click', function(e) {
            if (e.target === popupOverlay) {
                closeTextPopup(popupOverlay);
            }
        });
        
        // Disable scrolling on the body when popup is open
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close text popup
    function closeTextPopup(popupOverlay) {
        popupOverlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(popupOverlay);
            // Re-enable scrolling
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Helper function to convert File to data URL
    function fileToDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }
    
    // Settings functionality
    const textSizeSlider = document.getElementById('text-size-slider');
    const textSizeValue = document.getElementById('text-size-value');
    const themeSelect = document.getElementById('theme-select');
    
    if (textSizeSlider && textSizeValue) {
        // Initialize with saved value if exists
        const savedTextSize = localStorage.getItem('textSize');
        if (savedTextSize) {
            textSizeSlider.value = savedTextSize;
            textSizeValue.textContent = `${savedTextSize}px`;
            document.documentElement.style.setProperty('--text-size', `${savedTextSize}px`);
        }
        
        textSizeSlider.addEventListener('input', function() {
            const size = this.value;
            textSizeValue.textContent = `${size}px`;
            document.documentElement.style.setProperty('--text-size', `${size}px`);
            localStorage.setItem('textSize', size);
        });
    }
    
    // Theme selection
    if (themeSelect) {
        // Initialize with saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
        
        themeSelect.addEventListener('change', function() {
            const theme = this.value;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    }
    
    // Function to apply theme
    function applyTheme(theme) {
        // Remove all theme classes first
        document.body.classList.remove('dark-theme', 'grey-theme', 'sunrise-theme', 'multicolor-theme');
        
        // Reset theme toggle button
        if (themeToggleBtn) {
            themeToggleBtn.classList.remove('dark-mode');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
        
        // Apply selected theme
        switch (theme) {
            case 'dark':
                document.body.classList.add('dark-theme');
                darkMode = true;
                if (themeToggleBtn) {
                    themeToggleBtn.classList.add('dark-mode');
                    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                }
                break;
            case 'grey':
                document.body.classList.add('grey-theme');
                break;
            case 'sunrise':
                document.body.classList.add('sunrise-theme');
                break;
            case 'multicolor':
                document.body.classList.add('multicolor-theme');
                break;
            default:
                darkMode = false;
                break;
        }
        
        // Update localStorage
        localStorage.setItem('darkMode', darkMode);
    }
    
    // Add text size variable to root
    document.documentElement.style.setProperty('--text-size', '14px');
    
    // Function to show fullscreen image
    function showImageFullscreen(imageSrc, prompt) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        
        // Create image container
        const container = document.createElement('div');
        container.className = 'fullscreen-container';
        
        // Create image
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'fullscreen-image';
        
        // Create caption with prompt
        const caption = document.createElement('div');
        caption.className = 'fullscreen-caption';
        caption.textContent = prompt ? `"${prompt}"` : '';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'fullscreen-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            closeImageFullscreen(overlay);
        });
        
        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'fullscreen-download';
        downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';
        downloadBtn.addEventListener('click', function() {
            downloadImage(imageSrc, 'generated-image.png');
        });
        
        // Add elements to container
        container.appendChild(closeBtn);
        container.appendChild(img);
        container.appendChild(caption);
        container.appendChild(downloadBtn);
        
        // Add container to overlay
        overlay.appendChild(container);
        
        // Add overlay to body
        document.body.appendChild(overlay);
        
        // Disable scrolling on the body when fullscreen is open
        document.body.style.overflow = 'hidden';
        
        // Close when clicking outside the image
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeImageFullscreen(overlay);
            }
        });
    }
    
    // Function to close fullscreen image
    function closeImageFullscreen(overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(overlay);
            // Re-enable scrolling
            document.body.style.overflow = 'auto';
        }, 300);
    }
}); 