// src/RoomJoining.js
import React, { useState } from 'react';

function RoomJoining({ socket, onJoinRoom }) {  // Receive the socket and callback
  const [roomName, setRoomName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinRoom = () => {
     if (!roomName) {
      setErrorMessage("Room name cannot be empty.");
      return;
    }
    socket.emit('joinRoom', roomName); // Send the 'joinRoom' event to the server
    onJoinRoom(roomName); // Callback to update roomName in App.js
    setRoomName(''); // Clear the input
    setErrorMessage(''); // Clear any previous errors
  };

  return (
    <div>
      <h2>Join Room</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
}

export default RoomJoining;