import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import VideoGrid from '../components/VideoGrid';
import Controls from '../components/Controls';
import ChatBox from '../components/ChatBox';
import ParticipantList from '../components/ParticipantList';

// ✅ Load backend API base URL from .env
const API_URL = import.meta.env.VITE_API_URL;

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [socket, setSocket] = useState(null);
  const [peers, setPeers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);

  const localVideoRef = useRef();
  const screenStreamRef = useRef();
  const peerConnections = useRef({});

useEffect(() => {
  const socketURL = API_URL?.replace(/\/$/, '') || 'http://localhost:5003';
  const newSocket = io(socketURL, { transports: ['websocket', 'polling'], withCredentials: true });
  setSocket(newSocket);

  newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
  newSocket.on('connect_error', (err) => console.error('Socket connection error:', err));
  newSocket.on('disconnect', () => console.log('Socket disconnected'));

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      newSocket.emit('join-room', {
        roomId,
        user: { id: user?.id, name: user?.name, email: user?.email }
      });

      newSocket.on('room-users', setParticipants);
      newSocket.on('user-joined', data => setParticipants(prev => [...prev, data]));
      newSocket.on('user-left', data => {
        setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
        if (peerConnections.current[data.socketId]) {
          peerConnections.current[data.socketId].close();
          delete peerConnections.current[data.socketId];
          setPeers(prev => prev.filter(p => p.socketId !== data.socketId));
        }
      });

      newSocket.on('receive-message', data => setMessages(prev => [...prev, data]));
      newSocket.on('user-toggled-video', data => setPeers(prev => prev.map(p =>
        p.socketId === data.socketId ? { ...p, videoEnabled: data.videoEnabled } : p
      )));
      newSocket.on('user-toggled-audio', data => setPeers(prev => prev.map(p =>
        p.socketId === data.socketId ? { ...p, audioEnabled: data.audioEnabled } : p
      )));
      newSocket.on('user-sharing-screen', data => setPeers(prev => prev.map(p =>
        p.socketId === data.socketId ? { ...p, screenSharing: data.isSharing } : p
      )));
    })
    .catch(error => {
      console.error('Error accessing camera/mic:', error);
      alert('Could not access your camera or microphone. Please check permissions.');
    });

  return () => {
    if (newSocket) {
      newSocket.off();
      newSocket.disconnect();
    }
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
    Object.values(peerConnections.current).forEach(pc => pc.close());
  };
}, [roomId, user]);


  // ✅ Toggle video
  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
      socket?.emit('toggle-video', { roomId, videoEnabled: !videoEnabled });
    }
  };

  // ✅ Toggle audio
  const toggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
      socket?.emit('toggle-audio', { roomId, audioEnabled: !audioEnabled });
    }
  };

  // ✅ Screen sharing
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = screenStream;
        setScreenSharing(true);
        socket?.emit('share-screen', { roomId, isSharing: true });

        screenStream.getVideoTracks()[0].onended = stopScreenShare;
      } catch (err) {
        console.error('Error starting screen share:', err);
      }
    } else stopScreenShare();
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current = null;
    setScreenSharing(false);
    socket?.emit('share-screen', { roomId, isSharing: false });
  };

  // ✅ Chat
  const sendMessage = (message) => {
    const data = {
      roomId,
      user: { id: user?.id, name: user?.name },
      message
    };
    socket?.emit('send-message', data);
    setMessages(prev => [...prev, { ...data, timestamp: new Date().toISOString() }]);
  };

  // ✅ Leave room
  const leaveRoom = () => {
    navigate('/');
  };

  const allStreams = [
    {
      socketId: 'local',
      stream: localStream,
      user: { id: user?.id, name: user?.name, email: user?.email },
      videoEnabled,
      audioEnabled,
      screenSharing
    },
    ...peers
  ];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div
          className={`flex-1 p-4 transition-all duration-300 ${
            showChat || showParticipants ? 'w-3/4' : 'w-full'
          }`}
        >
          <VideoGrid streams={allStreams} localVideoRef={localVideoRef} />
        </div>

        {/* Side Panels */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-gray-800 text-white flex flex-col space-y-4 p-4 overflow-y-auto">
            {showParticipants && (
              <ParticipantList
                participants={participants}
                onClose={() => setShowParticipants(false)}
              />
            )}
            {showChat && (
              <ChatBox
                messages={messages}
                onSendMessage={sendMessage}
                onClose={() => setShowChat(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <Controls
          videoEnabled={videoEnabled}
          audioEnabled={audioEnabled}
          screenSharing={screenSharing}
          onToggleVideo={toggleVideo}
          onToggleAudio={toggleAudio}
          onToggleScreenShare={toggleScreenShare}
          onToggleChat={() => setShowChat(!showChat)}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
          onLeaveRoom={leaveRoom}
        />
      </div>
    </div>
  );
};

export default RoomPage;
