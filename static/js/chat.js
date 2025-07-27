// Khet.ai - Chat Functionality

document.addEventListener('DOMContentLoaded', function() {
    const chatButton = document.getElementById('chat-button');
    const chatModal = document.getElementById('chat-modal');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    const languageSelect = document.getElementById('language-select');

    let isTyping = false;

    // Toggle chat modal
    chatButton.addEventListener('click', function() {
        chatModal.classList.toggle('hidden');
        if (!chatModal.classList.contains('hidden')) {
            chatInput.focus();
        }
    });

    closeChat.addEventListener('click', function() {
        chatModal.classList.add('hidden');
    });

    // Send message functionality
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isTyping) return;

        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Send to API
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                language: languageSelect.value
            })
        })
        .then(response => response.json())
        .then(data => {
            hideTypingIndicator();
            addMessage(data.response, 'ai');
        })
        .catch(error => {
            hideTypingIndicator();
            addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            console.error('Chat error:', error);
        });
    }

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Add message to chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Typing indicator
    function showTypingIndicator() {
        if (isTyping) return;
        
        isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        isTyping = false;
    }

    // Language change handler
    languageSelect.addEventListener('change', function() {
        const welcomeMessages = {
            'en': 'Hello! I\'m your AI agricultural assistant. How can I help you with your farming needs today?',
            'hi': 'नमस्ते! मैं आपका AI कृषि सहायक हूँ। आज मैं आपकी खेती की जरूरतों में कैसे मदद कर सकता हूँ?'
        };
        
        // Clear messages and show welcome message in selected language
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    ${welcomeMessages[this.value]}
                </div>
            </div>
        `;
    });

    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (!chatModal.contains(e.target) && !chatButton.contains(e.target)) {
            chatModal.classList.add('hidden');
        }
    });

    // Prevent closing when clicking inside chat modal
    chatModal.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// Add CSS for typing indicator
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 0.25rem;
        align-items: center;
    }

    .typing-dots span {
        width: 0.5rem;
        height: 0.5rem;
        background-color: #9ca3af;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
    .typing-dots span:nth-child(3) { animation-delay: 0s; }

    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);