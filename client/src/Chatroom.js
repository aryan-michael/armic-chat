import React, { useState, useEffect, useRef } from 'react';
import './Chatroom.css';

function Chatroom(props) {
  const { socket, roomName, onLeaveRoom } = props;
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [aliasSet, setAliasSet] = useState(false);
  const messagesEndRef = useRef(null); // auto-scrolling

  useEffect(() => {
    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [socket]);

  useEffect(() => {
    socket.on('roomJoined', (initialData) => {
      setMessages(initialData.messages);
    });

    return () => {
      socket.off('roomJoined');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message && alias) {
      socket.emit('sendMessage', { roomName: roomName, alias: alias, message: message });
      setMessage('');
    }
  };

  const handleSetAlias = (e) => {
    e.preventDefault();
    if (alias) {
      socket.emit('setAlias', alias);
      setAliasSet(true);
    }
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', roomName);
    onLeaveRoom();
  };

  if (!aliasSet) {
    return (
      <div className="chatroom">
        <h2>Chatroom: {roomName}</h2>
        <form onSubmit={handleSetAlias}>
          <input
            type="text"
            placeholder="Enter your alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <button type="submit">Set Alias</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chatroom">
      <h2>Chatroom: {roomName}</h2>
      <div className="messages">
        {messages.map((msg, index) => {
          let messageClass = "message left";

          if (msg.alias === "System") {
            messageClass = "message system"; 
          } else if (msg.alias === alias) {
            messageClass = "message right";
          }

          return (
            <div key={index} className={messageClass}>
              <strong>{msg.alias}:</strong> {msg.message}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="submit-button" type="submit">Send</button>
      </form>
      <button className="leave-button" onClick={handleLeaveRoom}>Leave Room</button>
    </div>
  );
}

export default Chatroom;