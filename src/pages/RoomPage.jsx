import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import VideoGrid from '../components/VideoGrid';
import Controls from '../components/Controls';
import ChatBox from '../components/ChatBox';
import ParticipantList from '../components/ParticipantList';

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
    const newSocket = io('http://localhost:5003');
    setSocket(newSocket);

    // Get local media stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join room
        newSocket.emit('join-room', {
          roomId,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });

        newSocket.on('room-users', (users) => {
          setParticipants(users);
        });

        newSocket.on('user-joined', (data) => {
          setParticipants(prev => [...prev, data]);
        });

        newSocket.on('user-left', (data) => {
          setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
          if (peerConnections.current[data.socketId]) {
            peerConnections.current[data.socketId].close();
            delete peerConnections.current[data.socketId];
            setPeers(prev => prev.filter(p => p.socketId !== data.socketId));
          }
        });

        // Chat events
        newSocket.on('receive-message', (data) => {
          setMessages(prev => [...prev, data]);
        });

        // Media control events
        newSocket.on('user-toggled-video', (data) => {
          setPeers(prev => prev.map(peer => 
            peer.socketId === data.socketId 
              ? { ...peer, videoEnabled: data.videoEnabled }
              : peer
          ));
        });

        newSocket.on('user-toggled-audio', (data) => {
          setPeers(prev => prev.map(peer => 
            peer.socketId === data.socketId 
              ? { ...peer, audioEnabled: data.audioEnabled }
              : peer
          ));
        });

        newSocket.on('user-sharing-screen', (data) => {
          setPeers(prev => prev.map(peer => 
            peer.socketId === data.socketId 
              ? { ...peer, screenSharing: data.isSharing }
              : peer
          ));
        });

      })
      .catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera and microphone. Please check permissions.');
      });

    return () => {
      newSocket.close();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // Close all peer connections
      Object.values(peerConnections.current).forEach(peer => peer.close());
    };
  }, [roomId, user]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
        socket.emit('toggle-video', {
          roomId,
          videoEnabled: !videoEnabled
        });
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
        socket.emit('toggle-audio', {
          roomId,
          audioEnabled: !audioEnabled
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenStreamRef.current = screenStream;
        setScreenSharing(true);
        
        socket.emit('share-screen', {
          roomId,
          isSharing: true
        });

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    setScreenSharing(false);
    socket.emit('share-screen', {
      roomId,
      isSharing: false
    });
  };

  const sendMessage = (message) => {
    const messageData = {
      roomId,
      user: {
        id: user.id,
        name: user.name
      },
      message
    };
    socket.emit('send-message', messageData);
    setMessages(prev => [...prev, {
      ...messageData,
      timestamp: new Date().toISOString()
    }]);
  };

  const leaveRoom = () => {
    navigate('/');
  };

  const allStreams = [
    {
      socketId: 'local',
      stream: localStream,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
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
    <div className={`flex-1 p-4 transition-all duration-300 ${
      showChat || showParticipants ? 'w-3/4' : 'w-full'
    }`}>
      <VideoGrid streams={allStreams} localVideoRef={localVideoRef} />
    </div>
    {/* Side Panels (Chat / Participants) */}
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

  {/* Bottom Controls */}
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