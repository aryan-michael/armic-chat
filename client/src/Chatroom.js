// import React, { useState, useEffect } from 'react';

// function Chatroom(props) {
//   const { socket, roomName, onLeaveRoom } = props;
//   const [alias, setAlias] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [aliasSet, setAliasSet] = useState(false);

//   useEffect(() => {
//     // Listen for incoming messages from the server
//     socket.on('receiveMessage', (newMessage) => {
//       setMessages((prevMessages) => [...prevMessages, newMessage]);
//     });

//     return () => {
//       socket.off('receiveMessage');
//     };
//   }, [socket]);

//   useEffect(() => {
//     socket.on('roomJoined', (initialData) => {
//       setMessages(initialData.messages);
//     });
//   }, [socket]);

//   const handleSendMessage = (e) => {
//     e.preventDefault();
//     if (message && alias) {
//       socket.emit('sendMessage', { roomName: roomName, alias: alias, message: message });
//       setMessage('');
//     }
//   };

//   const handleSetAlias = (e) => {
//     e.preventDefault();
//     if (alias) {
//       socket.emit('setAlias', alias);
//       setAliasSet(true);
//     }
//   };

//   const handleLeaveRoom = () => {
//     socket.emit('leaveRoom', roomName);
//     onLeaveRoom();
//   };

//   if (!aliasSet) {
//     return (
//       <div>
//         <h2>Chatroom: {roomName}</h2>
//         <form onSubmit={handleSetAlias}>
//           <input
//             type="text"
//             placeholder="Enter your alias"
//             value={alias}
//             onChange={(e) => setAlias(e.target.value)}
//           />
//           <button type="submit">Set Alias</button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2>Chatroom: {roomName}</h2>
//       <div className="messages">
//         {messages.map((msg, index) => (
//           <div key={index}>
//             <strong>{msg.alias}:</strong> {msg.message}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleSendMessage}>
//         <input
//           type="text"
//           placeholder="Enter your message"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//         />
//         <button type="submit">Send</button>
//       </form>
//       <button onClick={handleLeaveRoom}>Leave Room</button>
//     </div>
//   );
// }

// export default Chatroom;


import React, { useState, useEffect, useRef } from 'react';
import './Chatroom.css'; // Import the CSS file

function Chatroom(props) {
  const { socket, roomName, onLeaveRoom } = props;
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [aliasSet, setAliasSet] = useState(false);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

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
    // Auto-scroll to the latest message
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
          let messageClass = "message left"; // Default: left-aligned

          if (msg.alias === "System") {
            messageClass = "message system"; // Center-aligned for system messages
          } else if (msg.alias === alias) {
            messageClass = "message right"; // Right-aligned for the current user's messages
          }

          return (
            <div key={index} className={messageClass}>
              <strong>{msg.alias}:</strong> {msg.message}
            </div>
          );
        })}
        <div ref={messagesEndRef} /> {/* Empty div for auto-scroll target */}
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
