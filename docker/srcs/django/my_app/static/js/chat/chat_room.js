import Component from "../spa/component.js"

class ChatRoom extends Component
{
    constructor()
    {
        super('static/html/chat_room.html')
    }
    onInit() {
        this.getElements(0)
    }
    
    getElements(attempts) {
        const chatLog = document.getElementById('chat-log')
        const messageInput = document.getElementById('chat-message-input')
        const submitButton = document.getElementById('chat-message-submit')
        
        if (!chatLog || !messageInput || !submitButton) {
            if (attempts < 5) {
                setTimeout(() => this.getElements(attempts + 1), 300)
            }
            return
        }
        
        this.setupChat(chatLog, messageInput, submitButton)
    }
    
    setupChat(chatLog, messageInput, submitButton) {
        const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat_room/`)
        
        chatSocket.onopen = function() {
            console.log('Chat socket open')
        }
        
        chatSocket.onerror = function(e) {
            console.error('Chat socket error:', e)
        }
        
        chatSocket.onclose = function(e) {
            console.log('Chat socket closed:', e.code, e.reason)
        }
        
        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data)
            const messageDiv = document.createElement('div')
            const metaSpan = document.createElement('span')
            metaSpan.style.fontWeight = 'bold'
            metaSpan.textContent = `${data.user} (${data.timestamp}): `
            messageDiv.appendChild(metaSpan)
            messageDiv.appendChild(document.createTextNode(data.message))
            chatLog.appendChild(messageDiv)
            chatLog.scrollTop = chatLog.scrollHeight
        }
        
        function sendMessage() {
            const message = messageInput.value
            if (message) {
                chatSocket.send(JSON.stringify({message: message}))
                messageInput.value = ''
            }
        }
        
        submitButton.onclick = sendMessage
        messageInput.onkeyup = function(e) {
            if (e.key === 'Enter') sendMessage()
        }
    }
}

export default ChatRoom;