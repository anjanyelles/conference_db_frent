import React from 'react';
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaDesktop,
  FaComments,
  FaUsers,
  FaSignOutAlt
} from "react-icons/fa";

const Controls = ({
  videoEnabled,
  audioEnabled,
  screenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onLeaveRoom
}) => {
  return (
    <div className="flex justify-center items-center space-x-6">
      {/* Video */}
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full transition ${
          videoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white'
        }`}
      >
        {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
      </button>

      {/* Audio */}
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full transition ${
          audioEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white'
        }`}
      >
        {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-full transition ${
          screenSharing ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      >
        <FaDesktop />
      </button>

      {/* Chat */}
      <button
        onClick={onToggleChat}
        className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600"
      >
        <FaComments />
      </button>

      {/* Participants */}
      <button
        onClick={onToggleParticipants}
        className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600"
      >
        <FaUsers />
      </button>

      {/* Leave Room */}
      <button
        onClick={onLeaveRoom}
        className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700"
      >
        <FaSignOutAlt />
      </button>
    </div>
  );
};

export default Controls;
