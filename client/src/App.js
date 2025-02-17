import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RoomCreation from './RoomCreation';
import RoomJoining from './RoomJoining';
import Chatroom from './Chatroom';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openRooms, setOpenRooms] = useState([]);

  useEffect(() => {
    // test comment
    // const newSocket = io('http://localhost:5001');
    const newSocket = io(process.env.REACT_APP_SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('roomCreated', (room) => {
      setRoomName(room);
      setInRoom(true);
      setErrorMessage('');
    });

    newSocket.on('roomJoined', () => {
      setInRoom(true);
      setErrorMessage('');
    });

    newSocket.on('roomExistsError', (message) => {
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    });

    newSocket.on('roomNotFoundError', (message) => {
      setErrorMessage(message);
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    });

    newSocket.on('updateRooms', (rooms) => {
      setOpenRooms(rooms);
    });

    newSocket.on('connect', () => {
      updateOpenRooms();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const updateOpenRooms = () => {
    if (socket) {
      socket.emit('getOpenRooms');
    }
  };

  const handleJoinRoom = (room) => {
    setRoomName(room);
  };

  const handleLeaveRoom = () => {
    setInRoom(false);
    setRoomName('');
    if (socket) {
      updateOpenRooms();
    }
  };

  return (
    <div className="App">
      <h1>Armic Chat</h1>
      <h2>Open Rooms</h2>
      <ul>
        {openRooms.map((room) => (
          <li key={room}>{room}</li>
        ))}
      </ul>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {!inRoom ? (
        <>
          {socket && <RoomCreation socket={socket} />}
          {socket && <RoomJoining socket={socket} onJoinRoom={handleJoinRoom} />}
        </>
      ) : (
        <Chatroom socket={socket} roomName={roomName} onLeaveRoom={handleLeaveRoom} />
      )}
    </div>
  );
}

export default App;