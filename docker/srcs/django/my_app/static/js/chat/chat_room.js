import Component from "../spa/component.js"
import Route from "../spa/route.js"

class ChatRoom extends Component
{
    constructor()
    {
        super('static/html/chat_room.html')
    }
    onInit()
    {
        const chatLog = document.getElementById('chat-log')
        const messageInput = document.getElementById('chat-message-input')
        const submitButton = document.getElementById('chat-message-submit')
        const chatSocket = new WebSocket(`ws://localhost:8000/ws/chat_room/`);
        chatSocket.onopen = function() {
            console.log('chat socket open');
        }
        chatSocket.onmessage = function(e)
        {
            const data = JSON.parse(e.data);
            displayMessage(data.user, data.timestamp, data.message);
        }
        function displayMessage(user, timestamp, message) {
            const messageDiv = document.createElement('div');
            const metaSpan = document.createElement('span');
            const metaInfo = document.createTextNode(`${user} (${timestamp}): `);
            metaSpan.style.fontWeight = 'bold';
            metaSpan.appendChild(metaInfo);
            const messageNode = document.createTextNode(message);
            messageDiv.appendChild(metaSpan);
            messageDiv.appendChild(messageNode);
            chatLog.appendChild(messageDiv);
            chatLog.scrollTop = chatLog.scrollHeight;
        }
        function sendMessage() 
        {
            const message = messageInput.value;
            const username = "You";
            const timestamp = new Date().toLocaleString();
            if (message) {
                displayMessage(username, timestamp, message);
                chatSocket.send(JSON.stringify({message: message}));
                messageInput.value = '';
            }
        }
        submitButton.onclick = sendMessage;
        messageInput.onkeyup = function(e)
        {
            if (e.key == 'Enter') sendMessage();
        };
    }
}

export default ChatRoom;