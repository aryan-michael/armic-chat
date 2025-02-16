import React, { useState } from 'react';

function RoomCreation({ socket }) {  // Receive the socket and callback
  const [roomName, setRoomName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateRoom = () => {
    if (!roomName) {
      setErrorMessage("Room name cannot be empty.");
      return;
    }
    socket.emit('createRoom', roomName); // Send the 'createRoom' event to the server
    setRoomName(''); // Clear the input
    setErrorMessage(''); // Clear any previous errors
  };

  return (
    <div>
      <h2>Create Room</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <input
        type="text"
        placeholder="Room Name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>
    </div>
  );
}

export default RoomCreation;