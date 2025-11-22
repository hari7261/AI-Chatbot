class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.suggestionsContainer = document.createElement('div');
        
        // Add suggestions container after chat messages
        this.chatMessages.parentNode.insertBefore(
            this.suggestionsContainer, 
            this.chatMessages.nextSibling
        );
        
        this.setupEventListeners();
        this.addWelcomeMessage();
        
        // Add API configuration
        this.API_KEY = ';
        this.API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
    }

    // Update the suggestions array with icons and shorter text
    suggestions = [
        { text: "AI in daily life", icon: "🤖" },
        { text: "Explain ML simply", icon: "🧠" },
        { text: "Write a story", icon: "📝" },
        { text: "Math help", icon: "🔢" },
        { text: "Productivity tips", icon: "⚡" }
    ];

    showSuggestions() {
        this.suggestionsContainer.innerHTML = '';
        this.suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'suggestion-button';
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.textContent = suggestion.icon;
            
            const text = document.createElement('span');
            text.textContent = suggestion.text;
            
            button.appendChild(icon);
            button.appendChild(text);
            
            button.addEventListener('click', (e) => {
                // Add ripple effect
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                ripple.style.left = (e.clientX - rect.left) + 'px';
                ripple.style.top = (e.clientY - rect.top) + 'px';
                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                // Handle click
                this.userInput.value = suggestion.text;
                this.handleUserInput();
            });
            
            this.suggestionsContainer.appendChild(button);
        });
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleUserInput());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        // Auto-resize textarea
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    addWelcomeMessage() {
        const welcomeMessage = "Hello! I'm your AI assistant. How can I help you today?";
        this.addMessage(welcomeMessage, 'bot');
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (message) {
            this.addMessage(message, 'user');
            await this.processUserMessage(message);
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
        }
    }

    async processUserMessage(message) {
        this.showTypingIndicator();
        try {
            const response = await this.generateGeminiResponse(message);
            this.removeTypingIndicator();
            if (response) {
                this.addMessage(response, 'bot');
            } else {
                this.addMessage("I apologize, but I couldn't generate a response. Please try again.", 'bot');
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage("I apologize, but I encountered an error. Please try again.", 'bot');
        }
    }

    async generateGeminiResponse(message) {
        const requestBody = {
            contents: [{
                role: "user",
                parts: [{ text: message }]
            }]
        };

        try {
            const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Unexpected API response structure:', data);
                return null;
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            throw error;
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Handle markdown or code blocks if present
        if (sender === 'bot') {
            // Basic markdown handling
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code>$1</code>')
                      .replace(/\n/g, '<br>');
            messageDiv.innerHTML = text;
        } else {
            messageDiv.textContent = text;
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
        typingDiv.id = 'typingIndicator';
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();

}); 
