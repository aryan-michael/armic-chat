import React, { useState } from 'react';

function RoomJoining({ socket, onJoinRoom }) {
  const [roomName, setRoomName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleJoinRoom = () => {
     if (!roomName) {
      setErrorMessage("Room name cannot be empty.");
      return;
    }
    socket.emit('joinRoom', roomName);
    onJoinRoom(roomName);
    setRoomName('');
    setErrorMessage('');
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