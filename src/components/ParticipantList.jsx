import React from 'react';

const ParticipantList = ({ participants, onClose }) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700">
      {/* Header */}
      <div className="bg-gray-700 px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h3 className="font-medium">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="max-h-80 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No participants in the room
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {participants.map((participant) => (
              <div key={participant.socketId} className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium">
                    {participant.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {participant.user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {participant.user.email}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantList;
