const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.getElementById("send-message");
const greetingMessage = document.getElementById("greeting-message");
const getTimeOfDay = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 12) {
        return "morning"; // 5 AM to 11:59 AM
    } else if (hours >= 12 && hours < 17) {
        return "afternoon"; // 12 PM to 4:59 PM
    } else if (hours >= 17 && hours < 21) {
        return "evening"; // 5 PM to 8:59 PM
    } else {
        return "night"; // 9 PM to 4:59 AM
    }
};

console.log(`It's currently ${getTimeOfDay()}.`);
// API Configuration
const API_KEY = "AIzaSyAfPg74TMqR71M3s-ylYgaLnoLXp6yLh4s";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null 
};
const chatHistory = []
// Function to scroll to bottom of chat
const scrollToBottom = () => {
    chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth"
    });
};


// Create message element and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
  
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }]
    });
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            contents: chatHistory
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Display response
        const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\\(.?)\\*/g, '<strong>$1</strong>').trim();
        
        messageElement.innerText = apiResponseText;
// add bot response to history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResponseText }]
        });
    } catch (error) {
        console.error(error);
        messageElement.innerText = "Sorry, I encountered an error. Please try again.";
        messageElement.style.color = "red";
    } finally {
        incomingMessageDiv.classList.remove("thinking");
        scrollToBottom(); // Scroll after bot responds
    }
};
if (chatHistory.length === 0) {
    // Add initial context messages to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: "remember, if someone ask a question , who is amos remember that he use google api to deploy you in this chat bot web , so he is the developer of this chat bot web , and his github link is `https://github.com/amosrid/` currently he is a undergraduate student at Universitas Kristen Surakarta, if someone ask a question answer with your own languange" }]
    });
    
    chatHistory.push({
        role: "user",
        parts: [{ text: "from now i want you to be expert in javascript languange , act like u a senior developer with experince more than 10 years, and you want to teach your junior intern developer about the js and the other framework and i want to call u with mr bard" }]
    });
    chatHistory.push({
        role: "user",
        parts: [{ text: `now give me a simple greeting from you , and just relax` }]
    });

    // Generate and display initial greeting
    const generateInitialGreeting = async () => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: chatHistory
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message);

            const initialGreeting = data.candidates[0].content.parts[0].text
                .replace(/\\(.?)\\*/g, '<strong>$1</strong>')
                .trim();

            // Display the greeting
            greetingMessage.innerText = initialGreeting;

            // Add bot response to chat history
            chatHistory.push({
                role: "model",
                parts: [{ text: initialGreeting }]
            });
        } catch (error) {
            console.error('Error generating initial greeting:', error);
            greetingMessage.innerText = "Hello! How can I assist you today?";
            greetingMessage.style.color = "red";
        }
    };

    generateInitialGreeting()
}
// Handle outgoing message
const handleOutgoingMessage = async (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return; // Don't send empty messages
    
    userData.message = message;
    messageInput.value = "";

    // Create and display user message
    const messageContent = `<div class="message-text">${userData.message}</div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    scrollToBottom();

   
    
    const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
    
    // Small delay before showing bot response
    setTimeout(() => {
        chatBody.appendChild(incomingMessageDiv);
        scrollToBottom();
        generateBotResponse(incomingMessageDiv);
    }, 500);
};

// Event Listeners
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        const userMessage = e.target.value.trim();
        if (userMessage) {
            handleOutgoingMessage(e);
        }
    }
});

sendMessageButton.addEventListener("click", handleOutgoingMessage);

// Initial scroll to bottom when page loads
scrollToBottom();